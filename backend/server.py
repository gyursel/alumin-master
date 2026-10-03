from fastapi import (
    FastAPI, APIRouter, HTTPException, Depends, Request, Response,
    UploadFile, File, Form,
)
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from starlette.responses import Response as StarletteResponse, RedirectResponse
from motor.motor_asyncio import AsyncIOMotorClient
import os
import re
import ipaddress
import logging
import secrets
import base64
import httpx
from html import escape
from html.parser import HTMLParser
from urllib.parse import urlparse
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from passlib.context import CryptContext
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")

ADMIN_EMAILS = {
    e.strip().lower()
    for e in os.environ.get("ADMIN_EMAILS", "georgiivanov421@gmail.com").split(",")
    if e.strip()
}
SESSION_DAYS = 7
EMERGENT_AUTH_URL = "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data"


def is_admin_email(email: str) -> bool:
    return (email or "").lower() in ADMIN_EMAILS


# ---------------------------------------------------------------------------
# Email (Emergent managed Resend integration)
# ---------------------------------------------------------------------------
EMAIL_BASE_URL = "https://integrations.emergentagent.com"
EMAIL_KEY = os.environ.get("EMERGENT_EMAIL_KEY")
EMAIL_FROM_NAME = os.environ.get("EMAIL_FROM_NAME", "Дограма Добрич")
NOTIFY_EMAIL = os.environ.get("NOTIFY_EMAIL", "georgiivanov421@gmail.com")

_SHORTENERS = ("bit.ly", "tinyurl.com", "t.co", "is.gd", "cutt.ly", "goo.gl", "rebrand.ly")
_CRED_ASK = ("reply with your password", "reply with the code", "send your password", "cvv",
             "send us your password", "enter your password below", "confirm your card number",
             "your full card number", "seed phrase", "recovery phrase", "verify your card",
             "social security number", "confirm your bank details")
_HOSTISH = re.compile(r"\b(?:https?://)?((?:[a-z0-9-]+\.)+[a-z]{2,})", re.I)


def _host_ok(host: str) -> bool:
    if not host or "xn--" in host:
        return False
    try:
        ipaddress.ip_address(host)
        return False
    except ValueError:
        pass
    return not any(host == s or host.endswith("." + s) for s in _SHORTENERS)


def _same_site(shown: str, real: str) -> bool:
    return shown == real or real.endswith("." + shown) or shown.endswith("." + real)


class _EmailScan(HTMLParser):
    def __init__(self):
        super().__init__()
        self.tags, self.urls, self.anchors = set(), [], []
        self._href, self._text = None, []

    def handle_starttag(self, tag, attrs):
        self.tags.add(tag.lower())
        self.urls += [v for k, v in attrs if k.lower() in ("href", "src") and v]
        if tag.lower() == "a":
            self._href = dict((k.lower(), v) for k, v in attrs).get("href")
            self._text = []

    def handle_data(self, data):
        if self._href is not None:
            self._text.append(data)

    def handle_endtag(self, tag):
        if tag.lower() == "a" and self._href is not None:
            self.anchors.append((self._href, "".join(self._text)))
            self._href, self._text = None, []


def _assert_safe_email(subject: str, html: str) -> None:
    scan = _EmailScan()
    scan.feed(html)
    if scan.tags & {"form", "input", "textarea", "select"}:
        raise ValueError("No forms or input fields in email (G2)")
    body = f"{subject}\n{html}".lower()
    for p in _CRED_ASK:
        if p in body:
            raise ValueError(f"Email asks the recipient for credentials: {p!r} (G2)")
    for url in scan.urls:
        low = url.strip().lower()
        if low.startswith(("mailto:", "tel:", "cid:", "#")):
            continue
        if not low.startswith("https://"):
            raise ValueError(f"Email links/assets must be absolute https: {url!r} (G3)")
        host = urlparse(low).hostname or ""
        if not _host_ok(host) or urlparse(low).username is not None:
            raise ValueError(f"Shortened, numeric-host or credential-bearing URL: {url!r} (G3)")
    for href, text in scan.anchors:
        real = urlparse(href.strip().lower()).hostname or ""
        if not real:
            continue
        for m in _HOSTISH.finditer(text):
            if not _same_site(m.group(1).lower(), real):
                raise ValueError(f"Anchor text {m.group(1)!r} != real link host {real!r} (G3)")


async def send_email(*, to: str, subject: str, html: str) -> Optional[str]:
    _assert_safe_email(subject, html)
    if not EMAIL_KEY:
        logger.error("EMERGENT_EMAIL_KEY not configured")
        raise HTTPException(status_code=500, detail="Email not configured")
    payload = {"to": [to], "subject": subject, "html": html, "from_name": EMAIL_FROM_NAME}
    try:
        async with httpx.AsyncClient(timeout=30) as http_client:
            resp = await http_client.post(
                f"{EMAIL_BASE_URL}/api/v1/email/send",
                headers={"X-Email-Key": EMAIL_KEY},
                json=payload,
            )
        resp.raise_for_status()
        return resp.json().get("id")
    except httpx.HTTPStatusError as e:
        logger.error(f"Email send failed: {e.response.status_code} {e.response.text}")
        raise HTTPException(status_code=502, detail="Failed to send email")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Email send error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to send email")


def _build_inquiry_email(inq: "Inquiry") -> str:
    rows = [
        ("Имена", inq.name),
        ("Телефон", inq.phone),
        ("Email", inq.email or "—"),
        ("Интерес към", inq.service or "—"),
        ("Съобщение", inq.message or "—"),
    ]
    row_html = "".join(
        f'<tr><td style="padding:8px 12px;font-weight:bold;color:#333;'
        f'border-bottom:1px solid #eee;vertical-align:top;white-space:nowrap">{escape(label)}</td>'
        f'<td style="padding:8px 12px;color:#111;border-bottom:1px solid #eee">{escape(str(value))}</td></tr>'
        for label, value in rows
    )
    return (
        '<table role="presentation" width="100%" style="max-width:600px;margin:0 auto;'
        'font-family:Arial,Helvetica,sans-serif;background:#ffffff;border:1px solid #eee;'
        'border-radius:8px;overflow:hidden">'
        '<tr><td style="background:#0a0a0b;padding:20px 24px">'
        f'<span style="color:#c9a15a;font-size:18px;font-weight:bold">{escape(EMAIL_FROM_NAME)}</span>'
        '<div style="color:#a1a1a6;font-size:12px;margin-top:4px">Ново запитване от сайта</div>'
        '</td></tr>'
        '<tr><td style="padding:24px">'
        '<p style="color:#333;font-size:14px;margin:0 0 16px">Получено е ново запитване за оферта:</p>'
        f'<table role="presentation" width="100%" style="border-collapse:collapse;font-size:14px">{row_html}</table>'
        '</td></tr>'
        '<tr><td style="padding:16px 24px;background:#fafafa;color:#888;font-size:12px">'
        f'Изпратено от {escape(EMAIL_FROM_NAME)}. Никога не искаме пароли или данни за карта по имейл.'
        '</td></tr>'
        '</table>'
    )


# ---------------------------------------------------------------------------
# Models
# ---------------------------------------------------------------------------
class InquiryCreate(BaseModel):
    name: str
    phone: str
    email: Optional[str] = ""
    service: Optional[str] = ""
    message: Optional[str] = ""


class Inquiry(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    phone: str
    email: Optional[str] = ""
    service: Optional[str] = ""
    message: Optional[str] = ""
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class User(BaseModel):
    user_id: str
    email: str
    name: str
    picture: Optional[str] = ""
    provider: str = "email"
    is_admin: bool = False


class RegisterInput(BaseModel):
    email: EmailStr
    password: str
    name: str


class LoginInput(BaseModel):
    email: EmailStr
    password: str


class SessionInput(BaseModel):
    session_id: str


class GalleryItem(BaseModel):
    id: str
    title: str
    category: str
    url: str
    created_at: datetime


# ---------------------------------------------------------------------------
# Auth helpers
# ---------------------------------------------------------------------------
def _set_session_cookie(response: Response, token: str):
    response.set_cookie(
        key="session_token",
        value=token,
        httponly=True,
        secure=True,
        samesite="none",
        path="/",
        max_age=SESSION_DAYS * 24 * 3600,
    )


async def _create_session(user_id: str) -> str:
    token = secrets.token_urlsafe(32)
    await db.user_sessions.insert_one({
        "user_id": user_id,
        "session_token": token,
        "expires_at": datetime.now(timezone.utc) + timedelta(days=SESSION_DAYS),
        "created_at": datetime.now(timezone.utc),
    })
    return token


def _extract_token(request: Request) -> Optional[str]:
    token = request.cookies.get("session_token")
    if token:
        return token
    auth = request.headers.get("Authorization") or ""
    if auth.lower().startswith("bearer "):
        return auth[7:].strip()
    return None


async def get_current_user(request: Request) -> User:
    token = _extract_token(request)
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    session = await db.user_sessions.find_one({"session_token": token}, {"_id": 0})
    if not session:
        raise HTTPException(status_code=401, detail="Invalid session")
    expires_at = session["expires_at"]
    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at)
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=401, detail="Session expired")
    user_doc = await db.users.find_one({"user_id": session["user_id"]}, {"_id": 0})
    if not user_doc:
        raise HTTPException(status_code=401, detail="User not found")
    return User(
        user_id=user_doc["user_id"],
        email=user_doc["email"],
        name=user_doc.get("name", ""),
        picture=user_doc.get("picture", ""),
        provider=user_doc.get("provider", "email"),
        is_admin=is_admin_email(user_doc["email"]),
    )


async def get_admin_user(request: Request) -> User:
    user = await get_current_user(request)
    if not user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    return user


# ---------------------------------------------------------------------------
# Auth routes
# ---------------------------------------------------------------------------
@api_router.post("/auth/register")
async def register(payload: RegisterInput, response: Response):
    email = payload.email.lower().strip()
    existing = await db.users.find_one({"email": email}, {"_id": 0})
    if existing and existing.get("password_hash"):
        raise HTTPException(status_code=400, detail="Този имейл вече е регистриран.")
    if len(payload.password) < 6:
        raise HTTPException(status_code=400, detail="Паролата трябва да е поне 6 символа.")

    if existing:
        user_id = existing["user_id"]
        await db.users.update_one(
            {"user_id": user_id},
            {"$set": {"password_hash": pwd_context.hash(payload.password),
                      "name": payload.name}},
        )
    else:
        user_id = f"user_{uuid.uuid4().hex[:12]}"
        await db.users.insert_one({
            "user_id": user_id,
            "email": email,
            "name": payload.name,
            "picture": "",
            "provider": "email",
            "password_hash": pwd_context.hash(payload.password),
            "created_at": datetime.now(timezone.utc),
        })
    token = await _create_session(user_id)
    _set_session_cookie(response, token)
    return {"success": True, "user": {
        "user_id": user_id, "email": email, "name": payload.name,
        "picture": "", "provider": "email", "is_admin": is_admin_email(email),
    }, "session_token": token}


@api_router.post("/auth/login")
async def login(payload: LoginInput, response: Response):
    email = payload.email.lower().strip()
    user_doc = await db.users.find_one({"email": email}, {"_id": 0})
    if not user_doc or not user_doc.get("password_hash"):
        raise HTTPException(status_code=401, detail="Грешен имейл или парола.")
    if not pwd_context.verify(payload.password, user_doc["password_hash"]):
        raise HTTPException(status_code=401, detail="Грешен имейл или парола.")
    token = await _create_session(user_doc["user_id"])
    _set_session_cookie(response, token)
    return {"success": True, "user": {
        "user_id": user_doc["user_id"], "email": email, "name": user_doc.get("name", ""),
        "picture": user_doc.get("picture", ""), "provider": user_doc.get("provider", "email"),
        "is_admin": is_admin_email(email),
    }, "session_token": token}


@api_router.post("/auth/session")
async def google_session(payload: SessionInput, response: Response):
    """Exchange Emergent OAuth session_id for a persistent session."""
    try:
        async with httpx.AsyncClient(timeout=30) as http_client:
            resp = await http_client.get(
                EMERGENT_AUTH_URL,
                headers={"X-Session-ID": payload.session_id},
            )
        resp.raise_for_status()
        data = resp.json()
    except Exception as e:
        logger.error(f"Google session exchange failed: {e}")
        raise HTTPException(status_code=401, detail="Неуспешно удостоверяване с Google.")

    email = (data.get("email") or "").lower().strip()
    name = data.get("name") or ""
    picture = data.get("picture") or ""
    emergent_token = data.get("session_token")

    existing = await db.users.find_one({"email": email}, {"_id": 0})
    if existing:
        user_id = existing["user_id"]
        await db.users.update_one(
            {"user_id": user_id},
            {"$set": {"name": name or existing.get("name", ""),
                      "picture": picture or existing.get("picture", "")}},
        )
    else:
        user_id = f"user_{uuid.uuid4().hex[:12]}"
        await db.users.insert_one({
            "user_id": user_id,
            "email": email,
            "name": name,
            "picture": picture,
            "provider": "google",
            "created_at": datetime.now(timezone.utc),
        })

    token = emergent_token or secrets.token_urlsafe(32)
    await db.user_sessions.insert_one({
        "user_id": user_id,
        "session_token": token,
        "expires_at": datetime.now(timezone.utc) + timedelta(days=SESSION_DAYS),
        "created_at": datetime.now(timezone.utc),
    })
    _set_session_cookie(response, token)
    return {"success": True, "user": {
        "user_id": user_id, "email": email, "name": name, "picture": picture,
        "provider": "google", "is_admin": is_admin_email(email),
    }}


@api_router.get("/auth/me", response_model=User)
async def auth_me(user: User = Depends(get_current_user)):
    return user


@api_router.post("/auth/logout")
async def logout(request: Request, response: Response):
    token = _extract_token(request)
    if token:
        await db.user_sessions.delete_one({"session_token": token})
    response.delete_cookie("session_token", path="/")
    return {"success": True}


@api_router.get("/auth/dev-login")
async def dev_login(request: Request):
    """САМО ЗА ЛОКАЛНА РАЗРАБОТКА: автоматичен вход като админ.
    Изключено е, освен ако бекендът е стартиран с DEV_AUTO_LOGIN=1 (прави го start-local.command),
    и работи само за заявки от самия компютър (localhost, без proxy)."""
    host = (request.headers.get("host") or "").split(":")[0]
    peer = request.client.host if request.client else ""
    if (
        os.environ.get("DEV_AUTO_LOGIN") != "1"
        or not ADMIN_EMAILS
        or host not in ("localhost", "127.0.0.1")
        or peer not in ("127.0.0.1", "::1")
        or request.headers.get("x-forwarded-for")
    ):
        raise HTTPException(status_code=404, detail="Not found")

    email = sorted(ADMIN_EMAILS)[0]
    user_doc = await db.users.find_one({"email": email}, {"_id": 0})
    if not user_doc:
        user_doc = {
            "user_id": f"user_{uuid.uuid4().hex[:12]}",
            "email": email,
            "name": "Local Admin",
            "picture": "",
            "provider": "dev",
            "created_at": datetime.now(timezone.utc),
        }
        await db.users.insert_one(dict(user_doc))
    token = await _create_session(user_doc["user_id"])

    frontend = os.environ.get("DEV_FRONTEND_URL", "http://localhost:3000").rstrip("/")
    resp = RedirectResponse(url=f"{frontend}/admin")
    # localhost е по HTTP -> без Secure, иначе Safari не запазва cookie-то
    resp.set_cookie(
        key="session_token", value=token, httponly=True, secure=False,
        samesite="lax", path="/", max_age=SESSION_DAYS * 24 * 3600,
    )
    return resp


# ---------------------------------------------------------------------------
# Inquiries
# ---------------------------------------------------------------------------
@api_router.get("/")
async def root():
    return {"message": "Hello World"}


@api_router.post("/inquiries")
async def create_inquiry(payload: InquiryCreate):
    name = (payload.name or "").strip()
    phone = (payload.phone or "").strip()
    if not name or not phone:
        raise HTTPException(status_code=400, detail="Име и телефон са задължителни.")

    inquiry = Inquiry(
        name=name, phone=phone,
        email=(payload.email or "").strip(),
        service=(payload.service or "").strip(),
        message=(payload.message or "").strip(),
    )
    await db.inquiries.insert_one(inquiry.dict())

    email_sent = False
    try:
        subject = f"Ново запитване от {inquiry.name} — {EMAIL_FROM_NAME}"
        html = _build_inquiry_email(inquiry)
        await send_email(to=NOTIFY_EMAIL, subject=subject, html=html)
        email_sent = True
    except Exception as e:
        logger.error(f"Failed to send inquiry notification: {e}")

    return {"success": True, "id": inquiry.id, "email_sent": email_sent}


@api_router.get("/inquiries", response_model=List[Inquiry])
async def get_inquiries(admin: User = Depends(get_admin_user)):
    items = await db.inquiries.find({}, {"_id": 0}).sort("created_at", -1).to_list(200)
    return [Inquiry(**item) for item in items]


@api_router.delete("/inquiries/{inquiry_id}")
async def delete_inquiry(inquiry_id: str, admin: User = Depends(get_admin_user)):
    await db.inquiries.delete_one({"id": inquiry_id})
    return {"success": True}


# ---------------------------------------------------------------------------
# Media & Gallery
# ---------------------------------------------------------------------------
MAX_IMAGE_BYTES = 6 * 1024 * 1024
ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}
# Видео се пази в MongoDB като base64 (лимит на документ 16MB), затова макс. 10MB.
MAX_VIDEO_BYTES = 10 * 1024 * 1024
ALLOWED_VIDEO_TYPES = {"video/mp4", "video/webm"}


@api_router.post("/gallery")
async def upload_gallery(
    file: UploadFile = File(...),
    title: str = Form(...),
    category: str = Form(...),
    admin: User = Depends(get_admin_user),
):
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=400, detail="Разрешени са само изображения (JPG, PNG, WebP, GIF).")
    content = await file.read()
    if len(content) > MAX_IMAGE_BYTES:
        raise HTTPException(status_code=400, detail="Файлът е твърде голям (макс. 6MB).")

    media_id = uuid.uuid4().hex
    await db.media.insert_one({
        "media_id": media_id,
        "content_type": file.content_type,
        "data": base64.b64encode(content).decode("ascii"),
        "created_at": datetime.now(timezone.utc),
    })

    item = {
        "id": uuid.uuid4().hex,
        "title": title.strip() or "Проект",
        "category": category.strip() or "Проекти",
        "media_id": media_id,
        "url": f"/api/media/{media_id}",
        "created_at": datetime.now(timezone.utc),
    }
    await db.gallery.insert_one(item)
    return {"success": True, "item": {
        "id": item["id"], "title": item["title"], "category": item["category"],
        "url": item["url"], "created_at": item["created_at"].isoformat(),
    }}


@api_router.get("/gallery")
async def list_gallery():
    items = await db.gallery.find({}, {"_id": 0, "media_id": 0}).sort("created_at", -1).to_list(200)
    for it in items:
        if isinstance(it.get("created_at"), datetime):
            it["created_at"] = it["created_at"].isoformat()
    return items


@api_router.delete("/gallery/{item_id}")
async def delete_gallery(item_id: str, admin: User = Depends(get_admin_user)):
    item = await db.gallery.find_one({"id": item_id}, {"_id": 0})
    if item:
        await db.media.delete_one({"media_id": item.get("media_id")})
        await db.gallery.delete_one({"id": item_id})
    return {"success": True}


# Малък кеш за декодирани видео файлове: браузърите (особено Safari) пращат много Range заявки,
# а без кеш всяка от тях чете и декодира целия base64 документ от MongoDB.
_VIDEO_CACHE: dict = {}  # media_id -> (content_type, bytes)
_VIDEO_CACHE_MAX = 2


@api_router.get("/media/{media_id}")
async def get_media(media_id: str, request: Request):
    cached = _VIDEO_CACHE.get(media_id)
    if cached:
        media_type, data = cached
    else:
        doc = await db.media.find_one({"media_id": media_id}, {"_id": 0})
        if not doc:
            raise HTTPException(status_code=404, detail="Not found")
        data = base64.b64decode(doc["data"])
        media_type = doc.get("content_type", "image/jpeg")
        if media_type in ALLOWED_VIDEO_TYPES:
            while len(_VIDEO_CACHE) >= _VIDEO_CACHE_MAX:
                _VIDEO_CACHE.pop(next(iter(_VIDEO_CACHE)))
            _VIDEO_CACHE[media_id] = (media_type, data)
    headers = {"Cache-Control": "public, max-age=2592000, immutable", "Accept-Ranges": "bytes", "X-Content-Type-Options": "nosniff"}

    # Range заявки (нужни за възпроизвеждане на видео в Safari/iOS)
    rng = request.headers.get("range")
    if rng and rng.startswith("bytes="):
        total = len(data)
        try:
            start_s, _, end_s = rng[6:].split(",")[0].strip().partition("-")
            if start_s == "":
                start, end = max(total - int(end_s), 0), total - 1
            else:
                start, end = int(start_s), (int(end_s) if end_s else total - 1)
            end = min(end, total - 1)
            if start > end:
                raise ValueError
        except ValueError:
            return StarletteResponse(status_code=416, headers={"Content-Range": f"bytes */{total}"})
        headers["Content-Range"] = f"bytes {start}-{end}/{total}"
        return StarletteResponse(
            content=data[start:end + 1], status_code=206, media_type=media_type, headers=headers,
        )

    return StarletteResponse(content=data, media_type=media_type, headers=headers)


@api_router.post("/media")
async def upload_media(file: UploadFile = File(...), admin: User = Depends(get_admin_user)):
    """Standalone image upload (used by the visual site editor for content images)."""
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=400, detail="Разрешени са само изображения (JPG, PNG, WebP, GIF).")
    content = await file.read()
    if len(content) > MAX_IMAGE_BYTES:
        raise HTTPException(status_code=400, detail="Файлът е твърде голям (макс. 6MB).")
    media_id = uuid.uuid4().hex
    await db.media.insert_one({
        "media_id": media_id,
        "content_type": file.content_type,
        "data": base64.b64encode(content).decode("ascii"),
        "created_at": datetime.now(timezone.utc),
    })
    return {"success": True, "url": f"/api/media/{media_id}"}


@api_router.post("/media/video")
async def upload_video(file: UploadFile = File(...), admin: User = Depends(get_admin_user)):
    """Видео за фон на hero секцията (MP4/WebM, до 10MB)."""
    if file.content_type not in ALLOWED_VIDEO_TYPES:
        raise HTTPException(status_code=400, detail="Разрешени са само видео файлове MP4 или WebM.")
    content = await file.read()
    if len(content) > MAX_VIDEO_BYTES:
        raise HTTPException(status_code=400, detail="Видеото е твърде голямо (макс. 10MB).")
    media_id = uuid.uuid4().hex
    await db.media.insert_one({
        "media_id": media_id,
        "content_type": file.content_type,
        "data": base64.b64encode(content).decode("ascii"),
        "created_at": datetime.now(timezone.utc),
    })
    return {"success": True, "url": f"/api/media/{media_id}"}


# ---------------------------------------------------------------------------
# Video background (hero) - настройка от Admin Panel, пази се в MongoDB (site_settings)
# ---------------------------------------------------------------------------
VIDEO_SETTING_KEY = "video_background"
_MEDIA_URL_RE = re.compile(r"^/api/media/([0-9a-f]{32})$")


class VideoBackgroundUpdate(BaseModel):
    enabled: Optional[bool] = None
    url: Optional[str] = None


async def _delete_video_media(url: Optional[str]) -> None:
    """Трие старото видео от media колекцията (само ако наистина е видео)."""
    m = _MEDIA_URL_RE.match(url or "")
    if not m:
        return
    media_id = m.group(1)
    _VIDEO_CACHE.pop(media_id, None)
    await db.media.delete_one({
        "media_id": media_id,
        "content_type": {"$in": list(ALLOWED_VIDEO_TYPES)},
    })


@api_router.get("/settings/video-background")
async def get_video_background(response: Response):
    doc = await db.site_settings.find_one({"key": VIDEO_SETTING_KEY}, {"_id": 0}) or {}
    response.headers["Cache-Control"] = "no-cache"
    url = doc.get("url") or ""
    return {"enabled": bool(doc.get("enabled")) and bool(url), "url": url or None}


@api_router.put("/settings/video-background")
async def update_video_background(
    payload: VideoBackgroundUpdate, admin: User = Depends(get_admin_user)
):
    doc = await db.site_settings.find_one({"key": VIDEO_SETTING_KEY}, {"_id": 0}) or {}
    old_url = doc.get("url") or ""
    new_url = old_url

    if payload.url is not None:
        candidate = payload.url.strip()
        m = _MEDIA_URL_RE.match(candidate)
        if not m:
            raise HTTPException(status_code=400, detail="Невалиден адрес на видеото.")
        media = await db.media.find_one(
            {"media_id": m.group(1)}, {"_id": 0, "content_type": 1}
        )
        if not media or media.get("content_type") not in ALLOWED_VIDEO_TYPES:
            raise HTTPException(status_code=400, detail="Видеото не е намерено.")
        new_url = candidate

    enabled = bool(doc.get("enabled")) if payload.enabled is None else payload.enabled
    if enabled and not new_url:
        raise HTTPException(status_code=400, detail="Първо качете видео.")

    await db.site_settings.update_one(
        {"key": VIDEO_SETTING_KEY},
        {"$set": {"url": new_url, "enabled": enabled, "updated_at": datetime.now(timezone.utc)}},
        upsert=True,
    )
    if old_url and old_url != new_url:
        await _delete_video_media(old_url)
    return {"success": True, "enabled": enabled, "url": new_url or None}


@api_router.delete("/settings/video-background")
async def delete_video_background(admin: User = Depends(get_admin_user)):
    doc = await db.site_settings.find_one({"key": VIDEO_SETTING_KEY}, {"_id": 0}) or {}
    await _delete_video_media(doc.get("url"))
    await db.site_settings.update_one(
        {"key": VIDEO_SETTING_KEY},
        {"$set": {"url": "", "enabled": False, "updated_at": datetime.now(timezone.utc)}},
        upsert=True,
    )
    return {"success": True}


# ---------------------------------------------------------------------------
# Site content (visual editor: draft + published)
# ---------------------------------------------------------------------------
DEFAULT_CONTENT = {
    "global": {"accent": "#c9a15a"},
    "sections": {
        "hero": {
            "visible": True,
            "eyebrow": "Производство и монтаж",
            "titleLine1": "Алуминиева",
            "titleLead": "дограма от ",
            "titleAccent": "профи",
            "subtitle": "Прозорци и врати с европейско качество. Собствено производство, монтаж и 3-годишна гаранция.",
            "image": "https://images.unsplash.com/photo-1613061538705-01190bb0e3b8?auto=format&fit=crop&w=1920&q=80",
        },
        "stats": {
            "visible": True,
            "items": [
                {"value": "15+", "label": "Години опит"},
                {"value": "2500+", "label": "Изпълнени проекта"},
                {"value": "98%", "label": "Доволни клиенти"},
                {"value": "50+", "label": "Вида системи"},
            ],
        },
        "products": {
            "visible": True,
            "eyebrow": "Нашите продукти",
            "heading": "Пълна гама алуминиеви системи",
            "subtitle": "Предлагаме комплексни решения за жилищно и търговско строителство — от единичен прозорец до цялостна фасада.",
        },
        "why": {
            "visible": True,
            "eyebrow": "Защо ние",
            "heading": "Качество, на което можете да разчитате",
            "text": "Дограма Добрич предлага алуминиева дограма, изработена по поръчка и монтирана професионално – от измерването до финалния монтаж.",
            "image": "https://images.unsplash.com/photo-1614595737476-42487331b8a1?auto=format&fit=crop&w=1200&q=80",
        },
        "features": {
            "visible": True,
            "eyebrow": "Нашите предимства",
            "heading": "Пълно обслужване от А до Я",
        },
        "process": {
            "visible": True,
            "eyebrow": "Как работим",
            "heading": "Процес в 5 прости стъпки",
        },
        "testimonials": {
            "visible": True,
            "eyebrow": "Клиентите за нас",
            "heading": "Доверени от 2500+ клиента",
        },
        "brands": {"visible": True},
        "cta": {
            "visible": True,
            "heading": "Готови да обновите своя дом или офис?",
            "subtitle": "Свържете се с нас за безплатна консултация и оферта. Нашите специалисти ще посетят обекта и ще ви предложат най-подходящото решение.",
        },
    },
}


_REMOVED_PHRASES = {"Прозорци, врати и фасадни системи": "Прозорци и врати", "10-годишна гаранция": "3-годишна гаранция", "10 год. гаранция": "3 год. гаранция"}


def _clean_phrases(value):
    """Маха премахнати изрази от записаното съдържание (чернова и публикувано)."""
    if isinstance(value, str):
        for old, new in _REMOVED_PHRASES.items():
            value = value.replace(old, new)
        return re.sub(r"\s*,?\s*(?:и\s+)?фасадни системи", "", value, flags=re.IGNORECASE)
    if isinstance(value, list):
        return [_clean_phrases(v) for v in value]
    if isinstance(value, dict):
        return {k: _clean_phrases(v) for k, v in value.items()}
    return value


async def _get_content_doc():
    doc = await db.site_content.find_one({"key": "site"}, {"_id": 0})
    if not doc:
        doc = {
            "key": "site",
            "draft": DEFAULT_CONTENT,
            "published": DEFAULT_CONTENT,
            "updated_at": datetime.now(timezone.utc),
        }
        await db.site_content.insert_one(dict(doc))
    cleaned = {k: (_clean_phrases(v) if k in ("draft", "published") else v) for k, v in doc.items()}
    if cleaned != doc:
        await db.site_content.update_one(
            {"key": "site"},
            {"$set": {k: cleaned[k] for k in ("draft", "published") if k in cleaned}},
        )
        doc = cleaned
    return doc


@api_router.get("/content")
async def get_content(mode: str = "published", request: Request = None):
    doc = await _get_content_doc()
    if mode == "draft":
        # draft requires admin
        await get_admin_user(request)
        return doc.get("draft", DEFAULT_CONTENT)
    return doc.get("published", DEFAULT_CONTENT)


@api_router.put("/content/draft")
async def save_draft(payload: dict, admin: User = Depends(get_admin_user)):
    await _get_content_doc()
    await db.site_content.update_one(
        {"key": "site"},
        {"$set": {"draft": payload, "updated_at": datetime.now(timezone.utc)}},
    )
    return {"success": True}


@api_router.post("/content/publish")
async def publish_content(admin: User = Depends(get_admin_user)):
    doc = await _get_content_doc()
    await db.site_content.update_one(
        {"key": "site"},
        {"$set": {"published": doc.get("draft", DEFAULT_CONTENT),
                  "updated_at": datetime.now(timezone.utc)}},
    )
    return {"success": True}


@api_router.post("/content/discard")
async def discard_draft(admin: User = Depends(get_admin_user)):
    doc = await _get_content_doc()
    await db.site_content.update_one(
        {"key": "site"},
        {"$set": {"draft": doc.get("published", DEFAULT_CONTENT),
                  "updated_at": datetime.now(timezone.utc)}},
    )
    return {"success": True, "content": doc.get("published", DEFAULT_CONTENT)}


app.include_router(api_router)

# CORS_ORIGINS (през запетая) - локално се подава от start-local.command. Без него остава "*".
# Важно: с allow_credentials=True браузърът отхвърля отговори с Allow-Origin "*",
# затова при отделен frontend порт (localhost:3000) трябва да са изброени конкретните адреси.
_cors_origins = [o.strip() for o in os.environ.get("CORS_ORIGINS", "*").split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=_cors_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

#!/usr/bin/env python3
"""
Backend API tests for АлуминМастър site content editor endpoints.
Tests GET/PUT draft/publish/discard content + /api/media upload.
"""
import requests
import io
from PIL import Image

# Base URL from frontend/.env
BASE_URL = "https://naughty-gauss-7.preview.emergentagent.com/api"

# Session tokens created in MongoDB
ADMIN_TOKEN = "admin_session_1789782748734"
NON_ADMIN_TOKEN = "nonadmin_session_1789782748767"

# Test results tracking
passed = 0
failed = 0
test_results = []


def log_test(name, success, details=""):
    global passed, failed
    if success:
        passed += 1
        status = "✅ PASS"
    else:
        failed += 1
        status = "❌ FAIL"
    result = f"{status}: {name}"
    if details:
        result += f" - {details}"
    test_results.append(result)
    print(result)


def create_test_image():
    """Create a small PNG image for testing."""
    img = Image.new('RGB', (100, 100), color='red')
    img_bytes = io.BytesIO()
    img.save(img_bytes, format='PNG')
    img_bytes.seek(0)
    return img_bytes


def create_text_file():
    """Create a text file for negative testing."""
    return io.BytesIO(b"This is a text file, not an image")


print("=" * 80)
print("TESTING SITE CONTENT EDITOR BACKEND ENDPOINTS")
print("=" * 80)
print()

# =============================================================================
# TEST 1: GET /api/content?mode=published (NO auth) - PUBLIC
# =============================================================================
print("TEST 1: GET /api/content?mode=published (public, no auth)")
try:
    resp = requests.get(f"{BASE_URL}/content?mode=published", timeout=10)
    if resp.status_code == 200:
        data = resp.json()
        # Check for required keys
        has_global = "global" in data
        has_accent = has_global and "accent" in data["global"]
        has_sections = "sections" in data
        required_sections = ["hero", "stats", "products", "why", "features", 
                           "process", "testimonials", "brands", "cta"]
        all_sections_present = all(s in data.get("sections", {}) for s in required_sections)
        
        if has_global and has_accent and has_sections and all_sections_present:
            log_test("GET /api/content?mode=published (no auth)", True, 
                    f"200 OK, has global.accent and all required sections")
        else:
            missing = []
            if not has_global: missing.append("global")
            if not has_accent: missing.append("global.accent")
            if not has_sections: missing.append("sections")
            missing_sections = [s for s in required_sections if s not in data.get("sections", {})]
            if missing_sections: missing.append(f"sections: {', '.join(missing_sections)}")
            log_test("GET /api/content?mode=published (no auth)", False, 
                    f"200 but missing: {', '.join(missing)}")
    else:
        log_test("GET /api/content?mode=published (no auth)", False, 
                f"Expected 200, got {resp.status_code}")
except Exception as e:
    log_test("GET /api/content?mode=published (no auth)", False, f"Exception: {e}")

print()

# =============================================================================
# TEST 2: GET /api/content?mode=draft - AUTH GATING
# =============================================================================
print("TEST 2: GET /api/content?mode=draft - auth gating")

# 2a: NO auth -> 401
try:
    resp = requests.get(f"{BASE_URL}/content?mode=draft", timeout=10)
    if resp.status_code == 401:
        log_test("GET /api/content?mode=draft (no auth)", True, "401 Unauthorized")
    else:
        log_test("GET /api/content?mode=draft (no auth)", False, 
                f"Expected 401, got {resp.status_code}")
except Exception as e:
    log_test("GET /api/content?mode=draft (no auth)", False, f"Exception: {e}")

# 2b: NON-admin token -> 403
try:
    resp = requests.get(
        f"{BASE_URL}/content?mode=draft",
        headers={"Authorization": f"Bearer {NON_ADMIN_TOKEN}"},
        timeout=10
    )
    if resp.status_code == 403:
        log_test("GET /api/content?mode=draft (non-admin)", True, "403 Forbidden")
    else:
        log_test("GET /api/content?mode=draft (non-admin)", False, 
                f"Expected 403, got {resp.status_code}")
except Exception as e:
    log_test("GET /api/content?mode=draft (non-admin)", False, f"Exception: {e}")

# 2c: Admin token -> 200
try:
    resp = requests.get(
        f"{BASE_URL}/content?mode=draft",
        headers={"Authorization": f"Bearer {ADMIN_TOKEN}"},
        timeout=10
    )
    if resp.status_code == 200:
        draft_data = resp.json()
        log_test("GET /api/content?mode=draft (admin)", True, "200 OK with content")
    else:
        log_test("GET /api/content?mode=draft (admin)", False, 
                f"Expected 200, got {resp.status_code}")
        draft_data = None
except Exception as e:
    log_test("GET /api/content?mode=draft (admin)", False, f"Exception: {e}")
    draft_data = None

print()

# =============================================================================
# TEST 3: PUT /api/content/draft - MODIFY DRAFT
# =============================================================================
print("TEST 3: PUT /api/content/draft - modify draft content")

# 3a: NO auth -> 401
try:
    test_payload = {"test": "data"}
    resp = requests.put(
        f"{BASE_URL}/content/draft",
        json=test_payload,
        timeout=10
    )
    if resp.status_code == 401:
        log_test("PUT /api/content/draft (no auth)", True, "401 Unauthorized")
    else:
        log_test("PUT /api/content/draft (no auth)", False, 
                f"Expected 401, got {resp.status_code}")
except Exception as e:
    log_test("PUT /api/content/draft (no auth)", False, f"Exception: {e}")

# 3b: NON-admin token -> 403
try:
    test_payload = {"test": "data"}
    resp = requests.put(
        f"{BASE_URL}/content/draft",
        json=test_payload,
        headers={"Authorization": f"Bearer {NON_ADMIN_TOKEN}"},
        timeout=10
    )
    if resp.status_code == 403:
        log_test("PUT /api/content/draft (non-admin)", True, "403 Forbidden")
    else:
        log_test("PUT /api/content/draft (non-admin)", False, 
                f"Expected 403, got {resp.status_code}")
except Exception as e:
    log_test("PUT /api/content/draft (non-admin)", False, f"Exception: {e}")

# 3c: Admin token with modified content -> 200
if draft_data:
    try:
        # Modify the draft content
        modified_draft = draft_data.copy()
        modified_draft["global"]["accent"] = "#2e7d32"
        modified_draft["sections"]["hero"]["titleAccent"] = "МАЙСТОРИ"
        
        resp = requests.put(
            f"{BASE_URL}/content/draft",
            json=modified_draft,
            headers={"Authorization": f"Bearer {ADMIN_TOKEN}"},
            timeout=10
        )
        if resp.status_code == 200:
            result = resp.json()
            if result.get("success"):
                log_test("PUT /api/content/draft (admin, modify)", True, 
                        "200 OK with success=true")
                
                # Verify changes persisted in draft
                resp2 = requests.get(
                    f"{BASE_URL}/content?mode=draft",
                    headers={"Authorization": f"Bearer {ADMIN_TOKEN}"},
                    timeout=10
                )
                if resp2.status_code == 200:
                    updated_draft = resp2.json()
                    accent_correct = updated_draft.get("global", {}).get("accent") == "#2e7d32"
                    title_correct = updated_draft.get("sections", {}).get("hero", {}).get("titleAccent") == "МАЙСТОРИ"
                    
                    if accent_correct and title_correct:
                        log_test("PUT /api/content/draft - verify changes persisted", True, 
                                "Draft has accent=#2e7d32 and titleAccent=МАЙСТОРИ")
                    else:
                        log_test("PUT /api/content/draft - verify changes persisted", False, 
                                f"Changes not persisted: accent={accent_correct}, title={title_correct}")
                else:
                    log_test("PUT /api/content/draft - verify changes persisted", False, 
                            f"Failed to fetch draft: {resp2.status_code}")
                
                # Verify published content unchanged
                resp3 = requests.get(f"{BASE_URL}/content?mode=published", timeout=10)
                if resp3.status_code == 200:
                    published = resp3.json()
                    pub_accent = published.get("global", {}).get("accent")
                    pub_title = published.get("sections", {}).get("hero", {}).get("titleAccent")
                    
                    # Published should NOT have the new values yet
                    if pub_accent != "#2e7d32" and pub_title != "МАЙСТОРИ":
                        log_test("PUT /api/content/draft - published unchanged", True, 
                                f"Published still has old values (accent={pub_accent}, title={pub_title})")
                    else:
                        log_test("PUT /api/content/draft - published unchanged", False, 
                                "Published was modified before publish was called")
                else:
                    log_test("PUT /api/content/draft - published unchanged", False, 
                            f"Failed to fetch published: {resp3.status_code}")
            else:
                log_test("PUT /api/content/draft (admin, modify)", False, 
                        "200 but success=false")
        else:
            log_test("PUT /api/content/draft (admin, modify)", False, 
                    f"Expected 200, got {resp.status_code}")
    except Exception as e:
        log_test("PUT /api/content/draft (admin, modify)", False, f"Exception: {e}")
else:
    log_test("PUT /api/content/draft (admin, modify)", False, 
            "Skipped - no draft data from previous test")

print()

# =============================================================================
# TEST 4: POST /api/content/publish - PUBLISH DRAFT
# =============================================================================
print("TEST 4: POST /api/content/publish - publish draft to production")

# 4a: NO auth -> 401
try:
    resp = requests.post(f"{BASE_URL}/content/publish", timeout=10)
    if resp.status_code == 401:
        log_test("POST /api/content/publish (no auth)", True, "401 Unauthorized")
    else:
        log_test("POST /api/content/publish (no auth)", False, 
                f"Expected 401, got {resp.status_code}")
except Exception as e:
    log_test("POST /api/content/publish (no auth)", False, f"Exception: {e}")

# 4b: NON-admin token -> 403
try:
    resp = requests.post(
        f"{BASE_URL}/content/publish",
        headers={"Authorization": f"Bearer {NON_ADMIN_TOKEN}"},
        timeout=10
    )
    if resp.status_code == 403:
        log_test("POST /api/content/publish (non-admin)", True, "403 Forbidden")
    else:
        log_test("POST /api/content/publish (non-admin)", False, 
                f"Expected 403, got {resp.status_code}")
except Exception as e:
    log_test("POST /api/content/publish (non-admin)", False, f"Exception: {e}")

# 4c: Admin token -> 200, verify published reflects draft
try:
    resp = requests.post(
        f"{BASE_URL}/content/publish",
        headers={"Authorization": f"Bearer {ADMIN_TOKEN}"},
        timeout=10
    )
    if resp.status_code == 200:
        result = resp.json()
        if result.get("success"):
            log_test("POST /api/content/publish (admin)", True, "200 OK with success=true")
            
            # Verify published now has the modified values
            resp2 = requests.get(f"{BASE_URL}/content?mode=published", timeout=10)
            if resp2.status_code == 200:
                published = resp2.json()
                pub_accent = published.get("global", {}).get("accent")
                pub_title = published.get("sections", {}).get("hero", {}).get("titleAccent")
                
                if pub_accent == "#2e7d32" and pub_title == "МАЙСТОРИ":
                    log_test("POST /api/content/publish - verify published updated", True, 
                            "Published now has accent=#2e7d32 and titleAccent=МАЙСТОРИ")
                else:
                    log_test("POST /api/content/publish - verify published updated", False, 
                            f"Published not updated: accent={pub_accent}, title={pub_title}")
            else:
                log_test("POST /api/content/publish - verify published updated", False, 
                        f"Failed to fetch published: {resp2.status_code}")
        else:
            log_test("POST /api/content/publish (admin)", False, "200 but success=false")
    else:
        log_test("POST /api/content/publish (admin)", False, 
                f"Expected 200, got {resp.status_code}")
except Exception as e:
    log_test("POST /api/content/publish (admin)", False, f"Exception: {e}")

print()

# =============================================================================
# TEST 5: POST /api/content/discard - DISCARD DRAFT CHANGES
# =============================================================================
print("TEST 5: POST /api/content/discard - discard draft changes")

# First, make a new draft change
try:
    resp = requests.get(
        f"{BASE_URL}/content?mode=draft",
        headers={"Authorization": f"Bearer {ADMIN_TOKEN}"},
        timeout=10
    )
    if resp.status_code == 200:
        temp_draft = resp.json()
        temp_draft["sections"]["hero"]["titleAccent"] = "TEMP"
        
        resp2 = requests.put(
            f"{BASE_URL}/content/draft",
            json=temp_draft,
            headers={"Authorization": f"Bearer {ADMIN_TOKEN}"},
            timeout=10
        )
        if resp2.status_code == 200:
            log_test("POST /api/content/discard - setup temp draft", True, 
                    "Created temp draft with titleAccent=TEMP")
        else:
            log_test("POST /api/content/discard - setup temp draft", False, 
                    f"Failed to create temp draft: {resp2.status_code}")
    else:
        log_test("POST /api/content/discard - setup temp draft", False, 
                f"Failed to fetch draft: {resp.status_code}")
except Exception as e:
    log_test("POST /api/content/discard - setup temp draft", False, f"Exception: {e}")

# 5a: NO auth -> 401
try:
    resp = requests.post(f"{BASE_URL}/content/discard", timeout=10)
    if resp.status_code == 401:
        log_test("POST /api/content/discard (no auth)", True, "401 Unauthorized")
    else:
        log_test("POST /api/content/discard (no auth)", False, 
                f"Expected 401, got {resp.status_code}")
except Exception as e:
    log_test("POST /api/content/discard (no auth)", False, f"Exception: {e}")

# 5b: NON-admin token -> 403
try:
    resp = requests.post(
        f"{BASE_URL}/content/discard",
        headers={"Authorization": f"Bearer {NON_ADMIN_TOKEN}"},
        timeout=10
    )
    if resp.status_code == 403:
        log_test("POST /api/content/discard (non-admin)", True, "403 Forbidden")
    else:
        log_test("POST /api/content/discard (non-admin)", False, 
                f"Expected 403, got {resp.status_code}")
except Exception as e:
    log_test("POST /api/content/discard (non-admin)", False, f"Exception: {e}")

# 5c: Admin token -> 200, verify draft reverts to published
try:
    resp = requests.post(
        f"{BASE_URL}/content/discard",
        headers={"Authorization": f"Bearer {ADMIN_TOKEN}"},
        timeout=10
    )
    if resp.status_code == 200:
        result = resp.json()
        if result.get("success"):
            log_test("POST /api/content/discard (admin)", True, "200 OK with success=true")
            
            # Verify draft now equals published (titleAccent should be МАЙСТОРИ, not TEMP)
            resp2 = requests.get(
                f"{BASE_URL}/content?mode=draft",
                headers={"Authorization": f"Bearer {ADMIN_TOKEN}"},
                timeout=10
            )
            if resp2.status_code == 200:
                draft = resp2.json()
                draft_title = draft.get("sections", {}).get("hero", {}).get("titleAccent")
                
                if draft_title == "МАЙСТОРИ":
                    log_test("POST /api/content/discard - verify draft reverted", True, 
                            "Draft titleAccent reverted to МАЙСТОРИ (not TEMP)")
                else:
                    log_test("POST /api/content/discard - verify draft reverted", False, 
                            f"Draft titleAccent is {draft_title}, expected МАЙСТОРИ")
            else:
                log_test("POST /api/content/discard - verify draft reverted", False, 
                        f"Failed to fetch draft: {resp2.status_code}")
        else:
            log_test("POST /api/content/discard (admin)", False, "200 but success=false")
    else:
        log_test("POST /api/content/discard (admin)", False, 
                f"Expected 200, got {resp.status_code}")
except Exception as e:
    log_test("POST /api/content/discard (admin)", False, f"Exception: {e}")

print()

# =============================================================================
# TEST 6: POST /api/media - IMAGE UPLOAD
# =============================================================================
print("TEST 6: POST /api/media - image upload for content editor")

# 6a: NO auth -> 401
try:
    img = create_test_image()
    resp = requests.post(
        f"{BASE_URL}/media",
        files={"file": ("test.png", img, "image/png")},
        timeout=10
    )
    if resp.status_code == 401:
        log_test("POST /api/media (no auth)", True, "401 Unauthorized")
    else:
        log_test("POST /api/media (no auth)", False, 
                f"Expected 401, got {resp.status_code}")
except Exception as e:
    log_test("POST /api/media (no auth)", False, f"Exception: {e}")

# 6b: NON-admin token -> 403
try:
    img = create_test_image()
    resp = requests.post(
        f"{BASE_URL}/media",
        files={"file": ("test.png", img, "image/png")},
        headers={"Authorization": f"Bearer {NON_ADMIN_TOKEN}"},
        timeout=10
    )
    if resp.status_code == 403:
        log_test("POST /api/media (non-admin)", True, "403 Forbidden")
    else:
        log_test("POST /api/media (non-admin)", False, 
                f"Expected 403, got {resp.status_code}")
except Exception as e:
    log_test("POST /api/media (non-admin)", False, f"Exception: {e}")

# 6c: Admin token with non-image file -> 400
try:
    txt = create_text_file()
    resp = requests.post(
        f"{BASE_URL}/media",
        files={"file": ("test.txt", txt, "text/plain")},
        headers={"Authorization": f"Bearer {ADMIN_TOKEN}"},
        timeout=10
    )
    if resp.status_code == 400:
        log_test("POST /api/media (admin, non-image file)", True, "400 Bad Request")
    else:
        log_test("POST /api/media (admin, non-image file)", False, 
                f"Expected 400, got {resp.status_code}")
except Exception as e:
    log_test("POST /api/media (admin, non-image file)", False, f"Exception: {e}")

# 6d: Admin token with valid image -> 200 with url
media_url = None
try:
    img = create_test_image()
    resp = requests.post(
        f"{BASE_URL}/media",
        files={"file": ("test.png", img, "image/png")},
        headers={"Authorization": f"Bearer {ADMIN_TOKEN}"},
        timeout=10
    )
    if resp.status_code == 200:
        result = resp.json()
        if result.get("success") and result.get("url"):
            media_url = result["url"]
            log_test("POST /api/media (admin, valid image)", True, 
                    f"200 OK with success=true and url={media_url}")
        else:
            log_test("POST /api/media (admin, valid image)", False, 
                    "200 but missing success or url in response")
    else:
        log_test("POST /api/media (admin, valid image)", False, 
                f"Expected 200, got {resp.status_code}")
except Exception as e:
    log_test("POST /api/media (admin, valid image)", False, f"Exception: {e}")

# 6e: GET the uploaded media -> 200 with image bytes
if media_url:
    try:
        # media_url is like "/api/media/{id}", need to prepend base
        full_url = f"https://naughty-gauss-7.preview.emergentagent.com{media_url}"
        resp = requests.get(full_url, timeout=10)
        if resp.status_code == 200:
            content_type = resp.headers.get("Content-Type", "")
            if content_type.startswith("image/"):
                log_test("GET /api/media/{id} (uploaded image)", True, 
                        f"200 OK with content-type={content_type}")
            else:
                log_test("GET /api/media/{id} (uploaded image)", False, 
                        f"200 but wrong content-type: {content_type}")
        else:
            log_test("GET /api/media/{id} (uploaded image)", False, 
                    f"Expected 200, got {resp.status_code}")
    except Exception as e:
        log_test("GET /api/media/{id} (uploaded image)", False, f"Exception: {e}")
else:
    log_test("GET /api/media/{id} (uploaded image)", False, 
            "Skipped - no media URL from previous test")

print()
print("=" * 80)
print(f"TEST SUMMARY: {passed} passed, {failed} failed")
print("=" * 80)
print()

# Print all results
for result in test_results:
    print(result)

print()
print("=" * 80)
print("TESTING COMPLETE")
print("=" * 80)

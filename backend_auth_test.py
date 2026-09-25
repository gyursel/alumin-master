#!/usr/bin/env python3
"""
Backend Auth & Admin API tests for АлуминМастър
Tests auth (register/login/me/logout), admin-gated inquiries, and media/gallery
"""

import requests
import json
import sys
import io
from PIL import Image

# Base URL from frontend/.env
BASE_URL = "https://naughty-gauss-7.preview.emergentagent.com/api"

# Test credentials
ADMIN_EMAIL = "peter200419@gmail.com"
ADMIN_PASSWORD = "TestAdmin123!"
ADMIN_NAME = "Peter Admin"

NON_ADMIN_EMAIL = "random@example.com"
NON_ADMIN_PASSWORD = "Random123!"
NON_ADMIN_NAME = "Random User"

# Global tokens
admin_token = None
non_admin_token = None

def print_test_header(test_name):
    print(f"\n{'='*80}")
    print(f"TEST: {test_name}")
    print(f"{'='*80}")

def print_result(passed, message):
    status = "✅ PASS" if passed else "❌ FAIL"
    print(f"{status}: {message}")
    return passed

def create_test_image():
    """Create a small test PNG image in memory"""
    img = Image.new('RGB', (100, 100), color='red')
    img_bytes = io.BytesIO()
    img.save(img_bytes, format='PNG')
    img_bytes.seek(0)
    return img_bytes

def create_test_text_file():
    """Create a small text file in memory"""
    return io.BytesIO(b"This is a text file, not an image")

# =============================================================================
# 1. EMAIL/PASSWORD AUTH TESTS
# =============================================================================

def test_register_admin():
    """Test POST /api/auth/register with admin email"""
    print_test_header("Auth Register - Admin Email")
    global admin_token
    
    payload = {
        "email": ADMIN_EMAIL,
        "password": ADMIN_PASSWORD,
        "name": ADMIN_NAME
    }
    
    try:
        response = requests.post(f"{BASE_URL}/auth/register", json=payload, timeout=10)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        # Accept both 200 (new registration) and 400 (already registered)
        if response.status_code == 400:
            if "вече е регистриран" in response.text or "already registered" in response.text.lower():
                print("⚠️  Admin already registered, will test login instead")
                return print_result(True, "Admin email already registered (acceptable)")
            else:
                return print_result(False, f"Unexpected 400 error: {response.text}")
        
        if response.status_code != 200:
            return print_result(False, f"Expected status 200, got {response.status_code}")
        
        data = response.json()
        
        # Check required fields
        if not data.get("success"):
            return print_result(False, "Response missing 'success: true'")
        
        if "user" not in data:
            return print_result(False, "Response missing 'user' field")
        
        user = data["user"]
        
        # Check is_admin is true
        if not user.get("is_admin"):
            return print_result(False, f"Expected is_admin=true for {ADMIN_EMAIL}, got {user.get('is_admin')}")
        
        # Check session_token
        if "session_token" not in data:
            return print_result(False, "Response missing 'session_token' field")
        
        admin_token = data["session_token"]
        print(f"Admin token: {admin_token[:20]}...")
        
        return print_result(True, f"Admin registered successfully with is_admin=true")
        
    except Exception as e:
        return print_result(False, f"Exception: {str(e)}")

def test_login_admin():
    """Test POST /api/auth/login with admin email"""
    print_test_header("Auth Login - Admin Email")
    global admin_token
    
    payload = {
        "email": ADMIN_EMAIL,
        "password": ADMIN_PASSWORD
    }
    
    try:
        response = requests.post(f"{BASE_URL}/auth/login", json=payload, timeout=10)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code != 200:
            return print_result(False, f"Expected status 200, got {response.status_code}")
        
        data = response.json()
        
        # Check required fields
        if not data.get("success"):
            return print_result(False, "Response missing 'success: true'")
        
        if "user" not in data:
            return print_result(False, "Response missing 'user' field")
        
        user = data["user"]
        
        # Check is_admin is true
        if not user.get("is_admin"):
            return print_result(False, f"Expected is_admin=true for {ADMIN_EMAIL}, got {user.get('is_admin')}")
        
        # Check session_token
        if "session_token" not in data:
            return print_result(False, "Response missing 'session_token' field")
        
        admin_token = data["session_token"]
        print(f"Admin token: {admin_token[:20]}...")
        
        return print_result(True, f"Admin logged in successfully with is_admin=true and session_token")
        
    except Exception as e:
        return print_result(False, f"Exception: {str(e)}")

def test_login_wrong_password():
    """Test POST /api/auth/login with wrong password"""
    print_test_header("Auth Login - Wrong Password")
    
    payload = {
        "email": ADMIN_EMAIL,
        "password": "WrongPassword123!"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/auth/login", json=payload, timeout=10)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 401:
            return print_result(True, "Correctly rejected wrong password with HTTP 401")
        else:
            return print_result(False, f"Expected status 401, got {response.status_code}")
        
    except Exception as e:
        return print_result(False, f"Exception: {str(e)}")

def test_register_non_admin():
    """Test POST /api/auth/register with non-admin email"""
    print_test_header("Auth Register - Non-Admin Email")
    global non_admin_token
    
    payload = {
        "email": NON_ADMIN_EMAIL,
        "password": NON_ADMIN_PASSWORD,
        "name": NON_ADMIN_NAME
    }
    
    try:
        response = requests.post(f"{BASE_URL}/auth/register", json=payload, timeout=10)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        # Accept both 200 (new registration) and 400 (already registered)
        if response.status_code == 400:
            if "вече е регистриран" in response.text or "already registered" in response.text.lower():
                print("⚠️  Non-admin already registered, will test login instead")
                return print_result(True, "Non-admin email already registered (acceptable)")
            else:
                return print_result(False, f"Unexpected 400 error: {response.text}")
        
        if response.status_code != 200:
            return print_result(False, f"Expected status 200, got {response.status_code}")
        
        data = response.json()
        
        # Check required fields
        if not data.get("success"):
            return print_result(False, "Response missing 'success: true'")
        
        if "user" not in data:
            return print_result(False, "Response missing 'user' field")
        
        user = data["user"]
        
        # Check is_admin is false
        if user.get("is_admin"):
            return print_result(False, f"Expected is_admin=false for {NON_ADMIN_EMAIL}, got {user.get('is_admin')}")
        
        # Check session_token
        if "session_token" not in data:
            return print_result(False, "Response missing 'session_token' field")
        
        non_admin_token = data["session_token"]
        print(f"Non-admin token: {non_admin_token[:20]}...")
        
        return print_result(True, f"Non-admin registered successfully with is_admin=false")
        
    except Exception as e:
        return print_result(False, f"Exception: {str(e)}")

def test_login_non_admin():
    """Test POST /api/auth/login with non-admin email"""
    print_test_header("Auth Login - Non-Admin Email")
    global non_admin_token
    
    payload = {
        "email": NON_ADMIN_EMAIL,
        "password": NON_ADMIN_PASSWORD
    }
    
    try:
        response = requests.post(f"{BASE_URL}/auth/login", json=payload, timeout=10)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code != 200:
            return print_result(False, f"Expected status 200, got {response.status_code}")
        
        data = response.json()
        
        # Check required fields
        if not data.get("success"):
            return print_result(False, "Response missing 'success: true'")
        
        if "user" not in data:
            return print_result(False, "Response missing 'user' field")
        
        user = data["user"]
        
        # Check is_admin is false
        if user.get("is_admin"):
            return print_result(False, f"Expected is_admin=false for {NON_ADMIN_EMAIL}, got {user.get('is_admin')}")
        
        # Check session_token
        if "session_token" not in data:
            return print_result(False, "Response missing 'session_token' field")
        
        non_admin_token = data["session_token"]
        print(f"Non-admin token: {non_admin_token[:20]}...")
        
        return print_result(True, f"Non-admin logged in successfully with is_admin=false and session_token")
        
    except Exception as e:
        return print_result(False, f"Exception: {str(e)}")

# =============================================================================
# 2. GET /api/auth/me TESTS
# =============================================================================

def test_auth_me_no_auth():
    """Test GET /api/auth/me without authentication"""
    print_test_header("Auth Me - No Authentication")
    
    try:
        response = requests.get(f"{BASE_URL}/auth/me", timeout=10)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 401:
            return print_result(True, "Correctly rejected unauthenticated request with HTTP 401")
        else:
            return print_result(False, f"Expected status 401, got {response.status_code}")
        
    except Exception as e:
        return print_result(False, f"Exception: {str(e)}")

def test_auth_me_with_admin_token():
    """Test GET /api/auth/me with valid admin Bearer token"""
    print_test_header("Auth Me - Admin Bearer Token")
    
    if not admin_token:
        return print_result(False, "Admin token not available (login failed?)")
    
    try:
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.get(f"{BASE_URL}/auth/me", headers=headers, timeout=10)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code != 200:
            return print_result(False, f"Expected status 200, got {response.status_code}")
        
        data = response.json()
        
        # Check required fields
        if "user_id" not in data:
            return print_result(False, "Response missing 'user_id' field")
        
        if "email" not in data:
            return print_result(False, "Response missing 'email' field")
        
        if not data.get("is_admin"):
            return print_result(False, f"Expected is_admin=true, got {data.get('is_admin')}")
        
        # Check MongoDB _id is NOT exposed
        if "_id" in data:
            return print_result(False, "MongoDB _id field is exposed (should be excluded)")
        
        print(f"User data: {json.dumps(data, indent=2)}")
        
        return print_result(True, "Auth me returned correct user data with is_admin=true and no _id")
        
    except Exception as e:
        return print_result(False, f"Exception: {str(e)}")

# =============================================================================
# 3. ADMIN-GATED INQUIRIES TESTS
# =============================================================================

def test_get_inquiries_no_auth():
    """Test GET /api/inquiries without authentication"""
    print_test_header("Get Inquiries - No Authentication")
    
    try:
        response = requests.get(f"{BASE_URL}/inquiries", timeout=10)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 401:
            return print_result(True, "Correctly rejected unauthenticated request with HTTP 401")
        else:
            return print_result(False, f"Expected status 401, got {response.status_code}")
        
    except Exception as e:
        return print_result(False, f"Exception: {str(e)}")

def test_get_inquiries_non_admin():
    """Test GET /api/inquiries with non-admin token"""
    print_test_header("Get Inquiries - Non-Admin Token")
    
    if not non_admin_token:
        return print_result(False, "Non-admin token not available (login failed?)")
    
    try:
        headers = {"Authorization": f"Bearer {non_admin_token}"}
        response = requests.get(f"{BASE_URL}/inquiries", headers=headers, timeout=10)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 403:
            return print_result(True, "Correctly rejected non-admin request with HTTP 403")
        else:
            return print_result(False, f"Expected status 403, got {response.status_code}")
        
    except Exception as e:
        return print_result(False, f"Exception: {str(e)}")

def test_get_inquiries_admin():
    """Test GET /api/inquiries with admin token"""
    print_test_header("Get Inquiries - Admin Token")
    
    if not admin_token:
        return print_result(False, "Admin token not available (login failed?)")
    
    try:
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.get(f"{BASE_URL}/inquiries", headers=headers, timeout=10)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text[:500]}")
        
        if response.status_code != 200:
            return print_result(False, f"Expected status 200, got {response.status_code}")
        
        data = response.json()
        
        if not isinstance(data, list):
            return print_result(False, f"Expected JSON array, got {type(data)}")
        
        print(f"Retrieved {len(data)} inquiries")
        
        return print_result(True, f"Admin successfully retrieved inquiries list")
        
    except Exception as e:
        return print_result(False, f"Exception: {str(e)}")

def test_post_inquiry_public():
    """Test POST /api/inquiries without auth (public endpoint)"""
    print_test_header("Post Inquiry - Public (No Auth)")
    
    payload = {
        "name": "Георги Тестов",
        "phone": "+359888999888",
        "email": "georgi@test.bg",
        "service": "Алуминиеви врати",
        "message": "Искам оферта за входна врата"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/inquiries", json=payload, timeout=10)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code != 200:
            return print_result(False, f"Expected status 200, got {response.status_code}")
        
        data = response.json()
        
        if not data.get("success"):
            return print_result(False, "Response missing 'success: true'")
        
        if not data.get("id"):
            return print_result(False, "Response missing 'id' field")
        
        inquiry_id = data["id"]
        print(f"Created inquiry ID: {inquiry_id}")
        
        return print_result(True, "Public inquiry creation still works without auth"), inquiry_id
        
    except Exception as e:
        return print_result(False, f"Exception: {str(e)}")

def test_delete_inquiry_no_auth(inquiry_id):
    """Test DELETE /api/inquiries/{id} without auth"""
    print_test_header("Delete Inquiry - No Authentication")
    
    if not inquiry_id:
        return print_result(False, "No inquiry ID available")
    
    try:
        response = requests.delete(f"{BASE_URL}/inquiries/{inquiry_id}", timeout=10)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 401:
            return print_result(True, "Correctly rejected unauthenticated delete with HTTP 401")
        else:
            return print_result(False, f"Expected status 401, got {response.status_code}")
        
    except Exception as e:
        return print_result(False, f"Exception: {str(e)}")

def test_delete_inquiry_admin(inquiry_id):
    """Test DELETE /api/inquiries/{id} with admin token"""
    print_test_header("Delete Inquiry - Admin Token")
    
    if not inquiry_id:
        return print_result(False, "No inquiry ID available")
    
    if not admin_token:
        return print_result(False, "Admin token not available (login failed?)")
    
    try:
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.delete(f"{BASE_URL}/inquiries/{inquiry_id}", headers=headers, timeout=10)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code != 200:
            return print_result(False, f"Expected status 200, got {response.status_code}")
        
        data = response.json()
        
        if not data.get("success"):
            return print_result(False, "Response missing 'success: true'")
        
        return print_result(True, "Admin successfully deleted inquiry")
        
    except Exception as e:
        return print_result(False, f"Exception: {str(e)}")

# =============================================================================
# 4. MEDIA & GALLERY TESTS
# =============================================================================

def test_post_gallery_no_auth():
    """Test POST /api/gallery without authentication"""
    print_test_header("Post Gallery - No Authentication")
    
    try:
        img_bytes = create_test_image()
        files = {'file': ('test.png', img_bytes, 'image/png')}
        data = {'title': 'Тест проект', 'category': 'Фасади'}
        
        response = requests.post(f"{BASE_URL}/gallery", files=files, data=data, timeout=10)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 401:
            return print_result(True, "Correctly rejected unauthenticated upload with HTTP 401")
        else:
            return print_result(False, f"Expected status 401, got {response.status_code}")
        
    except Exception as e:
        return print_result(False, f"Exception: {str(e)}")

def test_post_gallery_non_admin():
    """Test POST /api/gallery with non-admin token"""
    print_test_header("Post Gallery - Non-Admin Token")
    
    if not non_admin_token:
        return print_result(False, "Non-admin token not available (login failed?)")
    
    try:
        img_bytes = create_test_image()
        files = {'file': ('test.png', img_bytes, 'image/png')}
        data = {'title': 'Тест проект', 'category': 'Фасади'}
        headers = {"Authorization": f"Bearer {non_admin_token}"}
        
        response = requests.post(f"{BASE_URL}/gallery", files=files, data=data, headers=headers, timeout=10)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 403:
            return print_result(True, "Correctly rejected non-admin upload with HTTP 403")
        else:
            return print_result(False, f"Expected status 403, got {response.status_code}")
        
    except Exception as e:
        return print_result(False, f"Exception: {str(e)}")

def test_post_gallery_admin_valid():
    """Test POST /api/gallery with admin token and valid image"""
    print_test_header("Post Gallery - Admin Token + Valid Image")
    
    if not admin_token:
        return print_result(False, "Admin token not available (login failed?)")
    
    try:
        img_bytes = create_test_image()
        files = {'file': ('test.png', img_bytes, 'image/png')}
        data = {'title': 'Тест проект', 'category': 'Фасади'}
        headers = {"Authorization": f"Bearer {admin_token}"}
        
        response = requests.post(f"{BASE_URL}/gallery", files=files, data=data, headers=headers, timeout=10)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code != 200:
            return print_result(False, f"Expected status 200, got {response.status_code}")
        
        resp_data = response.json()
        
        if not resp_data.get("success"):
            return print_result(False, "Response missing 'success: true'")
        
        if "item" not in resp_data:
            return print_result(False, "Response missing 'item' field")
        
        item = resp_data["item"]
        
        if "id" not in item:
            return print_result(False, "Item missing 'id' field")
        
        if "url" not in item:
            return print_result(False, "Item missing 'url' field")
        
        if not item["url"].startswith("/api/media/"):
            return print_result(False, f"Expected url to start with /api/media/, got {item['url']}")
        
        gallery_id = item["id"]
        media_url = item["url"]
        print(f"Created gallery item ID: {gallery_id}")
        print(f"Media URL: {media_url}")
        
        return print_result(True, "Admin successfully uploaded image to gallery"), gallery_id, media_url
        
    except Exception as e:
        return print_result(False, f"Exception: {str(e)}")

def test_post_gallery_admin_invalid_file():
    """Test POST /api/gallery with admin token and non-image file"""
    print_test_header("Post Gallery - Admin Token + Non-Image File")
    
    if not admin_token:
        return print_result(False, "Admin token not available (login failed?)")
    
    try:
        text_bytes = create_test_text_file()
        files = {'file': ('test.txt', text_bytes, 'text/plain')}
        data = {'title': 'Тест проект', 'category': 'Фасади'}
        headers = {"Authorization": f"Bearer {admin_token}"}
        
        response = requests.post(f"{BASE_URL}/gallery", files=files, data=data, headers=headers, timeout=10)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 400:
            return print_result(True, "Correctly rejected non-image file with HTTP 400")
        else:
            return print_result(False, f"Expected status 400, got {response.status_code}")
        
    except Exception as e:
        return print_result(False, f"Exception: {str(e)}")

def test_get_gallery_public():
    """Test GET /api/gallery (public endpoint)"""
    print_test_header("Get Gallery - Public")
    
    try:
        response = requests.get(f"{BASE_URL}/gallery", timeout=10)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code != 200:
            return print_result(False, f"Expected status 200, got {response.status_code}")
        
        data = response.json()
        
        if not isinstance(data, list):
            return print_result(False, f"Expected JSON array, got {type(data)}")
        
        print(f"Retrieved {len(data)} gallery items")
        
        if len(data) > 0:
            first_item = data[0]
            print(f"Sample item: {json.dumps(first_item, indent=2)}")
            
            # Check MongoDB _id and media_id are NOT exposed
            if "_id" in first_item:
                return print_result(False, "MongoDB _id field is exposed (should be excluded)")
            
            if "media_id" in first_item:
                return print_result(False, "media_id field is exposed (should be excluded)")
        
        return print_result(True, "Public gallery list retrieved successfully with no _id or media_id")
        
    except Exception as e:
        return print_result(False, f"Exception: {str(e)}")

def test_get_media(media_url):
    """Test GET /api/media/{media_id}"""
    print_test_header("Get Media - Serve Image")
    
    if not media_url:
        return print_result(False, "No media URL available")
    
    try:
        # Extract media_id from url
        media_id = media_url.split("/")[-1]
        
        response = requests.get(f"{BASE_URL}/media/{media_id}", timeout=10)
        print(f"Status Code: {response.status_code}")
        print(f"Content-Type: {response.headers.get('Content-Type')}")
        print(f"Content-Length: {len(response.content)} bytes")
        
        if response.status_code != 200:
            return print_result(False, f"Expected status 200, got {response.status_code}")
        
        content_type = response.headers.get('Content-Type', '')
        if not content_type.startswith('image/'):
            return print_result(False, f"Expected image content-type, got {content_type}")
        
        if len(response.content) == 0:
            return print_result(False, "Response body is empty")
        
        return print_result(True, f"Media served successfully with {content_type} and {len(response.content)} bytes")
        
    except Exception as e:
        return print_result(False, f"Exception: {str(e)}")

def test_delete_gallery_admin(gallery_id):
    """Test DELETE /api/gallery/{id} with admin token"""
    print_test_header("Delete Gallery - Admin Token")
    
    if not gallery_id:
        return print_result(False, "No gallery ID available")
    
    if not admin_token:
        return print_result(False, "Admin token not available (login failed?)")
    
    try:
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.delete(f"{BASE_URL}/gallery/{gallery_id}", headers=headers, timeout=10)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code != 200:
            return print_result(False, f"Expected status 200, got {response.status_code}")
        
        data = response.json()
        
        if not data.get("success"):
            return print_result(False, "Response missing 'success: true'")
        
        return print_result(True, "Admin successfully deleted gallery item")
        
    except Exception as e:
        return print_result(False, f"Exception: {str(e)}")

def test_get_gallery_after_delete(gallery_id):
    """Test GET /api/gallery after deletion to verify item is gone"""
    print_test_header("Get Gallery - Verify Deletion")
    
    if not gallery_id:
        return print_result(False, "No gallery ID available")
    
    try:
        response = requests.get(f"{BASE_URL}/gallery", timeout=10)
        
        if response.status_code != 200:
            return print_result(False, f"Failed to retrieve gallery: {response.status_code}")
        
        data = response.json()
        
        # Check if deleted item is still in the list
        found = any(item.get("id") == gallery_id for item in data)
        
        if found:
            return print_result(False, f"Deleted gallery item {gallery_id} still appears in list")
        
        return print_result(True, "Deleted gallery item no longer appears in list")
        
    except Exception as e:
        return print_result(False, f"Exception: {str(e)}")

def test_get_media_after_delete(media_url):
    """Test GET /api/media/{media_id} after deletion to verify 404"""
    print_test_header("Get Media - Verify 404 After Deletion")
    
    if not media_url:
        return print_result(False, "No media URL available")
    
    try:
        media_id = media_url.split("/")[-1]
        
        response = requests.get(f"{BASE_URL}/media/{media_id}", timeout=10)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 404:
            return print_result(True, "Media correctly returns 404 after deletion")
        else:
            return print_result(False, f"Expected status 404, got {response.status_code}")
        
    except Exception as e:
        return print_result(False, f"Exception: {str(e)}")

# =============================================================================
# 5. LOGOUT TEST
# =============================================================================

def test_logout():
    """Test POST /api/auth/logout"""
    print_test_header("Auth Logout")
    
    if not admin_token:
        return print_result(False, "Admin token not available (login failed?)")
    
    try:
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = requests.post(f"{BASE_URL}/auth/logout", headers=headers, timeout=10)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code != 200:
            return print_result(False, f"Expected status 200, got {response.status_code}")
        
        data = response.json()
        
        if not data.get("success"):
            return print_result(False, "Response missing 'success: true'")
        
        return print_result(True, "Logout successful"), admin_token
        
    except Exception as e:
        return print_result(False, f"Exception: {str(e)}")

def test_auth_me_after_logout(token):
    """Test GET /api/auth/me after logout (should fail)"""
    print_test_header("Auth Me - After Logout")
    
    if not token:
        return print_result(False, "No token available")
    
    try:
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(f"{BASE_URL}/auth/me", headers=headers, timeout=10)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 401:
            return print_result(True, "Correctly rejected logged-out session with HTTP 401")
        else:
            return print_result(False, f"Expected status 401, got {response.status_code}")
        
    except Exception as e:
        return print_result(False, f"Exception: {str(e)}")

# =============================================================================
# MAIN TEST RUNNER
# =============================================================================

def main():
    print("\n" + "="*80)
    print("BACKEND AUTH & ADMIN API TESTING - АлуминМастър")
    print(f"Base URL: {BASE_URL}")
    print("="*80)
    
    all_passed = True
    inquiry_id = None
    gallery_id = None
    media_url = None
    logout_token = None
    
    # 1. Email/password auth tests
    print("\n" + "="*80)
    print("SECTION 1: EMAIL/PASSWORD AUTH")
    print("="*80)
    
    result = test_register_admin()
    all_passed = all_passed and result
    
    result = test_login_admin()
    all_passed = all_passed and result
    
    result = test_login_wrong_password()
    all_passed = all_passed and result
    
    result = test_register_non_admin()
    all_passed = all_passed and result
    
    result = test_login_non_admin()
    all_passed = all_passed and result
    
    # 2. GET /api/auth/me tests
    print("\n" + "="*80)
    print("SECTION 2: GET /api/auth/me")
    print("="*80)
    
    result = test_auth_me_no_auth()
    all_passed = all_passed and result
    
    result = test_auth_me_with_admin_token()
    all_passed = all_passed and result
    
    # 3. Admin-gated inquiries tests
    print("\n" + "="*80)
    print("SECTION 3: ADMIN-GATED INQUIRIES")
    print("="*80)
    
    result = test_get_inquiries_no_auth()
    all_passed = all_passed and result
    
    result = test_get_inquiries_non_admin()
    all_passed = all_passed and result
    
    result = test_get_inquiries_admin()
    all_passed = all_passed and result
    
    result = test_post_inquiry_public()
    if isinstance(result, tuple):
        passed, inquiry_id = result
        all_passed = all_passed and passed
    else:
        all_passed = all_passed and result
    
    if inquiry_id:
        result = test_delete_inquiry_no_auth(inquiry_id)
        all_passed = all_passed and result
        
        result = test_delete_inquiry_admin(inquiry_id)
        all_passed = all_passed and result
    
    # 4. Media & Gallery tests
    print("\n" + "="*80)
    print("SECTION 4: MEDIA & GALLERY")
    print("="*80)
    
    result = test_post_gallery_no_auth()
    all_passed = all_passed and result
    
    result = test_post_gallery_non_admin()
    all_passed = all_passed and result
    
    result = test_post_gallery_admin_valid()
    if isinstance(result, tuple):
        passed, gallery_id, media_url = result
        all_passed = all_passed and passed
    else:
        all_passed = all_passed and result
    
    result = test_post_gallery_admin_invalid_file()
    all_passed = all_passed and result
    
    result = test_get_gallery_public()
    all_passed = all_passed and result
    
    if media_url:
        result = test_get_media(media_url)
        all_passed = all_passed and result
    
    if gallery_id:
        result = test_delete_gallery_admin(gallery_id)
        all_passed = all_passed and result
        
        result = test_get_gallery_after_delete(gallery_id)
        all_passed = all_passed and result
        
        if media_url:
            result = test_get_media_after_delete(media_url)
            all_passed = all_passed and result
    
    # 5. Logout test
    print("\n" + "="*80)
    print("SECTION 5: LOGOUT")
    print("="*80)
    
    result = test_logout()
    if isinstance(result, tuple):
        passed, logout_token = result
        all_passed = all_passed and passed
    else:
        all_passed = all_passed and result
    
    if logout_token:
        result = test_auth_me_after_logout(logout_token)
        all_passed = all_passed and result
    
    # Final summary
    print("\n" + "="*80)
    print("FINAL SUMMARY")
    print("="*80)
    
    if all_passed:
        print("✅ ALL TESTS PASSED")
        return 0
    else:
        print("❌ SOME TESTS FAILED")
        return 1

if __name__ == "__main__":
    sys.exit(main())

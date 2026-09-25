# Auth-Gated App Testing Playbook (АлуминМастър admin)

## Admin allowlist
- ADMIN_EMAILS env (default): peter200419@gmail.com

## Step 1: Create Test User & Session
mongosh --eval "
use('test_database');
var userId = 'test-user-' + Date.now();
var sessionToken = 'test_session_' + Date.now();
db.users.insertOne({
  user_id: userId,
  email: 'peter200419@gmail.com',
  name: 'Test Admin',
  picture: 'https://via.placeholder.com/150',
  provider: 'google',
  created_at: new Date()
});
db.user_sessions.insertOne({
  user_id: userId,
  session_token: sessionToken,
  expires_at: new Date(Date.now() + 7*24*60*60*1000),
  created_at: new Date()
});
print('Session token: ' + sessionToken);
print('User ID: ' + userId);
"

## Step 2: Test Backend API
curl -X GET ".../api/auth/me" -H "Authorization: Bearer YOUR_SESSION_TOKEN"
curl -X GET ".../api/inquiries" -H "Authorization: Bearer YOUR_SESSION_TOKEN"  # admin only

## Step 3: Browser Testing
Set cookie session_token (httpOnly, secure, sameSite None) then navigate to /admin.

## Endpoints
- POST /api/auth/register {email,password,name}
- POST /api/auth/login {email,password}
- POST /api/auth/session  (body: {session_id}) -> Google exchange
- GET  /api/auth/me
- POST /api/auth/logout
- GET  /api/inquiries              (admin)
- GET  /api/gallery                (public)
- POST /api/gallery (multipart: file,title,category) (admin)
- DELETE /api/gallery/{id}         (admin)
- GET  /api/media/{id}             (public image bytes)

## Test accounts
- Admin: peter200419@gmail.com (via Google) or email/password registered with this email.

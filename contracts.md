# API Contracts — АлуминМастър

## Goal
Add backend to store contact-form inquiries in MongoDB and send an email notification to peter200419@gmail.com via Resend.

## Data currently mocked in frontend (mock.js / Contact.jsx)
- Contact form submission currently saved to `localStorage` under key `inquiries`.
- Replace with POST to backend API.

## Backend Models
Inquiry:
- id: str (uuid)
- name: str (required)
- phone: str (required)
- email: str | ""
- service: str | ""
- message: str | ""
- created_at: datetime

## Endpoints (all prefixed /api)
1. POST /api/inquiries
   - body: { name, phone, email?, service?, message? }
   - validates name & phone required
   - stores in Mongo `inquiries` collection
   - sends email notification via Resend to peter200419@gmail.com
   - returns: { success: true, id }
2. GET /api/inquiries  (admin/list, returns latest 100)

## Frontend integration
- Contact.jsx handleSubmit: POST `${REACT_APP_BACKEND_URL}/api/inquiries` with form data.
- On success -> toast success + reset form. On error -> toast error.
- Remove localStorage mock.

## Email (Resend)
- Managed by Emergent. API key stored in backend/.env as RESEND_API_KEY (or per playbook).
- Sender: onboarding/verified domain per playbook.
- Recipient: peter200419@gmail.com (configurable via env NOTIFY_EMAIL).
- Email content: inquiry details (name, phone, email, service, message).

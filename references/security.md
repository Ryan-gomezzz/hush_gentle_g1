# Security & Threat Model

## Threat Analysis

### 1. Unauthorized Access
- **Risk**: Users accessing admin dashboard or other users' orders.
- **Mitigation**:
    - Strict RLS policies on all tables.
    - Check `is_admin` in Middleware for `/admin` routes.
    - Signed Cookies for session management (Supabase default).

### 2. Injection Attacks (SQL/XSS)
- **Risk**: Malicious input compromising DB or Frontend.
- **Mitigation**:
    - **SQL**: Use Parameterized queries (Supabase SDK does this by default).
    - **XSS**: React automatically escapes content. Use `DOMPurify` if rendering HTML from rich text editors.

### 3. Payment Fraud
- **Risk**: User manipulating `price` in client-side code.
- **Mitigation**:
    - **Never** trust client price.
    - Recalculate cart total on backend using DB prices before creating Payment Intent.

### 4. Bot/Abuse
- **Risk**: Chatbot API abuse or fake account creation.
- **Mitigation**:
    - Rate limiting on `api/chatbot` and `auth/signup`.
    - Captcha on signup (optional - keeping it simple for now).

## Admin Security
- Admin is a **Role**, not a separate app.
- Admin dashboard is guarded by:
    1. Auth Check (Must be logged in).
    2. Role Check (Must be 'admin').
- Logs: All critical admin actions (product delete, refund) logged to `audit_logs` (stretch goal) or simple console logs for MVP.

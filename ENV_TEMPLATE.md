# Environment Variables Template

Copy the content below to create your `.env.local` file:

```env
# ============================================
# Hush Gentle Ecommerce - Environment Variables
# ============================================
# Copy this content to .env.local and fill in your actual values

# ============================================
# SUPABASE CONFIGURATION
# ============================================
# Get these from your Supabase project settings: https://app.supabase.com/project/_/settings/api
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# ============================================
# OPENAI CONFIGURATION (For Chatbot)
# ============================================
# Get your API key from: https://platform.openai.com/api-keys
OPENAI_API_KEY=sk-your_openai_api_key_here

# ============================================
# SITE URL (For Email Links)
# ============================================
# Use your production URL when deployed, or localhost for development
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# ============================================
# EMAIL CONFIGURATION
# ============================================
# Choose ONE email provider below and comment out the others

# --- Option 1: Resend (Recommended - Easiest Setup) ---
# Sign up at: https://resend.com
# Get API key from: https://resend.com/api-keys
RESEND_API_KEY=re_your_resend_api_key_here
RESEND_FROM_EMAIL=noreply@yourdomain.com

# --- Option 2: SendGrid ---
# Uncomment and configure if using SendGrid instead
# Sign up at: https://sendgrid.com
# Get API key from: https://app.sendgrid.com/settings/api_keys
# SENDGRID_API_KEY=SG.your_sendgrid_api_key_here
# SENDGRID_FROM_EMAIL=noreply@yourdomain.com

# --- Option 3: SMTP (Generic SMTP Server) ---
# Uncomment and configure if using a generic SMTP server
# SMTP_HOST=smtp.example.com
# SMTP_PORT=587
# SMTP_USER=your_smtp_username
# SMTP_PASSWORD=your_smtp_password
# SMTP_FROM_EMAIL=noreply@yourdomain.com
```

## Quick Setup Instructions

1. **Create `.env.local` file** in the root directory
2. **Copy the template above** into `.env.local`
3. **Fill in your actual values** for each variable
4. **Choose ONE email provider** (Resend recommended) and comment out the others

## Where to Get API Keys

- **Supabase**: https://app.supabase.com/project/_/settings/api
- **OpenAI**: https://platform.openai.com/api-keys
- **Resend**: https://resend.com/api-keys
- **SendGrid**: https://app.sendgrid.com/settings/api_keys

## Important Notes

- `.env.local` is already in `.gitignore` - it will NOT be committed to git
- For production, set these variables in your hosting platform's environment settings
- `NEXT_PUBLIC_*` variables are exposed to the browser (safe for public keys)
- `SUPABASE_SERVICE_ROLE_KEY` should NEVER be exposed to client (server-only)


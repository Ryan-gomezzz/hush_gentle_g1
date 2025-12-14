# Admin Dashboard Setup Guide

## Quick Setup

No special environment variables are needed for admin login. The admin dashboard uses standard Supabase authentication.

### Required Environment Variables (Already Set)

Make sure these are in your `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
```

**Note:** `SUPABASE_SERVICE_ROLE_KEY` is only used for auto-confirming new user signups (demo feature). It's NOT needed for admin login.

## Setting Up an Admin User

### Step 1: Create or Login with a User Account

1. Go to your website and sign up with an email/password (e.g., `admin@hushgentle.local` / `12345`)
2. Or login if you already have an account

### Step 2: Make the User an Admin

1. Go to your Supabase project: https://app.supabase.com
2. Navigate to **SQL Editor**
3. Run this SQL query:

```sql
-- First, find your user ID by email
SELECT id, email FROM auth.users WHERE email = 'admin@hushgentle.local';

-- Then update the profile to make them admin
-- Replace 'USER_ID_HERE' with the ID from the query above
UPDATE profiles 
SET is_admin = true 
WHERE id = 'USER_ID_HERE';
```

**Or use this one-liner (replace the email):**

```sql
UPDATE profiles 
SET is_admin = true 
WHERE id = (SELECT id FROM auth.users WHERE email = 'admin@hushgentle.local');
```

### Step 3: Access Admin Dashboard

1. Make sure you're logged in with the admin account
2. Visit: `/admin` or `/dashboard`
3. You should now see the admin dashboard!

## Troubleshooting

### "I'm redirected to home page when visiting /admin"

**Problem:** Your user account doesn't have `is_admin = true` set.

**Solution:** Run the SQL query in Step 2 above.

### "I'm redirected to /login when visiting /admin"

**Problem:** You're not logged in.

**Solution:** 
1. Go to `/login`
2. Login with your admin account
3. Then visit `/admin` again

### "How do I check if a user is admin?"

Run this SQL query:

```sql
SELECT 
    p.id,
    u.email,
    p.is_admin
FROM profiles p
JOIN auth.users u ON p.id = u.id
WHERE u.email = 'admin@hushgentle.local';
```

### "I want to remove admin access"

```sql
UPDATE profiles 
SET is_admin = false 
WHERE id = (SELECT id FROM auth.users WHERE email = 'user@example.com');
```

## Admin Dashboard Features

Once you have admin access, you can:

- View dashboard KPIs (revenue, orders, conversion rate)
- Manage products (add, edit, delete)
- View and manage orders
- Manage testimonials and reviews
- View chatbot usage
- Access analytics

## Security Notes

- Admin access is protected by middleware - only users with `is_admin = true` can access `/dashboard` routes
- Never expose `SUPABASE_SERVICE_ROLE_KEY` to the client
- Always use strong passwords for admin accounts
- Consider using environment-specific admin accounts (different for dev/staging/production)


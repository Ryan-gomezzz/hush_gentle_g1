# Security Documentation

## Overview
This document outlines the security measures implemented in the Hush Gentle e-commerce application.

## Authentication & Authorization

### Authentication
- **Provider**: Supabase Auth
- **Methods**: Email/Password, Google OAuth (if configured)
- **Session Management**: Secure HTTP-only cookies via Supabase SSR

### Authorization
- **Admin Access**: Protected via middleware and server-side checks
- **Middleware Protection**: All `/dashboard` and `/admin` routes require authentication and admin role
- **Server Actions**: All admin actions use `requireAdmin()` function
- **RLS Policies**: Row Level Security enabled on all user-data tables

### Implementation
- `middleware.ts`: Checks authentication and admin status for protected routes
- `lib/utils/admin-check.ts`: Server-side admin verification
- All admin server actions verify admin status before execution

## API Security

### Input Validation
- **Zod Schemas**: All API routes use Zod for input validation
- **Location**: `lib/utils/validation.ts`
- **Coverage**:
  - Chatbot API: Message length and format validation
  - Analytics API: Event name, metadata, and location validation

### Rate Limiting
- **Implementation**: In-memory rate limiter (`lib/utils/rate-limit.ts`)
- **Limits**:
  - Chatbot API: 20 requests per minute per user/IP
  - Analytics API: 100 requests per minute per user/IP
- **Note**: For production, consider using Redis or a dedicated rate limiting service

### XSS Prevention
- **React Auto-escaping**: React automatically escapes content
- **Input Sanitization**: String inputs are sanitized in validation utilities
- **No HTML Rendering**: User-generated content is not rendered as HTML

### SQL Injection Prevention
- **Supabase SDK**: All queries use parameterized queries (Supabase handles this)
- **No Raw SQL**: No direct SQL queries in application code

## Data Security

### Sensitive Data
- **Secrets**: All secrets stored in environment variables
- **Service Role Key**: Never exposed to client, only used server-side
- **Client Keys**: Only `NEXT_PUBLIC_*` variables exposed to client (safe for public keys)

### Payment Security
- **Price Validation**: Server-side price recalculation on order creation
- **Stock Validation**: Server-side stock checks before order creation
- **No Card Storage**: Payment card data is never stored (only transaction IDs)

### Database Security
- **RLS Policies**: Row Level Security enabled on all tables
- **Foreign Key Constraints**: All relationships have foreign key constraints
- **Indexes**: Proper indexes for performance and data integrity

## DPDP Act Compliance

### Data Collection
- **Consent Required**: Analytics tracking requires explicit user consent
- **Location Tracking**: Requires explicit consent before requesting location
- **Purpose Limitation**: Only necessary data is collected

### User Rights
- **Data Export**: Users can export all their data (`exportUserData()`)
- **Data Deletion**: Users can delete their data (`deleteUserData()`)
- **Right to Erasure**: Implemented with proper cascading deletes

### Implementation
- `lib/actions/user.ts`: Contains data export and deletion functions
- `lib/analytics.ts`: Checks consent before tracking
- `components/analytics/GeoLocationTracker.tsx`: Requires consent before location tracking

## Security Best Practices

### Server Actions
- All server actions validate inputs
- Admin actions verify admin status
- User actions verify user ownership of data

### API Routes
- Input validation with Zod
- Rate limiting
- Proper error handling (no sensitive data in errors)

### Environment Variables
- `.env.local` in `.gitignore`
- No secrets in code
- `NEXT_PUBLIC_*` only for safe public keys

## Known Limitations

1. **Rate Limiting**: Currently in-memory (not distributed). For production, use Redis.
2. **Admin Check**: Middleware queries DB on every request (consider caching for production).
3. **Consent Storage**: Analytics consent storage needs implementation (add field to profiles or consent table).

## Recommendations

1. **Implement Redis** for distributed rate limiting
2. **Add caching** for admin status checks
3. **Add consent table** for tracking user consents
4. **Implement CSRF protection** for forms (Next.js provides some protection)
5. **Add security headers** via Next.js headers configuration
6. **Regular security audits** of dependencies
7. **Implement logging** for security events (admin actions, failed logins, etc.)

## Security Checklist

- [x] Authentication implemented
- [x] Authorization checks in place
- [x] Input validation on API routes
- [x] Rate limiting on API routes
- [x] XSS prevention
- [x] SQL injection prevention
- [x] Secrets in environment variables
- [x] RLS policies enabled
- [x] DPDP compliance features
- [ ] CSRF protection (Next.js provides some)
- [ ] Security headers configured
- [ ] Security logging implemented
- [ ] Dependency security scanning


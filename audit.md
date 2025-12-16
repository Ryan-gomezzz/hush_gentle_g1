# Codebase Audit - Incomplete Components & Workflows

This document tracks components, workflows, and features that are in development or incomplete. These should NOT be deleted but completed during the development process.

## Last Updated
2024-12-19

---

## Frontend Components

### 1. `components/admin/ProductSKUForm.tsx`
**Status:** Functional but may need integration testing
**Notes:**
- Component is complete and functional
- Handles SKU creation with size, price, stock, and SKU code
- Needs verification that it properly integrates with product creation/update forms
- Consider adding validation for duplicate SKU codes

### 2. `components/checkout/CheckoutAddressForm.tsx`
**Status:** Functional but address management flow needs verification
**Notes:**
- Component handles delivery and billing address selection
- Supports saved addresses and new address entry
- Needs verification that address creation/update endpoints are fully integrated
- Check that address limits (2 delivery, 1 billing) are enforced server-side

### 3. Payment Integration
**Status:** Partial - COD (Cash on Delivery) implemented, online payment gateways pending
**Notes:**
- COD payment flow is complete and functional
- Stripe/Razorpay integration interfaces exist but not fully implemented
- Payment provider abstraction layer exists in codebase
- Need to implement:
  - Stripe payment intent creation
  - Razorpay payment gateway integration
  - Webhook handlers for payment confirmation
  - Payment status updates

### 4. Email Functionality
**Status:** Basic implementation complete, may need template refinement
**Notes:**
- Email sender (`lib/email/sender.ts`) is implemented with Resend
- Email templates exist in `lib/email/templates.ts`
- Configuration exists in `lib/email/config.ts`
- Needs verification:
  - All email templates are properly formatted
  - Error handling for email failures
  - Email delivery tracking

---

## Backend Workflows

### 1. Address Management (`lib/actions/addresses.ts`)
**Status:** Complete but needs security review
**Notes:**
- CRUD operations for addresses are implemented
- Address limits are enforced (2 delivery, 1 billing)
- Needs verification:
  - RLS policies on `user_addresses` table
  - User can only access/modify their own addresses
  - Address validation (format, required fields)

### 2. Product SKU Management
**Status:** Partially implemented
**Notes:**
- SKU creation during product creation is implemented
- SKU update/delete workflows may need completion
- Need to verify:
  - SKU stock management
  - SKU price override logic
  - Cart integration with SKUs

### 3. Analytics & Tracking
**Status:** Basic implementation complete, DPDP compliance pending
**Notes:**
- Event tracking is implemented
- Page view tracking exists
- Geo-location tracking exists but needs consent mechanism
- Needs implementation:
  - User consent for analytics tracking
  - Data export functionality
  - Data deletion functionality (DPDP compliance)
  - Privacy policy integration

### 4. Chatbot Integration
**Status:** Functional but may need optimization
**Notes:**
- Chatbot API route exists (`app/api/chatbot/route.ts`)
- Session management is implemented
- Needs verification:
  - Rate limiting (currently missing)
  - Input validation and sanitization
  - Error handling improvements
  - Cost optimization (context window management)

---

## Database & Schema

### 1. RLS Policies
**Status:** Needs comprehensive review
**Notes:**
- Some RLS policies exist in migrations
- Need to verify all user-data tables have proper RLS:
  - `user_addresses` - verify user can only access own addresses
  - `wishlists` - verify user can only access own wishlist
  - `user_product_views` - verify user can only access own views
  - `chatbot_sessions` - verify user can only access own sessions
  - `analytics_events` - verify user can only access own events (if needed)

### 2. Indexes
**Status:** Most indexes exist, may need composite indexes
**Notes:**
- Basic indexes are created in migrations
- May need composite indexes for common query patterns:
  - `(user_id, created_at)` on orders for user order history
  - `(product_id, is_archived)` on products for catalog queries
  - `(event_name, created_at)` on analytics_events for reporting

---

## Security & Compliance

### 1. DPDP Act Compliance
**Status:** Needs implementation
**Notes:**
- User data export functionality - NOT IMPLEMENTED
- User data deletion (Right to Erasure) - NOT IMPLEMENTED
- Consent management for analytics - NOT IMPLEMENTED
- Privacy policy integration points - NOT IMPLEMENTED
- Data minimization review - PARTIAL (geo-location needs consent)

### 2. Rate Limiting
**Status:** Missing
**Notes:**
- Chatbot API needs rate limiting
- Login/signup endpoints need rate limiting
- Analytics API may need rate limiting

### 3. Input Validation
**Status:** Partial
**Notes:**
- FormData inputs in server actions need Zod validation
- API route inputs need validation
- XSS prevention needs review (React auto-escapes, but verify)

---

## Performance Optimizations Needed

### 1. Query Optimization
**Status:** Some N+1 issues identified
**Notes:**
- `getAllOrders()` in `lib/actions/admin.ts` - fetches users separately (optimized but verify)
- `getDashboardKPIs()` - multiple separate queries (can be optimized)
- Product queries - verify joins are efficient

### 2. Frontend Optimizations
**Status:** Needs review
**Notes:**
- Dynamic imports for heavy components (chatbot, charts)
- React.memo for ProductCard and other list items
- Image optimization (verify all use next/image)

### 3. Middleware Optimization
**Status:** Needs optimization
**Notes:**
- Admin check in middleware queries DB on every request
- Consider caching admin status or optimizing query

---

## Known Issues

1. **Payment Gateway Integration**: Only COD is fully functional
2. **DPDP Compliance**: User data export/deletion not implemented
3. **Rate Limiting**: Missing on critical endpoints
4. **Geo-location Consent**: Tracks without explicit consent UI
5. **Analytics Consent**: No consent mechanism for analytics tracking

---

## Testing Needs

1. End-to-end testing of checkout flow
2. Address management workflow testing
3. Admin dashboard functionality testing
4. Payment integration testing (when implemented)
5. Security testing (authorization, input validation)
6. Performance testing (query optimization verification)

---

## Future Enhancements

1. Payment gateway integration (Stripe/Razorpay)
2. Advanced analytics dashboard
3. Email marketing integration
4. Product review system (user-submitted reviews)
5. Inventory management enhancements
6. Order tracking system
7. Customer support ticket system


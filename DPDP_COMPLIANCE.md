# DPDP Act Compliance Documentation

## Overview
This document outlines the Digital Personal Data Protection Act (DPDP Act) compliance measures implemented in the Hush Gentle e-commerce application.

## Compliance Features

### 1. Data Collection & Consent

#### Analytics Tracking
- **Consent Required**: Analytics tracking requires explicit user consent
- **Implementation**: `lib/analytics.ts` checks consent before tracking
- **Default**: Opt-in (no tracking without consent)
- **Location**: `lib/actions/user.ts` - `hasAnalyticsConsent()` and `setAnalyticsConsent()`

#### Location Tracking
- **Consent Required**: Location tracking requires explicit user consent
- **Implementation**: `components/analytics/GeoLocationTracker.tsx` checks for consent
- **Storage**: Consent stored in `localStorage` as `location_tracking_consent`
- **Default**: No location tracking without explicit consent

#### Data Minimization
- Only necessary data is collected
- No PII in analytics metadata (unless explicitly consented)
- Location data only collected with consent

### 2. User Rights

#### Right to Access (Data Export)
- **Function**: `exportUserData()` in `lib/actions/user.ts`
- **Returns**: All user data in JSON format including:
  - Profile information
  - Orders and order history
  - Cart contents
  - Wishlist
  - Saved addresses
  - Product view history
  - Chatbot sessions and messages
  - Analytics events
- **Usage**: Users can request their data export through account settings

#### Right to Erasure (Data Deletion)
- **Function**: `deleteUserData()` in `lib/actions/user.ts`
- **Deletes**:
  - User addresses
  - Wishlist and wishlist items
  - Cart and cart items
  - Product view history
  - Chatbot sessions and messages
  - Analytics events (anonymized)
  - Profile
  - Auth user account
- **Anonymizes**:
  - Orders (kept for legal compliance but PII removed)
- **Note**: Orders are anonymized rather than deleted to comply with legal requirements (tax, accounting, etc.)

### 3. Data Storage & Security

#### Encryption
- **At Rest**: Supabase provides encryption at rest (default)
- **In Transit**: HTTPS/TLS for all communications

#### PII Handling
- **No PII in Logs**: Logs do not contain personally identifiable information
- **Analytics Events**: User ID is optional, no PII in metadata
- **Payment Data**: Only transaction IDs stored, no card data

### 4. Privacy Policy Integration

#### Consent Management
- **Analytics Consent**: `hasAnalyticsConsent()` and `setAnalyticsConsent()` functions
- **Location Consent**: Stored in `localStorage` (consider moving to database)
- **Implementation Needed**: UI for users to manage consents

#### Privacy Policy Hooks
- **Placeholder**: Functions exist but UI integration needed
- **Recommendation**: Add consent management page in account settings

## Implementation Status

### Completed
- [x] Data export functionality
- [x] Data deletion functionality
- [x] Consent checks for analytics
- [x] Consent checks for location tracking
- [x] Data minimization practices
- [x] No PII in logs

### Pending
- [ ] Consent management UI
- [ ] Consent storage in database (currently localStorage for location)
- [ ] Privacy policy page integration
- [ ] Cookie consent banner
- [ ] Data retention policies
- [ ] Data breach notification procedures

## Data Collection Inventory

### Personal Data Collected
1. **Profile Data**: Name, email, avatar (from Supabase Auth)
2. **Order Data**: Shipping address, billing address, order history
3. **Address Data**: Saved delivery and billing addresses
4. **Cart Data**: Products in cart
5. **Wishlist Data**: Saved products
6. **View History**: Products viewed by user
7. **Chatbot Data**: Conversation history
8. **Analytics Data**: Page views, events (with consent)

### Sensitive Personal Data
- **Payment Information**: Only transaction IDs stored (no card data)
- **Location Data**: Only collected with explicit consent

### Data Sharing
- **No Third-Party Sharing**: Data is not shared with third parties
- **Supabase**: Data stored in Supabase (data processor)
- **Email Provider**: Resend (for transactional emails only)

## Compliance Checklist

### Data Collection
- [x] Explicit consent for analytics
- [x] Explicit consent for location tracking
- [x] Purpose limitation (only necessary data)
- [x] Data minimization

### User Rights
- [x] Right to access (data export)
- [x] Right to erasure (data deletion)
- [ ] Right to rectification (update data - exists but needs UI)
- [ ] Right to portability (data export in machine-readable format)

### Data Security
- [x] Encryption at rest (Supabase default)
- [x] Encryption in transit (HTTPS)
- [x] Access controls (RLS policies)
- [x] No PII in logs

### Legal Requirements
- [x] Data deletion functionality
- [x] Order anonymization (legal compliance)
- [ ] Privacy policy (needs creation)
- [ ] Terms of service (needs creation)
- [ ] Cookie policy (needs creation)

## Recommendations

1. **Create Consent Management UI**: Allow users to view and manage their consents
2. **Move Consent to Database**: Store consents in database instead of localStorage
3. **Add Privacy Policy Page**: Create and link privacy policy
4. **Implement Cookie Consent Banner**: For EU/UK compliance
5. **Add Data Retention Policies**: Define and implement data retention periods
6. **Create Data Breach Procedures**: Document and implement breach notification procedures
7. **Regular Audits**: Conduct regular compliance audits

## Legal Notes

- **Orders Retention**: Orders are anonymized rather than deleted to comply with tax and accounting requirements
- **Consent Storage**: Consider legal requirements for consent record-keeping
- **Data Processing Agreements**: Ensure Supabase and other processors have appropriate agreements
- **Jurisdiction**: Ensure compliance with local data protection laws in addition to DPDP Act


# Data Model & Schema Rationale

## Core Tables

### 1. `users` (managed by Supabase Auth)
- **Role**: Identity Source of Truth.
- **Link**: Linked to `public.profiles` via trigger.

### 2. `profiles`
- **Fields**: `id` (PK, ref users), `full_name`, `avatar_url`, `created_at`.
- **Purpose**: Application-level user data.

### 3. `products`
- **Fields**: `id`, `name`, `slug`, `description`, `price`, `stock`, `category_id`, `attributes` (JSONB), `is_featured`, `created_at`.
- **JSONB**: Used for `ingredients`, `benefits`, `usage_instructions` to avoid excessive joined tables for flexible content.

### 4. `product_images`
- **Fields**: `id`, `product_id`, `url`, `alt_text`, `display_order`.

### 5. `categories`
- **Fields**: `id`, `name`, `slug`, `description`.

### 6. `carts` & `cart_items`
- **Persistence**: Carts are persistent. Anonymous carts cookie-based, merged on login.
- **Fields**: `user_id` (nullable), `session_id`, `status` (active/abandoned/converted).

### 7. `orders` & `order_items`
- **Fields**: `id`, `user_id`, `status` (pending/paid/shipped/cancelled), `total_amount`, `payment_intent_id`, `shipping_address` (JSONB).

### 8. `payments`
- **Fields**: `id`, `order_id`, `provider` (stripe/razorpay), `status`, `amount`, `transaction_id`.

## Social Proof Tables

### 9. `testimonials`
- **Fields**: `id`, `author_name`, `content`, `rating`, `is_published`.

### 10. `amazon_reviews`
- **Purpose**: Static import of verified reviews.
- **Fields**: `id`, `product_id`, `rating`, `review_text`, `reviewer_name`, `review_date`, `is_verified_purchase`.

## Advanced Features

### 11. `chatbot_sessions` & `chatbot_messages`
- **Purpose**: Store conversation history for user context and admin review.
- **Fields**: `session_id`, `role` (user/assistant), `content`, `usage_tokens`.

### 12. `analytics_events`
- **Purpose**: Internal lightweight analytic tracking.
- **Fields**: `id`, `user_id`, `event_name` (page_view, add_to_cart, checkout_start), `metadata` (JSONB), `created_at`.
- **Strategy**: Daily aggregation job will summarize this into a `daily_stats` table for fast admin dashboard loading.

## RLS (Row Level Security) Implementation
- **Public Read**: Products, Categories, Reviews, Testimonials.
- **Owner Write**: Cart, Orders, Profile.
- **Admin Full Access**: All tables (via `is_admin` claim or specific user list).

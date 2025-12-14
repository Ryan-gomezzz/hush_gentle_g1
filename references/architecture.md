# System Architecture - Hush Gentle

## Overview
Hush Gentle is a monolithic-style full-stack e-commerce application built on Next.js 14+ (App Router). It leans heavily on server-side rendering (RSC) for performance and SEO, with Supabase handling persistence, auth, and real-time capabilities.

## Tech Stack
- **Frontend**: React 18, Next.js 14 (App Router), Tailwind CSS
- **Backend**: Next.js Server Actions, Route Handlers (API)
- **Database**: PostgreSQL (managed by Supabase)
- **Auth**: Supabase Auth (Email/Password, Google OAuth)
- **Storage**: Supabase Storage (Buckets for product images)
- **Payments**: Generic Abstraction Layer (Interfaces for Stripe/Razorpay)
- **Hosting**: Netlify (Edge/Serverless functions compatible)

## Component Architecture

### 1. Storefront (Public)
- **Layout**: `app/(shop)/layout.tsx` - Global shared UI (Nav, Footer).
- **Pages**:
    - `page.tsx` (Home): SSG + ISR (Revalidate every hour).
    - `products/page.tsx` (Catalog): Server Component with searchParams for filtering.
    - `products/[slug]/page.tsx` (Detail): Server Component, fetches data by slug.
    - `cart/page.tsx`: Client Component (needs local interaction state).

### 2. Admin Dashboard (Private)
- **Route Group**: `app/(admin)`
- **Protection**: Middleware checks `users.role` claims or `admin_users` table presence.
- **Features**:
    - **KPIs**: Calculated via Postgres aggregations (Materialized Views or simple efficient queries).
    - **CMS**: Forms for editing Product/Category data.

### 3. Backend Layer
- **Server Actions**: Mutations (Add to Cart, Update Profile, Checkout).
    - `addToCart(productId, quantity)`
    - `createOrder(cartId)`
- **API Routes**: `app/api/chatbot/route.ts` (Streaming responses).

## Data Flow
1. **User Request** -> **Next.js Edge/Node** -> **Supabase (Postgres)**
2. **Read**: Heavily cached via `fetch(url, { next: { revalidate: 3600 } })`.
3. **Write**: Direct writes via Server Actions (which invalidate cache tags).

## Integrations
- **AI Chatbot**: Stateless endpoint calling LLM API, storing history in `chatbot_sessions`.
- **Payment**: `PaymentProvider` interface. `createPaymentIntent` returns a client secret or redirect URL.

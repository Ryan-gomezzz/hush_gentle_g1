# Project Assumptions

### 1. Payment Processing
- We assume the client will eventually use Stripe or Razorpay.
- For MVP, we mock the success/failure flows without actual money transfer.

### 2. Product Images
- We assume placeholders are sufficient for the demo.
- We assume the user has the rights to the provided images.

### 3. Analytics
- We assume internal simple analytics are preferred over Google Analytics for privacy/simplicity.
- "Sales" and "Traffic" data in the admin dashboard will be derived from our own DB, not external sources.

### 4. Hosting
- We assume standard Node.js serverless environment (Netlify/Vercel).
- We assume generic environment variables support.

### 5. Chatbot
- We assume a generic LLM (like GPT-3.5/4 or basic Gemini) is sufficient.
- The context window will be limited to top ~20 products to manage costs/complexity.

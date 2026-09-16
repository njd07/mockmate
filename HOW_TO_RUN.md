# How to Run & Deploy MockMate — Complete Guide

Welcome to **MockMate**! This guide walks you through running MockMate locally, setting up your free API keys step-by-step (Supabase, Stripe, Clerk, Groq, Gemini), and deploying to Vercel for free.

---

## ⚡ Quick Start: Zero-Config Demo Mode (Under 1 Minute)

You can launch and test MockMate immediately without setting up any accounts or databases:

1. Open your terminal in the project directory:
   ```bash
   npm run dev
   ```

2. Open your browser to:
   ```
   http://localhost:3000
   ```
   *(or the port printed in your terminal, e.g., 8080)*

> **Why this works out-of-the-box:**  
> If external API keys are omitted, MockMate activates its built-in **Interactive Demo Mode**:
> - 1-Click Candidate login (no sign-up required)
> - In-memory database persistence with full session tracking
> - Free Microsoft Edge TTS speech narration
> - Simulated Stripe Checkout with test card `4242 4242 4242 4242`

---

## 🔑 Complete Production Setup (100% Free Tiers)

To connect real persistent cloud services, create a `.env` file in the project root:
```bash
cp .env.example .env
```

Here is the `.env` template:
```env
# ─── App URL ───
VITE_APP_URL=http://localhost:3000

# ─── 1. AI Providers ───
GROQ_API_KEY=gsk_...
GEMINI_API_KEY=AIzaSy...

# ─── 2. Clerk Authentication ───
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# ─── 3. Supabase Postgres Database ───
SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# ─── 4. Stripe Payments ───
STRIPE_SECRET_KEY=sk_test_...
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_PRICE_ID=price_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

---

## 📋 Step-by-Step API Key Walkthrough

### 1. Groq (Primary AI — ~500 tokens/sec, completely free)
1. Visit [https://console.groq.com](https://console.groq.com) and sign in with Google or GitHub.
2. In the left sidebar, click **API Keys**.
3. Click **Create API Key**, name it `MockMate`, and copy the key (starts with `gsk_`).
4. Paste it as `GROQ_API_KEY` in `.env`.

---

### 2. Google Gemini (AI Fallback — Free Google AI Studio tier)
1. Visit [https://aistudio.google.com/apikey](https://aistudio.google.com/apikey) and sign in.
2. Click **Create API Key** → select or create a Google Cloud project.
3. Copy the key (starts with `AIzaSy`).
4. Paste it as `GEMINI_API_KEY` in `.env`.

---

### 3. Clerk (Modern Authentication & Google Sign-In)
1. Visit [https://dashboard.clerk.com](https://dashboard.clerk.com) and sign in.
2. Click **Add application** → name it `MockMate` → check **Email** and **Google**.
3. In the dashboard under **API Keys**, copy:
   - **Publishable Key** (`pk_test_...`) → paste as `VITE_CLERK_PUBLISHABLE_KEY`
   - **Secret Key** (`sk_test_...`) → paste as `CLERK_SECRET_KEY`

---

### 4. Supabase (Free Persistent Postgres Database)
1. Visit [https://supabase.com](https://supabase.com) and click **New project** (choose free tier).
2. Once the project is provisioned, go to **Project Settings** (gear icon) → **API**:
   - Copy **Project URL** → paste as `SUPABASE_URL`
   - Copy **`service_role` secret key** (click *Reveal*) → paste as `SUPABASE_SERVICE_ROLE_KEY`
3. Go to the **SQL Editor** in your Supabase dashboard:
   - Open [`supabase/schema.sql`](supabase/schema.sql) in this repo.
   - Copy the entire SQL script and paste it into the Supabase SQL editor.
   - Click **Run**.
   - Your `user_profiles` and `session_history` tables and indexes are now ready!

---

### 5. Stripe (Test Mode Payments & Subscriptions)
1. Visit [https://dashboard.stripe.com](https://dashboard.stripe.com) and create an account.
2. Make sure the toggle at the top is set to **Test Mode**.
3. Go to **Developers** → **API keys**:
   - Copy **Publishable key** (`pk_test_...`) → paste as `VITE_STRIPE_PUBLISHABLE_KEY`
   - Copy **Secret key** (`sk_test_...`) → paste as `STRIPE_SECRET_KEY`
4. Go to **Product catalog** → **Add product**:
   - Name: `MockMate Pro`
   - Price: `₹499` (or `$6.99`) per month (Recurring)
   - Save the product and copy the **Price ID** (`price_...`) → paste as `STRIPE_PRICE_ID`
5. *(Optional)* **Webhooks**:
   - In Stripe Dashboard → **Developers** → **Webhooks** → **Add endpoint**:
   - Endpoint URL: `https://your-domain.vercel.app/api/stripe-webhook`
   - Select events to listen to:
     - `checkout.session.completed`
     - `customer.subscription.deleted`
     - `customer.subscription.updated`
   - Copy the **Signing secret** (`whsec_...`) → paste as `STRIPE_WEBHOOK_SECRET`
6. Test payment with test card: `4242 4242 4242 4242` (any future MM/YY, any 3 digits CVC).

---

## 🛠️ Verification & Build Commands

```bash
# Type check all routes and components
npx tsc --noEmit

# Test production build
npm run build

# Start local dev server
npm run dev
```

---

## 🚀 Free Deployment to Vercel (Recommended)

1. Push your code to GitHub:
   ```bash
   git add .
   git commit -m "feat: complete MockMate with Supabase and Stripe"
   git push origin main
   ```

2. Go to [https://vercel.com](https://vercel.com) and log in.
3. Click **Add New** → **Project** → import `mockmate` (or `njd07/mockmate`).
4. In the project settings under **Environment Variables**, add the keys from your `.env`:
   - `GROQ_API_KEY`
   - `GEMINI_API_KEY`
   - `VITE_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `STRIPE_SECRET_KEY`
   - `VITE_STRIPE_PUBLISHABLE_KEY`
   - `STRIPE_PRICE_ID`
   - `STRIPE_WEBHOOK_SECRET`
5. Click **Deploy**. Vercel will build the SSR bundle and provide your live URL!

---

## 💡 Pro Tips

- **Speech Recognition:** Modern browsers require microphone permission. Allow it when the browser prompts.
- **Audio Output:** Browsers require an initial user click before playing synthesized voice audio. MockMate includes a clean "Begin Interview" click screen that automatically unlocks audio.
- **Dark/Light Mode:** Toggle with the Sun/Moon icon in the header; preference is persisted in `localStorage`.

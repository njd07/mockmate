# How to Run MockMate — Step-by-Step Guide

Welcome to **MockMate**! This guide walks you through running the project locally in under 2 minutes, adding your free API keys step-by-step, and deploying it online for free.

---

## ⚡ Option 1: Instant Quick Start (Zero-Config Demo Mode)

You can launch and explore MockMate **immediately** without configuring any API keys or databases:

1. Open your terminal in the project directory:
   ```bash
   cd /home/nrishan/Documents/projects/MGT-PROJECT
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

> **Why this works out-of-the-box:**  
> If external API keys are omitted, MockMate automatically activates **Interactive Demo Mode**:
> - 1-Click Candidate login (no sign-up required)
> - In-memory database persistence
> - Free Microsoft Edge TTS speech narration
> - Simulated Stripe Checkout with test card `4242 4242 4242 4242`

---

## 🔑 Option 2: Full Setup with Free Cloud Services

To unlock the full production capabilities, set up your free accounts and create a `.env` file in the root folder.

### Step 1: Create your `.env` File
In the project root, create a file named `.env`:
```bash
touch .env
```

Here is the complete template to paste into your `.env`:
```env
# ─── 1. High-Speed AI Engine (Free) ───
GROQ_API_KEY=gsk_your_groq_key_here
GEMINI_API_KEY=AIzaSy_your_gemini_key_here

# ─── 2. Clerk Authentication ───
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
CLERK_SECRET_KEY=sk_test_your_secret_key_here

# ─── 3. Supabase Postgres Database (Free) ───
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ_your_service_role_key_here

# ─── 4. Stripe (Test Mode) ───
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
STRIPE_PRICE_ID=price_your_test_price_id_here
```

---

### Step 2: Get Your Free API Keys Step-by-Step

#### 1. Groq (Primary AI — ~500 tokens/sec, completely free)
1. Go to [https://console.groq.com](https://console.groq.com) and sign up with Google or GitHub.
2. In the left sidebar, click **API Keys**.
3. Click **Create API Key**, name it `MockMate`, and copy the key (starts with `gsk_`).
4. Paste it as `GROQ_API_KEY` in your `.env`.

#### 2. Google Gemini (AI Fallback — Free Google AI Studio tier)
1. Go to [https://aistudio.google.com/apikey](https://aistudio.google.com/apikey) and sign in.
2. Click **Create API Key** → select or create a Google Cloud project.
3. Copy the key (starts with `AIzaSy`).
4. Paste it as `GEMINI_API_KEY` in your `.env`.

#### 3. Local Ollama (Optional Local Offline Inference)
If you have [Ollama](https://ollama.com) installed:
1. Start Ollama with Mistral or Llama 3:
   ```bash
   ollama run mistral:7b-instruct-q3_K_M
   ```
2. In MockMate, click the **Settings ⚙️** icon → toggle on **"Use Local Ollama"**.

#### 4. Clerk (Modern Authentication & Google Sign-In)
1. Go to [https://dashboard.clerk.com](https://dashboard.clerk.com) and create a free account.
2. Click **Add application** → name it `MockMate` → select **Email** and **Google** sign-in methods.
3. In your dashboard under **API Keys**, copy:
   - **Publishable Key** (starts with `pk_test_`) → paste into `VITE_CLERK_PUBLISHABLE_KEY`
   - **Secret Key** (starts with `sk_test_`) → paste into `CLERK_SECRET_KEY`

#### 5. Supabase (Free Persistent Postgres Database)
1. Go to [https://supabase.com](https://supabase.com) and create a free project.
2. Go to **Project Settings** (gear icon) → **API**:
   - Copy **Project URL** → paste into `SUPABASE_URL`
   - Copy **`service_role` secret key** (revealed by clicking Reveal) → paste into `SUPABASE_SERVICE_ROLE_KEY`
3. Go to the **SQL Editor** in your Supabase dashboard:
   - Open [`supabase/schema.sql`](file:///home/nrishan/Documents/projects/MGT-PROJECT/supabase/schema.sql) from this project.
   - Copy all contents, paste into the Supabase SQL Editor, and click **Run**.
   - This creates the `user_profiles` and `session_history` tables.

#### 6. Stripe Test Mode (Freemium Checkout & Upgrades)
1. Go to [https://dashboard.stripe.com](https://dashboard.stripe.com) and sign up (free).
2. Ensure the top toggle is set to **Test Mode**.
3. Go to **Developers** → **API keys**:
   - Copy **Publishable key** (`pk_test_...`) → paste into `VITE_STRIPE_PUBLISHABLE_KEY`
   - Copy **Secret key** (`sk_test_...`) → paste into `STRIPE_SECRET_KEY`
4. Go to **Product catalog** → **Add product**:
   - Name: `MockMate Pro`
   - Price: `₹499` / month (Recurring)
   - Click Save Product and copy the **Price ID** (`price_...`) → paste into `STRIPE_PRICE_ID`
5. Test payments using test card number: `4242 4242 4242 4242` (any MM/YY in the future and any 3-digit CVC).

---

## 💻 Common Commands

### Start Local Development
```bash
npm run dev
```

### Run TypeScript Verification
```bash
npx tsc --noEmit
```

### Build Production Bundle
```bash
npm run build
```

### Preview Production Build Locally
```bash
npm run preview
```

---

## 🚀 Free Deployment to Vercel (1-Click)

MockMate uses TanStack Start which is designed to deploy seamlessly to Vercel:

1. **Push your code to GitHub:**
   ```bash
   git add .
   git commit -m "feat: complete MockMate platform"
   git push origin main
   ```

2. **Deploy on Vercel:**
   - Log in to [vercel.com](https://vercel.com).
   - Click **Add New** → **Project** → select your GitHub repository.
   - Under **Environment Variables**, add the variables from your `.env` file:
     - `GROQ_API_KEY`
     - `GEMINI_API_KEY`
     - `VITE_CLERK_PUBLISHABLE_KEY`
     - `CLERK_SECRET_KEY`
     - `SUPABASE_URL`
     - `SUPABASE_SERVICE_ROLE_KEY`
     - `STRIPE_SECRET_KEY`
     - `VITE_STRIPE_PUBLISHABLE_KEY`
   - Click **Deploy**!

---

## ❓ Frequently Asked Questions & Troubleshooting

- **Microphone issues during interview:**  
  Make sure to grant browser microphone permissions when prompted. MockMate uses the browser's built-in Web Speech API.
- **Audio not playing:**  
  Modern browsers block audio autoplay until a user interacts with the page. MockMate includes a "Begin Interview" click screen that automatically unlocks audio.
- **Switching Light & Dark theme:**  
  Click the Sun/Moon icon in the top right corner anytime. Your preference is automatically saved.

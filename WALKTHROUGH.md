# MockMate — Full Project Walkthrough

> Single source of truth for **MockMate** — architecture, routing, LLM router failover, Edge TTS audio pipeline, Clerk auth, freemium Stripe paywall, and Supabase database.

---

## 1. Executive Summary

**MockMate** is an AI-powered mock interview and diagnostic platform engineered specifically for Indian computer science freshers facing technical campus placements across 4 core domains:
1. **Data Structures & Algorithms (DSA)**
2. **Spring Boot & Java Backend**
3. **System Design (High-Level Design / HLD)**
4. **Low-Level Design & Object-Oriented Principles (LLD)**

Two modes per domain:
- **Voice Mock Interview:** 5-turn dynamic conversational session. Interviewer speaks with natural Microsoft Edge TTS neural audio. Candidate replies via voice (browser Web Speech API) or typed text. Concludes with a comprehensive evaluation report (Overall, Technical Depth, Communication, Problem Solving, strengths, and weaknesses).
- **Canonical MCQ & Free-Answer Quiz:** 5 questions per session with dual answer modes (Multiple Choice or AI-judged free-form response evaluated against campus rubrics).
- **Placement Readiness Score:** Cross-session diagnostic score aggregating student performance and domain coverage (0–100%).

---

## 2. Tech Stack & Architecture

| Layer | Choice | Rationale |
|---|---|---|
| **Framework** | TanStack Start v1 (file-based routing under `src/routes/`) | Full-stack React 19 SSR with type-safe server functions. |
| **Authentication** | **Clerk** (`@clerk/clerk-react`) + 1-click Demo mode | Google OAuth + Email auth with seamless local developer preview fallback. |
| **Database** | **Supabase Postgres** (`src/lib/supabase-db.ts`) | Persistent tables (`user_profiles`, `session_history`) with local memory fallback. |
| **Text-to-Speech** | **Microsoft Edge TTS** (`msedge-tts`) | Free neural audio (`en-US-AriaNeural`), zero API keys or credit limits needed. |
| **LLM Router** | **Groq → Ollama → Gemini** (30s deadline) | High-speed primary inference via Groq Llama 3.3 (~500 tok/sec), local offline Ollama fallback, and Gemini 2.0 Flash cloud backup. |
| **Freemium & Billing** | **Stripe Checkout** (`src/routes/pricing.tsx`) | 3 free sessions limit, followed by test-mode card checkout (`4242 4242 4242 4242`) to activate MockMate Pro (₹499/mo). |
| **Styling** | Tailwind CSS v4 + Vanilla CSS tokens in `src/styles.css` | Dual Light & Dark themes, subtle minimal 64px SaaS grid, and mobile-first responsive layout. |

---

## 3. Directory Map

```
src/
├── routes/
│   ├── __root.tsx           Global HTML shell, ClerkAuthProvider, GridBackground, metadata
│   ├── index.tsx            MockMate SaaS Landing Page (Hero, Domains, Features, CTAs)
│   ├── dashboard.tsx        Domain selection grid, free session counter, readiness badge
│   ├── pricing.tsx          Freemium tier matrix, Stripe test checkout, paywall banner
│   ├── progress.tsx         Placement Readiness Score dashboard, domain breakdown, history
│   ├── login.tsx            Clerk sign-in component + 1-click Demo Candidate mode
│   ├── domain.$domain.tsx   Mode selector (Interview vs Quiz) with session-limit check
│   ├── interview.$domain.tsx Conversational voice interview UI with Edge TTS
│   ├── quiz.$domain.tsx     MCQ and free-answer diagnostic quiz UI
│   └── evaluation.tsx       Post-interview multi-metric scorecard and recommendations
├── lib/
│   ├── llm.functions.ts     3-tier LLM router: Groq → Ollama → Gemini (30s global retry loop)
│   ├── tts.functions.ts     Microsoft Edge TTS synthesizer returning base64 MP3
│   ├── user.functions.ts    Server functions: getUserStatus, completeSession, createCheckoutSession, grantProAccess, getPlacementReadiness
│   ├── supabase-db.ts       Supabase Postgres client with persistent memory fallback
│   ├── knowledge.ts         Domain metadata and canonical curriculum Q&As
│   ├── quiz.functions.ts    generateQuiz and judgeFreeAnswer server functions
│   └── evaluate.functions.ts nextInterviewerTurn and evaluateInterview server functions
├── components/
│   ├── ThemeToggle.tsx      Light / Dark mode toggle with localStorage persistence
│   ├── GridBackground.tsx   Subtle, low-opacity 64px grid with radial fade mask
│   ├── ClerkAuthProvider.tsx Clerk bridge component synchronizing with SessionProvider
│   ├── SettingsModal.tsx    Tabs: AI Engine (Groq, Gemini, Ollama) / Voice (Edge TTS) / About
│   ├── GlassCard.tsx        Clean SaaS card primitive
│   ├── GlowButton.tsx       Primary and secondary CTA button primitives
│   └── ScoreRing.tsx        Circular SVG progress indicator
├── store/
│   └── session.tsx          SessionContext: user, isPro, freeSessionsUsed, remainingFree, settings
└── styles.css               Theme tokens (Light & Dark), subtle grid-bg, animations
supabase/
└── schema.sql               Postgres schema for user_profiles and session_history
```

---

## 4. Routing & Protection

| Route URL | Component | Auth & Guard Behavior |
|---|---|---|
| `/` | `index.tsx` | Public SaaS Landing Page with navigation and domain cards. |
| `/login` | `login.tsx` | Clerk Sign In or instant Demo Candidate 1-click login. |
| `/dashboard` | `dashboard.tsx` | Protected: redirects to `/login` if not authenticated. Displays 4 tracks. |
| `/domain/:domain` | `domain.$domain.tsx` | Protected: verifies `remainingFree > 0` or `isPro`. If limit exceeded, prompts upgrade. |
| `/interview/:domain` | `interview.$domain.tsx` | Protected: runs voice session, records completed session on finish. |
| `/quiz/:domain` | `quiz.$domain.tsx` | Protected: runs 5-question quiz, records completed session on finish. |
| `/evaluation` | `evaluation.tsx` | Protected: renders AI scorecard and links to readiness dashboard. |
| `/pricing` | `pricing.tsx` | Public/Protected: Free vs Pro comparison matrix and Stripe test checkout. |
| `/progress` | `progress.tsx` | Protected: Placement Readiness Score with domain radar breakdown. |

---

## 5. Freemium Business Rules

1. **Session Quota:** Non-pro users receive **3 free sessions** (interviews or quizzes).
2. **Quota Tracking:** Incremented via `completeSession()` server function in Supabase Postgres (`user_profiles.free_sessions_used`).
3. **Paywall Gate:** If a non-pro user attempts to start a session after using 3 sessions, `domain.$domain.tsx` displays the upgrade alert and redirects to `/pricing?limit_reached=true`.
4. **Subscription Activation:** On `/pricing`, clicking "Subscribe" either redirects to live Stripe Checkout or opens the test-mode simulation modal (`4242 4242 4242 4242`), triggering `grantProAccess()` which immediately unlocks unlimited practice.
5. **Backend Credit Flexibility:** The backend also includes `credits` per user and an `adminManageCredits` endpoint ready for future institutional and bulk credit management.

---

## 6. Placement Readiness Score Algorithm

Defined in `src/lib/user.functions.ts` (`getPlacementReadiness`):
$$\text{Readiness Score} = \min\left(100, \left(\frac{\text{Active Domains}}{4} \times 40\right) + \left(\text{Average Score} \times 0.6\right)\right)$$
- **Domain Coverage (40% Weight):** Encourages practicing across all 4 pillars (DSA, Spring Boot, System Design, LLD).
- **Average Performance (60% Weight):** Reflects rubric scores across answered turns and quizzes.
- **Verdict Categories:**
  - `≥ 80%`: Placement Ready
  - `60%–79%`: Good Momentum
  - `35%–59%`: Foundational Progress
  - `< 35%`: Starting Out

---

## 7. Verification & Build Status

- **TypeScript Typecheck:** `npx tsc --noEmit` exits with code `0` (Zero errors).
- **Production Build:** `npm run build` generates both client assets (`dist/client/`) and SSR server bundle (`dist/server/`) cleanly in ~14s.
- **Demo Readiness:** 100% demo-ready with zero external blockers.

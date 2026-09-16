# AGENT BRIEF — Rework interv-ai into a new submission-ready product

You are working directly in this repo. Read this whole file first, then follow the instructions at the bottom before writing any code.

## Context

Clone this repo as your starting point:
```
git clone https://github.com/njd07/interv-ai.git
```

This is an existing AI mock-interview platform for freshers preparing for tech placements (DSA, Spring Boot, System Design, LLD). It has: a dynamic voice-based interview mode, a post-interview scorecard (Technical Depth / Communication / Problem Solving), a quiz mode, Supabase Auth, and an LLM router that tries local Ollama first and falls back to OpenRouter. Text-to-speech currently uses ElevenLabs with browser `speechSynthesis` as a secondary fallback.

Your job is to turn this into a **new, clearly differentiated product** for a Technology Entrepreneurship course submission — same strong technical core, new identity, new business layer. It must not look or feel like a reskin of the original.

## Required changes

1. **Replace ElevenLabs with Microsoft Edge TTS.** No ElevenLabs credits are available. Remove the ElevenLabs integration and the `ELEVENLABS_API_KEY` env var entirely. Use the free `edge-tts` package (or equivalent). Pick a natural English voice for interview narration and make it configurable. Keep browser `speechSynthesis` as the final fallback only.

2. **Replace Supabase Auth with Clerk.** Use Clerk for authentication (Google sign-in + email). Keep Supabase only as the Postgres database — remove it from the auth layer entirely. Update every protected route and every place that reads the current user.

3. **Full rebrand.** New product name, new color palette, new landing page copy, new layout direction — not just new colors on the same structure. Do not reuse the current visual design. Propose 2–3 name/identity directions and let the user pick before you commit to one everywhere.

4. **Add a real freemium business layer**, since this is being submitted for a business course:
   - Track a `free_sessions_used` counter per user (default 0), incremented after each completed interview or quiz session.
   - Once a non-pro user hits 3 sessions, redirect any "start" action to a new `/pricing` page instead of starting a session.
   - Build `/pricing` with a single Pro plan and a "Subscribe" button that opens **Stripe Checkout in test mode** (test card `4242 4242 4242 4242`). On success, mark the user's plan as `pro` in the database. Label the checkout clearly as a demo/test flow.

5. **Rewrite the README** as a product pitch doc: one-line value prop, problem, solution, key features, tech stack, business model, setup instructions. Remove any references to hackathon problem statements or prior competition context — it should read as this product's own README, not the original's.

6. **Optional stretch, only if time allows:** a "placement readiness score" that tracks a user's progress across sessions over time (not just per-session scores) — a genuinely new feature, not a reskin.

## Constraints

- Keep the existing AI evaluation engine and the local Ollama / OpenRouter fallback router as-is — that's the strongest part of the current build and the main technical differentiator to keep highlighting.
- Keep the DSA / System Design / LLD niche focus for freshers — it's a real positioning advantage ("built specifically for Indian CS freshers' placement season"), don't genericize it away.
- This needs to be demo-ready today. Prioritize: TTS swap → auth swap → paywall → rebrand polish, in that order, and check in after each one rather than doing everything silently and presenting it all at once at the end.

## Before you start coding

Ask the user the following, and wait for answers before proceeding past step 1:

1. Which product name/identity direction do they want? (Propose a few options yourself based on the niche.)
2. Do they want the visual direction to be dark/dashboard-style like the original, or something distinctly different (e.g. warmer, editorial, "coaching studio" feel)? Propose 2–3 concrete directions.
3. How much time do they actually have — does the optional "placement readiness score" feature make the cut, or should you stop at the five required changes?
4. Do they already have Clerk and Stripe test-mode accounts/keys, or do they need a walkthrough for creating those first?
5. Where should this get deployed when it's done — same Render setup as the original, or somewhere else (e.g. Vercel)?

Once you have answers, restate the plan back to them in a short checklist before you start implementing, so they can correct anything before code gets written.

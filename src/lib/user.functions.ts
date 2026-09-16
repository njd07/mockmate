import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import Stripe from "stripe";
import {
  getOrCreateUserProfile,
  recordCompletedSession,
  setUserPlan,
  adjustUserCredits,
  getUserSessionHistory,
  type UserProfile,
} from "./supabase-db";

const UserInput = z.object({
  userId: z.string(),
  email: z.string().optional(),
  name: z.string().optional(),
});

const CompleteSessionInput = z.object({
  userId: z.string(),
  domain: z.string(),
  sessionType: z.enum(["interview", "quiz"]),
  score: z.record(z.any()).optional(),
});

const CheckoutInput = z.object({
  userId: z.string(),
  email: z.string().optional(),
  returnUrl: z.string().optional(),
});

const AdminCreditInput = z.object({
  targetUserId: z.string(),
  creditDelta: z.number(),
  adminSecret: z.string().optional(),
});

export const getUserStatus = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => UserInput.parse(d))
  .handler(async ({ data }) => {
    const profile = await getOrCreateUserProfile(data.userId, data.email, data.name);
    const isPro = profile.plan === "pro";
    const freeLimit = 3;
    const remainingFree = Math.max(0, freeLimit - profile.free_sessions_used);
    const canStartSession = isPro || remainingFree > 0 || (profile.credits && profile.credits > 0);

    return {
      profile,
      isPro,
      remainingFree,
      canStartSession,
      freeLimit,
    };
  });

export const completeSession = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => CompleteSessionInput.parse(d))
  .handler(async ({ data }) => {
    const updated = await recordCompletedSession(
      data.userId,
      data.domain,
      data.sessionType,
      data.score
    );
    return { ok: true as const, profile: updated };
  });

export const createCheckoutSession = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => CheckoutInput.parse(d))
  .handler(async ({ data }) => {
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    const returnUrl = data.returnUrl || "http://localhost:3000";

    // If Stripe Secret Key is present, create a real Stripe Checkout Session
    if (stripeKey && stripeKey.startsWith("sk_")) {
      try {
        const stripe = new Stripe(stripeKey, { apiVersion: "2025-02-24.acacia" as any });
        const session = await stripe.checkout.sessions.create({
          payment_method_types: ["card"],
          mode: "subscription",
          client_reference_id: data.userId,
          customer_email: data.email,
          line_items: [
            {
              price_data: {
                currency: "inr",
                product_data: {
                  name: "MockMate Pro",
                  description: "Unlimited AI mock interviews, deep speech analytics, and custom feedback",
                },
                unit_amount: 49900, // ₹499
                recurring: { interval: "month" },
              },
              quantity: 1,
            },
          ],
          success_url: `${returnUrl}/pricing?status=success&session_id={CHECKOUT_SESSION_ID}&userId=${encodeURIComponent(data.userId)}`,
          cancel_url: `${returnUrl}/pricing?status=cancelled`,
        });

        return { ok: true as const, checkoutUrl: session.url, mode: "stripe" as const };
      } catch (err) {
        console.error("[Stripe] Failed to create checkout session:", err);
      }
    }

    // Interactive Demo / Test Mode Checkout
    return {
      ok: true as const,
      checkoutUrl: null,
      mode: "test_demo" as const,
      message: "Stripe test mode simulated. You can instantly activate Pro for demo evaluation.",
    };
  });

export const grantProAccess = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ userId: z.string() }).parse(d))
  .handler(async ({ data }) => {
    const updated = await setUserPlan(data.userId, "pro");
    return { ok: true as const, profile: updated };
  });

export const adminManageCredits = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => AdminCreditInput.parse(d))
  .handler(async ({ data }) => {
    // Secret can be configured via ADMIN_API_KEY
    const expectedSecret = process.env.ADMIN_API_KEY || "mockmate_admin_secret";
    if (data.adminSecret && data.adminSecret !== expectedSecret) {
      return { ok: false as const, error: "UNAUTHORIZED" };
    }

    const updated = await adjustUserCredits(data.targetUserId, data.creditDelta);
    return { ok: true as const, profile: updated };
  });

export const getPlacementReadiness = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ userId: z.string() }).parse(d))
  .handler(async ({ data }) => {
    const history = await getUserSessionHistory(data.userId);

    const domains = ["dsa", "springboot", "system_design", "lld"] as const;
    const domainStats: Record<string, { sessions: number; totalScore: number; avgScore: number }> = {
      dsa: { sessions: 0, totalScore: 0, avgScore: 0 },
      springboot: { sessions: 0, totalScore: 0, avgScore: 0 },
      system_design: { sessions: 0, totalScore: 0, avgScore: 0 },
      lld: { sessions: 0, totalScore: 0, avgScore: 0 },
    };

    history.forEach((sess) => {
      if (domainStats[sess.domain]) {
        domainStats[sess.domain].sessions += 1;
        const scoreVal = (sess.score?.overall as number) || (sess.score?.score as number) || 75;
        domainStats[sess.domain].totalScore += scoreVal;
      }
    });

    let activeDomains = 0;
    let combinedScoreSum = 0;
    domains.forEach((dom) => {
      const item = domainStats[dom];
      if (item.sessions > 0) {
        item.avgScore = Math.round(item.totalScore / item.sessions);
        activeDomains += 1;
        combinedScoreSum += item.avgScore;
      }
    });

    const coverageFactor = (activeDomains / domains.length) * 40; // up to 40%
    const performanceFactor = activeDomains > 0 ? (combinedScoreSum / activeDomains) * 0.6 : 0; // up to 60%
    const readinessScore = Math.min(100, Math.round(coverageFactor + performanceFactor));

    return {
      readinessScore,
      totalSessions: history.length,
      domainStats,
      recentSessions: history.slice(0, 10).map((s) => ({
        domain: s.domain,
        session_type: s.session_type,
        scoreOverall: Number((s.score?.overall as number) || (s.score?.score as number) || 75),
        completed_at: s.completed_at || new Date().toISOString(),
      })),
    };
  });

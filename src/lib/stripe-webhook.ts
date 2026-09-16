import Stripe from "stripe";
import {
  setUserPlan,
  getUserByStripeCustomerId,
  getOrCreateUserProfile,
} from "./supabase-db";

export async function handleStripeWebhook(request: Request): Promise<Response> {
  // Allow GET for simple ping / health check
  if (request.method === "GET") {
    return new Response(
      JSON.stringify({
        status: "ok",
        service: "MockMate Stripe Webhook",
        timestamp: new Date().toISOString(),
      }),
      { status: 200, headers: { "content-type": "application/json" } }
    );
  }

  if (request.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const stripeKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripeKey) {
    console.error("[Stripe Webhook] STRIPE_SECRET_KEY is not configured in environment.");
    return new Response(
      JSON.stringify({ error: "Stripe is not configured on this server." }),
      { status: 500, headers: { "content-type": "application/json" } }
    );
  }

  const stripe = new Stripe(stripeKey, { apiVersion: "2025-02-24.acacia" as any });
  const rawBody = await request.text();
  let event: Stripe.Event;

  // Verify signature if STRIPE_WEBHOOK_SECRET is provided
  if (webhookSecret) {
    const signature = request.headers.get("stripe-signature");
    if (!signature) {
      console.warn("[Stripe Webhook] Missing stripe-signature header.");
      return new Response("Missing stripe-signature header", { status: 400 });
    }

    try {
      event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    } catch (err: any) {
      console.error("[Stripe Webhook] Signature verification failed:", err.message);
      return new Response(`Webhook Error: ${err.message}`, { status: 400 });
    }
  } else {
    // If webhook secret not set (e.g. initial dev test), parse directly with warning
    console.warn(
      "[Stripe Webhook] STRIPE_WEBHOOK_SECRET not set. Processing event without signature verification (dev only)."
    );
    try {
      event = JSON.parse(rawBody);
    } catch (err: any) {
      return new Response("Invalid JSON payload", { status: 400 });
    }
  }

  console.info(`[Stripe Webhook] Received event: ${event.type} [${event.id}]`);

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId =
          session.client_reference_id ||
          session.metadata?.userId ||
          session.metadata?.clerk_user_id;

        const customerId =
          typeof session.customer === "string"
            ? session.customer
            : session.customer?.id;

        if (userId) {
          console.info(
            `[Stripe Webhook] Granting Pro plan to user: ${userId} (Customer: ${customerId})`
          );
          await setUserPlan(userId, "pro", customerId);
        } else if (customerId) {
          // If userId was not passed in metadata, check if user exists by customer ID
          const existing = await getUserByStripeCustomerId(customerId);
          if (existing) {
            await setUserPlan(existing.clerk_user_id, "pro", customerId);
          } else {
            console.warn(
              "[Stripe Webhook] checkout.session.completed missing userId reference.",
              session.id
            );
          }
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId =
          typeof subscription.customer === "string"
            ? subscription.customer
            : subscription.customer?.id;

        let userId = subscription.metadata?.userId;

        if (!userId && customerId) {
          const user = await getUserByStripeCustomerId(customerId);
          if (user) userId = user.clerk_user_id;
        }

        if (userId) {
          console.info(`[Stripe Webhook] Downgrading canceled subscription user to free: ${userId}`);
          await setUserPlan(userId, "free");
        } else {
          console.warn("[Stripe Webhook] Subscription deleted, but no associated user found:", customerId);
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId =
          typeof subscription.customer === "string"
            ? subscription.customer
            : subscription.customer?.id;

        const status = subscription.status;
        const user = customerId ? await getUserByStripeCustomerId(customerId) : null;

        if (user) {
          if (status === "active") {
            await setUserPlan(user.clerk_user_id, "pro", customerId);
          } else if (status === "canceled" || status === "unpaid") {
            await setUserPlan(user.clerk_user_id, "free", customerId);
          }
        }
        break;
      }

      default:
        // Other events can be safely acknowledged
        break;
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  } catch (handlerErr: any) {
    console.error("[Stripe Webhook] Error processing event:", handlerErr);
    return new Response(
      JSON.stringify({ error: "Internal error processing webhook event" }),
      { status: 500, headers: { "content-type": "application/json" } }
    );
  }
}

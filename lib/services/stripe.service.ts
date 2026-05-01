/**
 * lib/services/stripe.service.ts
 *
 * Centralized Stripe service layer.
 * All Stripe operations go through this service.
 */
import Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/admin";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface CreateCheckoutSessionParams {
  userId: string;
  userEmail: string;
  courseId: string;
  courseTitle: string;
  price: number; // in dollars
  currency?: string;
  successUrl: string;
  cancelUrl: string;
}

export interface StripeConnectionTestResult {
  success: boolean;
  mode: "test" | "live";
  accountId?: string;
  accountType?: string;
  error?: string;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Fetch Stripe configuration from DB, falling back to env vars. */
async function getStripeConfig(): Promise<{ secretKey: string; publishableKey: string }> {
  const supabase = createAdminClient();
  const { data: rows } = await supabase
    .from("platform_settings")
    .select("setting_key, setting_value")
    .in("setting_key", ["stripe_secret_key", "stripe_publishable_key"]);

  const map: Record<string, string> = {};
  rows?.forEach((r: any) => {
    map[r.setting_key] = r.setting_value ?? "";
  });

  return {
    secretKey: map["stripe_secret_key"] || process.env.STRIPE_SECRET_KEY || "",
    publishableKey: map["stripe_publishable_key"] || process.env.STRIPE_PUBLISHABLE_KEY || "",
  };
}

/** Build a Stripe client with the provided key, DB stored key, or fall back to env. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function buildStripeClient(secretKey?: string): Promise<Stripe> {
  let key = secretKey;

  if (!key) {
    const config = await getStripeConfig();
    key = config.secretKey;
  }

  if (!key) throw new Error("Stripe secret key is not configured.");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return new Stripe(key, { apiVersion: "2026-04-22.dahlia" as any, typescript: true });
}

/** Typed accessor for new tables not yet in database.types.ts */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function db(supabase: ReturnType<typeof createAdminClient>): any {
  return supabase as any;
}

// ─── Service ────────────────────────────────────────────────────────────────

export const stripeService = {
  /**
   * Test the Stripe connection by retrieving the balance.
   * Works with any provided secret key (used in admin UI "Test Connection").
   */
  async testConnection(secretKey?: string): Promise<StripeConnectionTestResult> {
    try {
      const client = await buildStripeClient(secretKey);
      await client.balance.retrieve();
      const isLive = (secretKey ?? process.env.STRIPE_SECRET_KEY ?? "").startsWith("sk_live_");
      return { success: true, mode: isLive ? "live" : "test" };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown Stripe error";
      return { success: false, mode: "test", error: message };
    }
  },

  /**
   * Create a Checkout Session for a course purchase.
   */
  async createCheckoutSession(params: CreateCheckoutSessionParams) {
    const {
      userId,
      userEmail,
      courseId,
      courseTitle,
      price,
      currency = "usd",
      successUrl,
      cancelUrl,
    } = params;

    const client = await buildStripeClient();
    const idempotencyKey = `checkout_${userId}_${courseId}_${Date.now()}`;

    const session = await client.checkout.sessions.create(
      {
        payment_method_types: ["card"],
        mode: "payment",
        customer_email: userEmail,
        line_items: [
          {
            price_data: {
              currency,
              product_data: { name: courseTitle, metadata: { courseId } },
              unit_amount: Math.round(price * 100), // convert to cents
            },
            quantity: 1,
          },
        ],
        metadata: { userId, courseId, userEmail },
        success_url: successUrl,
        cancel_url: cancelUrl,
      },
      { idempotencyKey },
    );

    return session;
  },

  /**
   * Construct and verify a Stripe webhook event.
   */
  async constructWebhookEvent(payload: string, signature: string, secret?: string): Promise<Stripe.Event> {
    const supabase = createAdminClient();
    let webhookSecret = secret;

    if (!webhookSecret) {
      const { data: row } = await (supabase
        .from("platform_settings")
        .select("setting_value")
        .eq("setting_key", "stripe_webhook_secret")
        .single() as any);
      webhookSecret = (row?.setting_value as string) || process.env.STRIPE_WEBHOOK_SECRET || "";
    }

    if (!webhookSecret) throw new Error("Stripe webhook secret is not configured.");

    const client = await buildStripeClient();
    return client.webhooks.constructEvent(payload, signature, webhookSecret);
  },

  /**
   * Handle checkout.session.completed – grant course access.
   */
  async handleCheckoutCompleted(session: Stripe.Checkout.Session) {
    const supabase = createAdminClient();
    const dbAny = db(supabase);
    const { userId, courseId } = session.metadata ?? {};

    if (!userId || !courseId) {
      throw new Error("Missing userId or courseId in session metadata.");
    }

    // Idempotency: skip if already processed
    const { data: existing } = await dbAny
      .from("stripe_events")
      .select("id")
      .eq("stripe_event_id", `checkout_${session.id}`)
      .single();

    if (existing) {
      console.log(`[Stripe] Event already processed: checkout_${session.id}`);
      return;
    }

    // 1. Log the Stripe event
    await dbAny.from("stripe_events").insert({
      stripe_event_id: `checkout_${session.id}`,
      event_type: "checkout.session.completed",
      status: "processing",
      payload: session,
      user_id: userId,
      course_id: courseId,
      amount: session.amount_total,
      currency: session.currency,
    });

    // 2. Create or update enrollment
    const { error: enrollError } = await dbAny
      .from("enrollments")
      .upsert(
        {
          user_id: userId,
          course_id: courseId,
          enrolled_at: new Date().toISOString(),
          payment_status: "paid",
          stripe_session_id: session.id,
          amount_paid: session.amount_total,
        },
        { onConflict: "user_id,course_id" },
      );

    if (enrollError) throw enrollError;

    // 3. Mark event as processed
    await dbAny
      .from("stripe_events")
      .update({ status: "processed", processed_at: new Date().toISOString() })
      .eq("stripe_event_id", `checkout_${session.id}`);

    console.log(
      `[Stripe] Checkout completed → enrollment created for user=${userId} course=${courseId}`,
    );
  },

  /**
   * Handle payment_intent.succeeded event.
   */
  async handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
    const supabase = createAdminClient();
    const dbAny = db(supabase);

    await dbAny.from("stripe_events").upsert(
      {
        stripe_event_id: `pi_${paymentIntent.id}`,
        event_type: "payment_intent.succeeded",
        status: "processed",
        payload: paymentIntent,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        processed_at: new Date().toISOString(),
      },
      { onConflict: "stripe_event_id" },
    );

    console.log(`[Stripe] PaymentIntent succeeded: ${paymentIntent.id}`);
  },
};

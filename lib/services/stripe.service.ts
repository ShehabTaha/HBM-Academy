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

export interface CreateSubscriptionCheckoutParams {
  userId: string;
  userEmail: string;
  category?: string | null;
  price: number;
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

export interface StripeConnectStatus {
  account_id: string | null;
  connected: boolean;
  charges_enabled: boolean;
  payouts_enabled: boolean;
  details_submitted: boolean;
  status: "not_started" | "pending" | "enabled" | "restricted";
  requirements_due: string[];
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

function getStripeMode(secretKey: string): "test" | "live" {
  return secretKey.startsWith("sk_live_") ? "live" : "test";
}

/** Build a Stripe client with the provided key, DB stored key, or fall back to env. */
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

async function withStripeRetry<T>(operation: () => Promise<T>, label: string): Promise<T> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      const retryable =
        error instanceof Stripe.errors.StripeAPIError ||
        error instanceof Stripe.errors.StripeConnectionError ||
        error instanceof Stripe.errors.StripeRateLimitError;
      if (!retryable || attempt === 3) break;
      await new Promise((resolve) => setTimeout(resolve, 250 * attempt));
    }
  }
  const message = lastError instanceof Error ? lastError.message : "Unknown Stripe error";
  console.error(`[Stripe] ${label} failed:`, message);
  throw lastError;
}

/** Typed accessor for new tables not yet in database.types.ts */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function db(supabase: ReturnType<typeof createAdminClient>): any {
  return supabase as any;
}

async function getSettingMap(keys: string[]) {
  const supabase = createAdminClient();
  const { data: rows } = await supabase
    .from("platform_settings")
    .select("setting_key, setting_value")
    .in("setting_key", keys);

  const map: Record<string, any> = {};
  rows?.forEach((row: any) => {
    map[row.setting_key] = row.setting_value;
  });
  return map;
}

async function upsertSettings(values: Record<string, unknown>) {
  const supabase = createAdminClient();
  const rows = Object.entries(values).map(([setting_key, setting_value]) => ({
    setting_key,
    setting_value,
    category: "payment",
    is_sensitive: setting_key === "stripe_connect_account_id",
    updated_at: new Date().toISOString(),
  }));

  await Promise.all(
    rows.map((row) =>
      (supabase.from("platform_settings") as any).upsert(row, {
        onConflict: "setting_key",
      }),
    ),
  );
}

function mapConnectStatus(account: Stripe.Account | null): StripeConnectStatus {
  if (!account) {
    return {
      account_id: null,
      connected: false,
      charges_enabled: false,
      payouts_enabled: false,
      details_submitted: false,
      status: "not_started",
      requirements_due: [],
    };
  }

  const requirementsDue = account.requirements?.currently_due ?? [];
  const enabled = account.charges_enabled && account.payouts_enabled && account.details_submitted;

  return {
    account_id: account.id,
    connected: enabled,
    charges_enabled: account.charges_enabled,
    payouts_enabled: account.payouts_enabled,
    details_submitted: account.details_submitted,
    status: enabled ? "enabled" : requirementsDue.length > 0 ? "restricted" : "pending",
    requirements_due: requirementsDue,
  };
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
      await withStripeRetry(() => client.balance.retrieve(), "balance.retrieve");
      const config = secretKey ? { secretKey } : await getStripeConfig();
      return { success: true, mode: getStripeMode(config.secretKey) };
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

    const session = await withStripeRetry(
      () => client.checkout.sessions.create(
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
        metadata: { studentId: userId, courseId, userEmail, purchaseType: "course" },
        success_url: successUrl,
        cancel_url: cancelUrl,
      },
      { idempotencyKey },
    ),
      "checkout.sessions.create",
    );

    return session;
  },

  async createSubscriptionCheckoutSession(params: CreateSubscriptionCheckoutParams) {
    const {
      userId,
      userEmail,
      category,
      price,
      currency = "usd",
      successUrl,
      cancelUrl,
    } = params;

    const client = await buildStripeClient();

    return withStripeRetry(() => client.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      customer_email: userEmail,
      line_items: [
        {
          price_data: {
            currency,
            recurring: { interval: "month" },
            product_data: {
              name: category ? `HBM ${category} subscription` : "HBM Academy all-access",
              metadata: { category: category ?? "all" },
            },
            unit_amount: Math.round(price * 100),
          },
          quantity: 1,
        },
      ],
      metadata: {
        studentId: userId,
        category: category ?? "",
        purchaseType: "subscription",
        userEmail,
      },
      subscription_data: {
        metadata: {
          studentId: userId,
          category: category ?? "",
        },
      },
      success_url: successUrl,
      cancel_url: cancelUrl,
    }), "checkout.sessions.create(subscription)");
  },

  async getConnectStatus(): Promise<StripeConnectStatus> {
    const config = await getStripeConfig();
    if (!config.secretKey) return mapConnectStatus(null);

    const mode = getStripeMode(config.secretKey);
    const settings = await getSettingMap([
      "stripe_connect_account_id",
      "stripe_connect_mode",
    ]);
    const accountId = settings.stripe_connect_account_id as string | null | undefined;
    const storedMode = settings.stripe_connect_mode as string | undefined;

    if (!accountId || storedMode !== mode) {
      return mapConnectStatus(null);
    }

    const client = await buildStripeClient(config.secretKey);
    const account = await withStripeRetry(
      () => client.accounts.retrieve(accountId),
      "accounts.retrieve",
    );
    return this.persistConnectStatus(account, mode);
  },

  async createConnectOnboardingLink(origin: string) {
    const config = await getStripeConfig();
    if (!config.secretKey) {
      throw new Error("Stripe secret key is required before starting Connect onboarding.");
    }

    const mode = getStripeMode(config.secretKey);
    const client = await buildStripeClient(config.secretKey);
    const settings = await getSettingMap([
      "stripe_connect_account_id",
      "stripe_connect_mode",
    ]);

    let accountId = settings.stripe_connect_account_id as string | null | undefined;
    const storedMode = settings.stripe_connect_mode as string | undefined;

    if (!accountId || storedMode !== mode) {
      const account = await withStripeRetry(
        () => client.accounts.create({
          type: "express",
          capabilities: {
            card_payments: { requested: true },
            transfers: { requested: true },
          },
          business_profile: {
            product_description: "HBM Academy course payments and instructor payouts",
            url: origin,
          },
          metadata: {
            platform: "hbm_academy",
            mode,
          },
        }),
        "accounts.create",
      );
      accountId = account.id;
      await this.persistConnectStatus(account, mode);
    }

    const accountLink = await withStripeRetry(
      () => client.accountLinks.create({
        account: accountId!,
        refresh_url: `${origin}/api/admin/payment/stripe/connect/refresh`,
        return_url: `${origin}/api/admin/payment/stripe/connect/callback`,
        type: "account_onboarding",
      }),
      "accountLinks.create",
    );

    return { url: accountLink.url, accountId, mode };
  },

  async persistConnectStatus(account: Stripe.Account, mode?: "test" | "live") {
    const status = mapConnectStatus(account);
    await upsertSettings({
      stripe_connect_account_id: account.id,
      stripe_connect_mode: mode ?? "test",
      stripe_connect_status: status.status,
      stripe_connect_charges_enabled: status.charges_enabled,
      stripe_connect_payouts_enabled: status.payouts_enabled,
      stripe_connect_details_submitted: status.details_submitted,
      stripe_connect_requirements_due: status.requirements_due,
    });
    return status;
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
    const { studentId, userId, courseId, purchaseType, category } =
      session.metadata ?? {};
    const resolvedStudentId = studentId ?? userId;

    if (!resolvedStudentId) {
      throw new Error("Missing studentId in session metadata.");
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
      user_id: null,
      course_id: courseId,
      amount: session.amount_total,
      currency: session.currency,
    });

    if (purchaseType === "subscription") {
      if (!session.subscription) {
        throw new Error("Missing Stripe subscription id.");
      }

      await dbAny.from("student_subscriptions").upsert(
        {
          student_id: resolvedStudentId,
          stripe_subscription_id: session.subscription,
          stripe_customer_id: session.customer,
          category: category || null,
          status: "active",
          updated_at: new Date().toISOString(),
        },
        { onConflict: "stripe_subscription_id" },
      );

      await dbAny
        .from("stripe_events")
        .update({ status: "processed", processed_at: new Date().toISOString() })
        .eq("stripe_event_id", `checkout_${session.id}`);
      return;
    }

    if (!courseId) {
      throw new Error("Missing courseId in session metadata.");
    }

    // 2. Create or update enrollment
    const { error: enrollError } = await dbAny
      .from("enrollments")
      .upsert(
        {
          student_id: resolvedStudentId,
          course_id: courseId,
          enrolled_at: new Date().toISOString(),
          payment_status: "paid",
          stripe_session_id: session.id,
          amount_paid: session.amount_total,
        },
        { onConflict: "student_id,course_id" },
      );

    if (enrollError) throw enrollError;

    // 3. Mark event as processed
    await dbAny
      .from("stripe_events")
      .update({ status: "processed", processed_at: new Date().toISOString() })
      .eq("stripe_event_id", `checkout_${session.id}`);

    console.log(
      `[Stripe] Checkout completed -> enrollment created for student=${resolvedStudentId} course=${courseId}`,
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

  async handleSubscriptionUpdated(subscription: Stripe.Subscription) {
    const supabase = createAdminClient();
    const dbAny = db(supabase);
    const studentId = subscription.metadata?.studentId;
    if (!studentId) return;

    await dbAny.from("student_subscriptions").upsert(
      {
        student_id: studentId,
        stripe_subscription_id: subscription.id,
        stripe_customer_id:
          typeof subscription.customer === "string"
            ? subscription.customer
            : subscription.customer.id,
        category: subscription.metadata?.category || null,
        status: subscription.status,
        current_period_start: new Date(
          subscription.items.data[0]?.current_period_start * 1000,
        ).toISOString(),
        current_period_end: new Date(
          subscription.items.data[0]?.current_period_end * 1000,
        ).toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: "stripe_subscription_id" },
    );
  },

  async handleAccountUpdated(account: Stripe.Account) {
    const config = await getStripeConfig();
    await this.persistConnectStatus(account, getStripeMode(config.secretKey));
  },
};

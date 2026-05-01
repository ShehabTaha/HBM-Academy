/**
 * app/api/webhooks/stripe/route.ts
 *
 * Stripe webhook endpoint.
 * - Verifies signature using constructEvent()
 * - Processes events idempotently
 * - Returns 200 immediately to avoid Stripe retry storms
 */
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { stripeService } from "@/lib/services/stripe.service";
import { createAdminClient } from "@/lib/supabase/admin";
import Stripe from "stripe";

export const runtime = "nodejs";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function db(supabase: any): any {
  return supabase;
}

export async function POST(request: Request) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET ?? "";

  if (!signature) {
    console.error("[Stripe Webhook] Missing stripe-signature header");
    return new NextResponse("Missing signature", { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = await stripeService.constructWebhookEvent(body, signature);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Signature verification failed";
    console.error("[Stripe Webhook] Signature verification failed:", msg);
    return new NextResponse(`Webhook Error: ${msg}`, { status: 400 });
  }

  const supabase = createAdminClient();
  const dbAny = db(supabase);

  // Idempotency check
  const { data: existingEvent } = await dbAny
    .from("stripe_events")
    .select("id, status")
    .eq("stripe_event_id", event.id)
    .single();

  if (existingEvent?.status === "processed") {
    console.log(`[Stripe Webhook] Duplicate event ignored: ${event.id}`);
    return NextResponse.json({ received: true, duplicate: true });
  }

  // Log the received event immediately
  await dbAny.from("stripe_events").upsert(
    {
      stripe_event_id: event.id,
      event_type: event.type,
      status: "received",
      payload: event,
      created_at: new Date(event.created * 1000).toISOString(),
    },
    { onConflict: "stripe_event_id" },
  );

  // Return 200 to Stripe immediately; process asynchronously
  processWebhookEvent(event, dbAny).catch((err: unknown) => {
    const msg = err instanceof Error ? err.message : "Processing failed";
    console.error(`[Stripe Webhook] Processing failed for ${event.id}:`, msg);
    // Best-effort status update — fire and forget
    dbAny
      .from("stripe_events")
      .update({ status: "failed", error_message: msg })
      .eq("stripe_event_id", event.id)
      .then(() => {/* noop */})
      .catch(console.error);
  });

  return NextResponse.json({ received: true });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function processWebhookEvent(event: Stripe.Event, dbAny: any) {
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      await stripeService.handleCheckoutCompleted(session);
      break;
    }
    case "payment_intent.succeeded": {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      await stripeService.handlePaymentIntentSucceeded(paymentIntent);
      break;
    }
    case "payment_intent.payment_failed": {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      await dbAny.from("stripe_events").upsert(
        {
          stripe_event_id: `pi_failed_${paymentIntent.id}`,
          event_type: "payment_intent.payment_failed",
          status: "processed",
          payload: paymentIntent,
          error_message: paymentIntent.last_payment_error?.message ?? "Unknown",
          processed_at: new Date().toISOString(),
        },
        { onConflict: "stripe_event_id" },
      );
      console.warn(`[Stripe Webhook] Payment failed: ${paymentIntent.id}`);
      break;
    }
    default:
      console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`);
  }
}

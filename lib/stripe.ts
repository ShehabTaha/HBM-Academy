/**
 * lib/stripe.ts
 *
 * Singleton Stripe server-side client.
 * NEVER import this in client components – it relies on the secret key.
 */
import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Missing STRIPE_SECRET_KEY. Cannot start in production without Stripe keys.");
  }
  console.warn(
    "[Stripe] STRIPE_SECRET_KEY is not set. Stripe features will fail at runtime.",
  );
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_placeholder_for_build", {
  apiVersion: "2026-04-22.dahlia",
  typescript: true,
});

export default stripe;

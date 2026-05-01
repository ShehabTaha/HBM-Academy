/**
 * app/api/admin/payment/stripe/status/route.ts
 *
 * Returns live Stripe connection status by actually querying the Stripe API.
 */
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/security/requireAdmin";
import { stripeService } from "@/lib/services/stripe.service";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  try {
    const { error: authError } = await requireAdmin();
    if (authError) return authError;

    const supabase = createAdminClient();
    const { data: rows } = await supabase
      .from("platform_settings")
      .select("setting_key, setting_value")
      .in("setting_key", [
        "stripe_secret_key",
        "stripe_publishable_key",
        "stripe_webhook_secret",
      ]);

    const map: Record<string, string> = {};
    rows?.forEach((r: { setting_key: string; setting_value: unknown }) => {
      map[r.setting_key] = (r.setting_value as string) ?? "";
    });

    const secretKey = map["stripe_secret_key"];
    const publishableKey = map["stripe_publishable_key"];
    const webhookSecret = map["stripe_webhook_secret"];

    const hasKeys = !!(secretKey && publishableKey);
    const isLiveMode = secretKey?.startsWith("sk_live_") ?? false;

    if (!hasKeys) {
      return NextResponse.json({
        connected: false,
        verified: false,
        test_mode: true,
        has_webhook: false,
        account: null,
        message: "Stripe keys not configured",
      });
    }

    // Real connection test
    const test = await stripeService.testConnection(secretKey);

    return NextResponse.json({
      connected: test.success,
      verified: test.success,
      test_mode: !isLiveMode,
      has_webhook: !!webhookSecret,
      account: test.success ? { type: isLiveMode ? "live" : "test" } : null,
      error: test.error ?? null,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

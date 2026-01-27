import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    await requireAdmin();
    const supabase = await createClient();

    // In a real app, we would query the payment_integrations table
    // For now, we'll return a mock status or check if keys exist

    // Check if Stripe keys exist in settings
    const { data: settings } = await supabase
      .from("platform_settings")
      .select("setting_key, setting_value")
      .in("setting_key", ["stripe_public_key", "stripe_secret_key"]);

    const hasPublicKey = settings?.some(
      (s) => s.setting_key === "stripe_public_key" && s.setting_value,
    );
    const hasSecretKey = settings?.some(
      (s) => s.setting_key === "stripe_secret_key" && s.setting_value,
    );

    const connected = hasPublicKey && hasSecretKey;

    return NextResponse.json({
      connected,
      verified: connected, // Mock verification
      account: connected
        ? {
            email: "merchant@example.com",
            type: "standard",
            country: "US",
          }
        : null,
      test_mode: true,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

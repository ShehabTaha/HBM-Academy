import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/security/requireAdmin";
import { stripeService } from "@/lib/services/stripe.service";

export async function GET(request: Request) {
  const url = new URL(request.url);

  try {
    const { error: authError } = await requireAdmin();
    if (authError) {
      url.pathname = "/admin/login";
      url.search = "?callbackUrl=/dashboard/settings";
      return NextResponse.redirect(url);
    }

    const status = await stripeService.getConnectStatus();
    url.pathname = "/dashboard/settings";
    url.search = `?tab=payment&stripe_connect=${status.connected ? "enabled" : "pending"}`;
    return NextResponse.redirect(url);
  } catch (error) {
    const message = error instanceof Error ? error.message : "connect_failed";
    console.error("[Stripe Connect] Callback sync failed:", message);
    url.pathname = "/dashboard/settings";
    url.search = `?tab=payment&stripe_connect=error&message=${encodeURIComponent(message)}`;
    return NextResponse.redirect(url);
  }
}

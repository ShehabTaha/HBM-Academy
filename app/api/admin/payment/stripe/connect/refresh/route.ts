import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/security/requireAdmin";
import { stripeService } from "@/lib/services/stripe.service";

export async function GET(request: Request) {
  const url = new URL(request.url);

  try {
    const { error: authError } = await requireAdmin();
    if (authError) {
      url.pathname = "/auth/login";
      url.search = "?redirect=/dashboard/settings";
      return NextResponse.redirect(url);
    }

    const link = await stripeService.createConnectOnboardingLink(url.origin);
    return NextResponse.redirect(link.url);
  } catch (error) {
    const message = error instanceof Error ? error.message : "refresh_failed";
    console.error("[Stripe Connect] Refresh failed:", message);
    url.pathname = "/dashboard/settings";
    url.search = `?tab=payment&stripe_connect=error&message=${encodeURIComponent(message)}`;
    return NextResponse.redirect(url);
  }
}

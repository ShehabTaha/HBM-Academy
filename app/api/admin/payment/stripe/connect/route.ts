import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/security/requireAdmin";
import { stripeService } from "@/lib/services/stripe.service";

export async function POST(request: Request) {
  try {
    const { error: authError } = await requireAdmin();
    if (authError) return authError;

    const origin = new URL(request.url).origin;
    const link = await stripeService.createConnectOnboardingLink(origin);

    return NextResponse.json(link);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Stripe onboarding could not be started.";
    console.error("[Stripe Connect] Start failed:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * app/api/admin/payment/stripe/test-connection/route.ts
 *
 * Tests the Stripe connection using the provided (or stored) secret key.
 * Calls stripe.balance.retrieve() to verify credentials.
 */
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/security/requireAdmin";
import { stripeService } from "@/lib/services/stripe.service";
import { z } from "zod";

const schema = z.object({
  secretKey: z.string().min(10).optional(),
});

export async function POST(request: Request) {
  try {
    const { error: authError } = await requireAdmin();
    if (authError) return authError;

    const body = await request.json();
    const parsed = schema.safeParse(body);

    const secretKey = parsed.success ? parsed.data.secretKey : undefined;

    // Validate key format before hitting Stripe API
    if (secretKey && !secretKey.startsWith("sk_")) {
      return NextResponse.json(
        { success: false, error: "Invalid secret key format. Must start with sk_test_ or sk_live_" },
        { status: 400 },
      );
    }

    const result = await stripeService.testConnection(secretKey);

    return NextResponse.json(result, { status: result.success ? 200 : 400 });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 },
    );
  }
}

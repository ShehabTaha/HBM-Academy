/**
 * app/api/stripe/create-checkout-session/route.ts
 *
 * Creates a Stripe Checkout Session for a course purchase.
 * Uses idempotency keys to prevent duplicate charges.
 */
import { NextResponse } from "next/server";
import { stripeService } from "@/lib/services/stripe.service";
import { createAdminClient } from "@/lib/supabase/admin";
import { z } from "zod";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function db(supabase: any): any { return supabase; }

const schema = z.object({
  courseId: z.string().uuid(),
  userId: z.string().uuid(),
  userEmail: z.string().email(),
  successUrl: z.string().url(),
  cancelUrl: z.string().url(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { courseId, userId, userEmail, successUrl, cancelUrl } = parsed.data;

    const supabase = createAdminClient();
    const dbAny = db(supabase);

    // Fetch course details
    const { data: course, error: courseError } = await dbAny
      .from("courses")
      .select("id, title, price, currency")
      .eq("id", courseId)
      .single();

    if (courseError || !course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Check if already enrolled
    const { data: existing } = await dbAny
      .from("enrollments")
      .select("id")
      .eq("user_id", userId)
      .eq("course_id", courseId)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: "Already enrolled in this course" },
        { status: 409 },
      );
    }

    const session = await stripeService.createCheckoutSession({
      userId,
      userEmail,
      courseId,
      courseTitle: course.title as string,
      price: course.price as number,
      currency: (course.currency as string) ?? "usd",
      successUrl,
      cancelUrl,
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Internal error";
    console.error("[Stripe] Create checkout session failed:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

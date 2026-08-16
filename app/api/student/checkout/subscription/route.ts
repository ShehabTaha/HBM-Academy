import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentStudent } from "@/lib/services/student.service";
import { stripeService } from "@/lib/services/stripe.service";

const subscriptionSchema = z.object({
  category: z.string().max(120).nullable().optional(),
  price: z.number().positive().default(29),
});

export async function POST(request: Request) {
  const student = await getCurrentStudent();
  if (!student) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = subscriptionSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid subscription request" }, { status: 400 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const session = await stripeService.createSubscriptionCheckoutSession({
    userId: student.id,
    userEmail: student.email,
    category: parsed.data.category,
    price: parsed.data.price,
    successUrl: `${appUrl}/dashboard?subscription=success`,
    cancelUrl: `${appUrl}/courses?subscription=cancelled`,
  });

  return NextResponse.json({ url: session.url, sessionId: session.id });
}

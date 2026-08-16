import { NextResponse } from "next/server";
import { getCurrentStudent } from "@/lib/services/student.service";
import { createClient } from "@/lib/supabase/server";
import stripe from "@/lib/stripe";

export async function POST() {
  const student = await getCurrentStudent();
  if (!student) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = await createClient();
  const { data: subscription } = await (supabase.from("student_subscriptions") as any)
    .select("stripe_customer_id")
    .eq("student_id", student.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!subscription?.stripe_customer_id) {
    return NextResponse.json({ error: "No Stripe customer found." }, { status: 404 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const session = await stripe.billingPortal.sessions.create({
    customer: subscription.stripe_customer_id,
    return_url: `${appUrl}/profile`,
  });

  return NextResponse.json({ url: session.url });
}

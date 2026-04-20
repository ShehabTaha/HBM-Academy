import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-options";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { sendEmail, buildOTPEmailHTML } from "@/lib/email";
import crypto from "crypto";

const schema = z.object({
  email: z.string().email("Invalid email address"),
  purpose: z.enum(["primary_change", "notification_add"]),
});

function generateOTP(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function hashOTP(otp: string): string {
  return crypto.createHash("sha256").update(otp).digest("hex");
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues?.[0]?.message || parsed.error.message },
        { status: 400 }
      );
    }

    const { email, purpose } = parsed.data;
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    );

    // Check if email is already in use (only relevant for primary change)
    if (purpose === "primary_change") {
      const { data: existing } = await supabase
        .from("users")
        .select("id")
        .eq("email", email)
        .neq("id", session.user.id)
        .single();

      if (existing) {
        return NextResponse.json(
          { error: "This email is already in use." },
          { status: 409 }
        );
      }
    }

    // Delete any existing OTP tokens for this user+purpose
    await supabase
      .from("email_otp_tokens")
      .delete()
      .eq("user_id", session.user.id)
      .eq("purpose", purpose);

    // Generate OTP and store hashed version
    const otp = generateOTP();
    const otpHash = hashOTP(otp);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const { error: insertError } = await supabase
      .from("email_otp_tokens")
      .insert({
        user_id: session.user.id,
        email,
        purpose,
        otp_hash: otpHash,
        expires_at: expiresAt.toISOString(),
        attempts: 0,
      });

    if (insertError) {
      console.error("[send-otp] Insert error:", insertError);
      return NextResponse.json(
        { error: "Failed to generate verification code. Please try again." },
        { status: 500 }
      );
    }

    // Send the email
    await sendEmail({
      to: email,
      subject: "Your HBM Academy Verification Code",
      html: buildOTPEmailHTML(otp, purpose),
    });

    return NextResponse.json({
      success: true,
      message: "Verification code sent.",
    });
  } catch (error: unknown) {
    console.error("[send-otp] Error:", error);
    return NextResponse.json(
      { error: "Failed to send verification code. Please try again." },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-options";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import crypto from "crypto";

const schema = z.object({
  email: z.string().email(),
  otp: z.string().length(6, "OTP must be 6 digits"),
  purpose: z.enum(["primary_change", "notification_add"]),
});

const MAX_ATTEMPTS = 3;

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

    const { email, otp, purpose } = parsed.data;
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    );

    // Look up the token
    const { data: token, error: fetchError } = await supabase
      .from("email_otp_tokens")
      .select("*")
      .eq("user_id", session.user.id)
      .eq("email", email)
      .eq("purpose", purpose)
      .single();

    if (fetchError || !token) {
      return NextResponse.json(
        { error: "No verification code found. Please request a new one." },
        { status: 404 }
      );
    }

    // Check expiry
    if (new Date(token.expires_at) < new Date()) {
      await supabase
        .from("email_otp_tokens")
        .delete()
        .eq("id", token.id);
      return NextResponse.json(
        { error: "Your code has expired. Please request a new one." },
        { status: 410 }
      );
    }

    // Check attempts
    if (token.attempts >= MAX_ATTEMPTS) {
      return NextResponse.json(
        {
          error: "Too many incorrect attempts. Please request a new code.",
          locked: true,
        },
        { status: 429 }
      );
    }

    // Verify OTP
    const inputHash = hashOTP(otp);
    if (inputHash !== token.otp_hash) {
      const newAttempts = token.attempts + 1;
      await supabase
        .from("email_otp_tokens")
        .update({ attempts: newAttempts })
        .eq("id", token.id);

      const remaining = MAX_ATTEMPTS - newAttempts;
      if (remaining <= 0) {
        return NextResponse.json(
          {
            error: "Too many incorrect attempts. Please request a new code.",
            locked: true,
            attemptsRemaining: 0,
          },
          { status: 429 }
        );
      }
      return NextResponse.json(
        {
          error: `Incorrect code. ${remaining} attempt${remaining === 1 ? "" : "s"} remaining.`,
          attemptsRemaining: remaining,
        },
        { status: 422 }
      );
    }

    // OTP is correct — perform the action
    if (purpose === "primary_change") {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: updateError } = await (supabase.from("users") as any)
        .update({ email })
        .eq("id", session.user.id);

      if (updateError) {
        console.error("[verify-otp] Email update error:", updateError);
        return NextResponse.json(
          { error: "Failed to update email. Please try again." },
          { status: 500 }
        );
      }
    } else if (purpose === "notification_add") {
      // Fetch current settings
      const { data: settings } = await supabase
        .from("admin_notification_settings")
        .select("recipient_emails")
        .eq("admin_user_id", session.user.id)
        .single();

      const currentEmails: string[] = settings?.recipient_emails ?? [];
      if (!currentEmails.includes(email)) {
        await supabase
          .from("admin_notification_settings")
          .update({ recipient_emails: [...currentEmails, email] })
          .eq("admin_user_id", session.user.id);
      }
    }

    // Delete the used token
    await supabase.from("email_otp_tokens").delete().eq("id", token.id);

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("[verify-otp] Error:", error);
    return NextResponse.json(
      { error: "Verification failed. Please try again." },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { supabase } from "@/lib/supabase";
import { generateTokenWithExpiry } from "@/lib/auth-utils";
// import { sendPasswordResetEmail } from "@/lib/email"; // TODO: Implement email service

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = forgotPasswordSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 },
      );
    }

    const { email } = validation.data;

    // Find user
    const { data: userRaw, error: findError } = await supabase
      .from("users")
      .select("*")
      .eq("email", email.toLowerCase())
      .is("deleted_at", null)
      .single();

    // Always return success to prevent email enumeration
    if (!userRaw || findError) {
      // Simulate delay to prevent timing attacks
      await new Promise((resolve) => setTimeout(resolve, 500));
      return NextResponse.json({
        message: "If the email exists, a reset link has been sent",
      });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const user = userRaw as any; // Keeping this primarily for flexibility but the fetch is typed now

    // Generate reset token (short for URL, can keep token for DB as is or hash it)
    const { token, expires } = generateTokenWithExpiry(1); // 1 hour expiry

    // Save token to password_reset_tokens table
    const { error: createTokenError } =
      await // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (supabase.from("password_reset_tokens") as any).insert({
        user_id: user.id,
        token: token,
        token_hash: token, // ideally should be hashed, but for simplicity now keeping same.
        expires_at: expires.toISOString(),
      });

    if (createTokenError) {
      console.error("Error creating reset token:", createTokenError);
      return NextResponse.json(
        { error: "Failed to process request" },
        { status: 500 },
      );
    }

    // TODO: Send email with reset link
    // const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;
    // await sendPasswordResetEmail(user.email, resetUrl);

    console.log("Password reset token:", token); // For development

    return NextResponse.json({
      message: "If the email exists, a reset link has been sent",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 },
    );
  }
}

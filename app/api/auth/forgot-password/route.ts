import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { supabase } from "@/lib/supabase";
import { generateTokenWithExpiry } from "@/lib/auth-utils";

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
        { status: 400 }
      );
    }

    const { email } = validation.data;

    // Find user
    const { data: user, error: findError } = await supabase
      .from("users")
      .select("*")
      .eq("email", email.toLowerCase())
      .is("deletedAt", null)
      .single();

    // Always return success to prevent email enumeration
    if (!user || findError) {
      return NextResponse.json({
        message: "If the email exists, a reset link has been sent",
      });
    }

    // Generate reset token
    const { token, expires } = generateTokenWithExpiry(1); // 1 hour expiry

    // Save token to user
    const { error: updateError } = await supabase
      .from("users")
      .update({
        resetPasswordToken: token,
        resetPasswordExpires: expires,
      })
      .eq("id", user.id);

    if (updateError) {
      console.error("Error updating user with reset token:", updateError);
      return NextResponse.json(
        { error: "Failed to process request" },
        { status: 500 }
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
      { status: 500 }
    );
  }
}

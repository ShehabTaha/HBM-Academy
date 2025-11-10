import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { generateTokenWithExpiry } from "@/lib/auth-utils";

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export async function POST(req: NextRequest) {
  try {
    await connectDB();

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
    const user = await User.findOne({
      email: email.toLowerCase(),
      deletedAt: null,
    });

    // Always return success to prevent email enumeration
    if (!user) {
      return NextResponse.json({
        message: "If the email exists, a reset link has been sent",
      });
    }

    // Generate reset token
    const { token, expires } = generateTokenWithExpiry(1); // 1 hour expiry

    // Save token to user
    user.resetPasswordToken = token;
    user.resetPasswordExpires = expires;
    await user.save();

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
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { supabase } from "@/lib/supabase";

const verifyEmailSchema = z.object({
  token: z.string().min(1, "Token is required"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = verifyEmailSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid request data" },
        { status: 400 },
      );
    }

    const { token } = validation.data;

    // 1. Check if token exists in email_verification table and is not expired
    const { data: tokenData, error: tokenError } = await supabase
      .from("email_verification")
      .select("*")
      .eq("token", token)
      .gt("expires_at", new Date().toISOString())
      .is("verified_at", null)
      .single();

    if (tokenError || !tokenData) {
      return NextResponse.json(
        { error: "Invalid or expired verification token" },
        { status: 400 },
      );
    }

    // 2. Update user's email verification status
    const { error: updateUserError } = await supabase
      .from("users")
      .update({ is_email_verified: true })
      .eq("id", tokenData.user_id);

    if (updateUserError) {
      console.error("Error updating user verification:", updateUserError);
      throw new Error("Failed to verify email");
    }

    // 3. Mark token as verified
    await supabase
      .from("email_verification")
      .update({ verified_at: new Date().toISOString() })
      .eq("id", tokenData.id);

    return NextResponse.json({
      success: true,
      message: "Email verified successfully",
    });
  } catch (error) {
    console.error("Verification error:", error);
    return NextResponse.json(
      { error: "Failed to verify email" },
      { status: 500 },
    );
  }
}

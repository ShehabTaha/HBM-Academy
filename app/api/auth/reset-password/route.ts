import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { supabase } from "@/lib/supabase";
import bcrypt from "bcryptjs";

const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = resetPasswordSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid request data" },
        { status: 400 },
      );
    }

    const { token, password } = validation.data;

    // 1. Check if token exists in password_reset_tokens table and is not expired
    const { data: tokenData, error: tokenError } = await supabase
      .from("password_reset_tokens")
      .select("*")
      .eq("token", token)
      .gt("expires_at", new Date().toISOString())
      .is("used_at", null)
      .single();

    if (tokenError || !tokenData) {
      return NextResponse.json(
        { error: "Invalid or expired reset token" },
        { status: 400 },
      );
    }

    // 2. Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Update user password
    const { error: updateUserError } =
      await // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (supabase.from("users") as any)
        .update({ password: hashedPassword })
        .eq("id", (tokenData as any).user_id);

    if (updateUserError) {
      console.error("Error updating user password:", updateUserError);
      throw new Error("Failed to update password");
    }

    // 4. Mark token as used
    await // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase.from("password_reset_tokens") as any)
      .update({ used_at: new Date().toISOString() })
      .eq("id", (tokenData as any).id);

    return NextResponse.json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { error: "Failed to reset password" },
      { status: 500 },
    );
  }
}

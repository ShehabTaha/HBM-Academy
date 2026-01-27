import { createClient } from "@/lib/supabase/server";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { currentPassword, newPassword } = await req.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { message: "Missing credentials" },
        { status: 400 },
      );
    }

    const supabase = await createClient();

    // 1. Fetch user including password hash
    const { data: user, error: fetchError } = await supabase
      .from("users" as any)
      .select("id, password")
      .eq("email", session.user.email)
      .single();

    if (fetchError || !user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // 2. Verify current password
    const isPasswordCorrect = await bcrypt.compare(
      currentPassword,
      (user as any).password,
    );
    if (!isPasswordCorrect) {
      return NextResponse.json(
        { message: "Incorrect current password" },
        { status: 401 },
      );
    }

    // 3. Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // 4. Update password in database
    const { error: updateError } = await supabase
      .from("users" as any)
      .update({
        password: hashedNewPassword,
        updated_at: new Date().toISOString(),
      })
      .eq("id", (user as any).id);

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error: any) {
    console.error("Password change error:", error);
    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 },
    );
  }
}

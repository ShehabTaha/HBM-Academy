import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-options";
import { createAdminClient } from "@/lib/supabase/admin";

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createAdminClient();

    // Delete from user_profiles
    await supabase
      .from("user_profiles")
      .delete()
      .eq("user_id", session.user.id);

    // Delete from user_sessions
    await supabase
      .from("user_sessions")
      .delete()
      .eq("user_id", session.user.id);

    // Delete user from Auth (requires service role)
    const { error: deleteUserError } = await supabase.auth.admin.deleteUser(
      session.user.id,
    );

    if (deleteUserError) {
      console.error("Error deleting auth user:", deleteUserError);
      // We might fail here if not properly configured, but we cleaned up public tables at least.
      // But actually, if we fail to delete auth user, they can still login potentially?
      // It implies we should handle this gracefully or ensure permissions.
      throw deleteUserError;
    }

    return NextResponse.json({
      success: true,
      message: "Account permanently deleted",
    });
  } catch (error: any) {
    console.error("[Delete Account API] Error:", error);
    return NextResponse.json(
      { error: "Failed to delete account" },
      { status: 500 },
    );
  }
}

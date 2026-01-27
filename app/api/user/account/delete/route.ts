import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-options";
import { createClient } from "@supabase/supabase-js";

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Create Supabase client with service role key
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false },
    });

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

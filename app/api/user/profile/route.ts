import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-options";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  try {
    // Get the authenticated session
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Create Supabase client with service role key to bypass RLS
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 },
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    // Fetch user from users table
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("id", session.user.id)
      .single();

    if (userError) {
      console.error("[Profile API] Error fetching user:", userError);
      return NextResponse.json(
        { error: "Failed to fetch user data" },
        { status: 500 },
      );
    }

    // Try to fetch profile from user_profiles table (optional - table may not exist)
    let profileData = null;

    try {
      const { data, error: profileError } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("user_id", session.user.id)
        .single();

      // If profile doesn't exist (no rows), try to create it
      if (profileError && profileError.code === "PGRST116") {
        const { data: newProfile } = await supabase
          .from("user_profiles")
          .insert({ user_id: session.user.id })
          .select()
          .single();

        profileData = newProfile;
      } else if (!profileError) {
        profileData = data;
      }
      // If table doesn't exist (PGRST205), just log and continue without profile
      if (profileError && profileError.code === "PGRST205") {
        console.warn(
          "[Profile API] user_profiles table not found - using basic user data only",
        );
      }
    } catch (err) {
      console.warn("[Profile API] Could not fetch profile data:", err);
    }

    return NextResponse.json({
      user: userData,
      profile: profileData,
    });
  } catch (error) {
    console.error("[Profile API] Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

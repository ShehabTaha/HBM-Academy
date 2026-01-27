import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-options";
import { createClient } from "@supabase/supabase-js";

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { preferences } = body;

    if (!preferences || typeof preferences !== "object") {
      return NextResponse.json(
        { error: "Invalid preferences object" },
        { status: 400 },
      );
    }

    // Create Supabase client with service role key
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

    // Check if profile exists
    const { data: existing } = await supabase
      .from("user_profiles")
      .select("id, preferences")
      .eq("user_id", session.user.id)
      .single();

    // Merge with existing preferences
    const updatedPreferences = {
      ...(existing?.preferences || {}),
      ...preferences,
    };

    let result;

    if (existing) {
      // Update existing profile
      const { data, error } = await supabase
        .from("user_profiles")
        .update({ preferences: updatedPreferences })
        .eq("user_id", session.user.id)
        .select()
        .single();

      if (error) throw error;
      result = data;
    } else {
      // Create new profile with preferences
      const { data, error } = await supabase
        .from("user_profiles")
        .insert({ user_id: session.user.id, preferences: updatedPreferences })
        .select()
        .single();

      if (error) throw error;
      result = data;
    }

    return NextResponse.json({
      success: true,
      preferences: result.preferences,
    });
  } catch (error: any) {
    console.error("[Preferences API] Error:", error);

    // Handle case where table doesn't exist
    if (error.code === "PGRST205" || error.code === "42P01") {
      return NextResponse.json(
        {
          error:
            "user_profiles table not found. Please run database migrations.",
        },
        { status: 503 },
      );
    }

    return NextResponse.json(
      { error: "Failed to update preferences" },
      { status: 500 },
    );
  }
}

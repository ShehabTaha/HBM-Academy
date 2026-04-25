import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-options";
import { createClient } from "@supabase/supabase-js";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sessionId = session.user.sessionId;

    // If no sessionId in token (older session before tracking was added),
    // return success silently — do NOT kick them out
    if (!sessionId) {
      return NextResponse.json({ success: true, skipped: true });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    // 1. Check if session still exists in DB
    const { data: existingSession, error: checkError } = await supabase
      .from("user_sessions")
      .select("id")
      .eq("id", sessionId)
      .eq("user_id", session.user.id)
      .single();

    if (checkError || !existingSession) {
      // Session doesn't exist anymore (likely revoked)
      // We return a specific status code (e.g., 401 or 403) to tell the client to logout
      return NextResponse.json(
        { error: "Session revoked", revoked: true },
        { status: 401 }
      );
    }

    // 2. Update heartbeat
    const { error: updateError } = await supabase
      .from("user_sessions")
      .update({ last_activity: new Date().toISOString() })
      .eq("id", sessionId);

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[Heartbeat API] Error:", error);
    return NextResponse.json(
      { error: "Failed to update heartbeat" },
      { status: 500 }
    );
  }
}

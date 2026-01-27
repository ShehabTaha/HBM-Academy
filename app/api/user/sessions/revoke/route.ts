import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-options";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { sessionId, revokeAll } = body;

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

    if (revokeAll) {
      // Revoke all sessions except current
      const { error } = await supabase
        .from("user_sessions")
        .delete()
        .eq("user_id", session.user.id)
        .neq("id", session.user.id); // Don't delete current session

      if (error) {
        if (error.code === "PGRST205" || error.code === "42P01") {
          return NextResponse.json(
            { error: "Sessions table not found" },
            { status: 503 },
          );
        }
        throw error;
      }

      return NextResponse.json({
        success: true,
        message: "All other sessions revoked",
      });
    } else if (sessionId) {
      // Revoke specific session
      const { error } = await supabase
        .from("user_sessions")
        .delete()
        .eq("id", sessionId)
        .eq("user_id", session.user.id);

      if (error) {
        if (error.code === "PGRST205" || error.code === "42P01") {
          return NextResponse.json(
            { error: "Sessions table not found" },
            { status: 503 },
          );
        }
        throw error;
      }

      return NextResponse.json({
        success: true,
        message: "Session revoked",
      });
    } else {
      return NextResponse.json(
        { error: "sessionId or revokeAll required" },
        { status: 400 },
      );
    }
  } catch (error) {
    console.error("[Revoke Session API] Error:", error);
    return NextResponse.json(
      { error: "Failed to revoke session" },
      { status: 500 },
    );
  }
}

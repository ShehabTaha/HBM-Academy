import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-options";
import { createClient } from "@supabase/supabase-js";

function formatDuration(createdAt: string, lastActivity: string, isCurrent: boolean): string {
  if (isCurrent) return "Ongoing";
  const start = new Date(createdAt).getTime();
  const end = new Date(lastActivity).getTime();
  const diffMs = Math.max(0, end - start);
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  if (hours === 0) return `${minutes}m`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
}

function deriveStatus(lastActivity: string): "active" | "inactive" {
  const diff = Date.now() - new Date(lastActivity).getTime();
  return diff < 30 * 60 * 1000 ? "active" : "inactive";
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

    const { data: rawSessions, error } = await supabase
      .from("user_sessions")
      .select("*")
      .eq("user_id", session.user.id)
      .order("last_activity", { ascending: false });

    if (error) {
      if (error.code === "PGRST205" || error.code === "42P01") {
        console.warn("[Sessions API] user_sessions table not found");
        return NextResponse.json({ sessions: [] });
      }
      throw error;
    }

    // Mark current session by matching token stored in session
    const currentToken = (session as any).sessionToken ?? null;

    const enrichedSessions = (rawSessions ?? []).map((s: any) => {
      const isCurrent =
        currentToken && s.session_token
          ? s.session_token === currentToken
          : false;

      return {
        ...s,
        city: s.city ?? null,
        country: s.country ?? null,
        is_current: isCurrent,
        status: deriveStatus(s.last_activity),
        duration: formatDuration(s.created_at, s.last_activity, isCurrent),
      };
    });

    // Sort: current first, then by last_activity descending
    enrichedSessions.sort((a: any, b: any) => {
      if (a.is_current) return -1;
      if (b.is_current) return 1;
      return new Date(b.last_activity).getTime() - new Date(a.last_activity).getTime();
    });

    return NextResponse.json({ sessions: enrichedSessions });
  } catch (error) {
    console.error("[Sessions API] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch sessions" },
      { status: 500 }
    );
  }
}

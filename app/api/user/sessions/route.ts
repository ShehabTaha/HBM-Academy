import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-options";
import { createClient } from "@supabase/supabase-js";

function formatDuration(createdAt: string, lastActivity: string, isCurrent: boolean): string {
  if (isCurrent) return "Ongoing";
  const diffMs = Math.max(0, new Date(lastActivity).getTime() - new Date(createdAt).getTime());
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  if (hours === 0) return `${minutes}m`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
}

function deriveStatus(lastActivity: string): "active" | "inactive" {
  // With a 5-minute heartbeat, mark inactive if not seen in 10 minutes
  return Date.now() - new Date(lastActivity).getTime() < 10 * 60 * 1000
    ? "active"
    : "inactive";
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
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data: rawSessions, error } = await supabase
      .from("user_sessions")
      .select("id, user_id, device_name, device_type, browser, os, ip_address, city, country, last_activity, created_at, expires_at")
      .eq("user_id", session.user.id)
      .gt("expires_at", new Date().toISOString())   // exclude expired sessions
      .order("last_activity", { ascending: false });

    if (error) {
      // Table not found — return empty gracefully
      if (error.code === "PGRST205" || error.code === "42P01") {
        console.warn("[Sessions API] user_sessions table not found — run the migration.");
        return NextResponse.json({ sessions: [] });
      }
      throw error;
    }

    // Match current session by sessionId stored in the JWT (most reliable)
    const currentSessionId = session.user.sessionId;

    const enriched = (rawSessions ?? []).map((s: any) => {
      const isCurrent = !!currentSessionId && s.id === currentSessionId;
      return {
        ...s,
        os: s.os ?? null,
        city: s.city ?? null,
        country: s.country ?? null,
        is_current: isCurrent,
        status: isCurrent ? "active" : deriveStatus(s.last_activity),
        duration: formatDuration(s.created_at, s.last_activity, isCurrent),
      };
    });

    // Current session always first, then newest last_activity
    enriched.sort((a: any, b: any) => {
      if (a.is_current) return -1;
      if (b.is_current) return 1;
      return new Date(b.last_activity).getTime() - new Date(a.last_activity).getTime();
    });

    return NextResponse.json({ sessions: enriched });
  } catch (error) {
    console.error("[Sessions API] Error:", error);
    return NextResponse.json({ error: "Failed to fetch sessions" }, { status: 500 });
  }
}


import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path";

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

interface RawSession {
  id: string;
  user_id: string;
  device_name: string | null;
  device_type: string | null;
  browser: string | null;
  os: string | null;
  ip_address: string | null;
  city: string | null;
  country: string | null;
  last_activity: string;
  created_at: string;
  expires_at: string;
  users: { email: string } | null;
}

async function debugSessions(): Promise<void> {
  console.log("\n🔍  Fetching user sessions from Supabase...\n");

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error(
      "❌  Missing env vars: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY"
    );
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // Check the table exists
  const { error: tableCheck } = await supabase
    .from("user_sessions")
    .select("id")
    .limit(1);

  if (tableCheck?.code === "42P01" || tableCheck?.code === "PGRST205") {
    console.error(
      "❌  user_sessions table does not exist.\n" +
      "   Run this in Supabase SQL Editor:\n" +
      "   supabase/migrations/20260425000000_rebuild_user_sessions.sql"
    );
    process.exit(1);
  }

  const { data: sessions, error } = await supabase
    .from("user_sessions")
    .select(`
      id,
      user_id,
      device_name,
      device_type,
      browser,
      os,
      ip_address,
      city,
      country,
      last_activity,
      created_at,
      expires_at,
      users ( email )
    `)
    .order("last_activity", { ascending: false })
    .returns<RawSession[]>();

  if (error) {
    console.error("❌  Query failed:", JSON.stringify(error, null, 2));
    process.exit(1);
  }

  if (!sessions || sessions.length === 0) {
    console.log("ℹ️  No sessions found.\n");
    console.log("   Possible causes:");
    console.log("   1. No one has logged in yet since the migration was run.");
    console.log("   2. The INSERT in auth-options.ts is failing — check server logs.");
    console.log("   3. All sessions have expired.\n");
    process.exit(0);
  }

  const now = Date.now();
  console.log(`✅  Found ${sessions.length} session(s):\n`);

  sessions.forEach((s, i) => {
    const lastSeen = new Date(s.last_activity);
    const minutesAgo = Math.floor((now - lastSeen.getTime()) / 60000);
    const isActive = minutesAgo < 10;
    const isExpired = new Date(s.expires_at).getTime() < now;

    console.log(`┌─ Session ${i + 1} ─────────────────────────────────`);
    console.log(`│  ID:          ${s.id}`);
    console.log(`│  User:        ${s.users?.email ?? s.user_id}`);
    console.log(`│  Device:      ${s.device_name ?? "Unknown"} (${s.device_type ?? "?"})`);
    console.log(`│  Browser:     ${s.browser ?? "Unknown"}`);
    console.log(`│  OS:          ${s.os ?? "Unknown"}`);
    console.log(`│  IP:          ${s.ip_address ?? "Unknown"}`);
    console.log(`│  Location:    ${[s.city, s.country].filter(Boolean).join(", ") || "Unknown"}`);
    console.log(`│  Created:     ${new Date(s.created_at).toLocaleString()}`);
    console.log(`│  Last Active: ${lastSeen.toLocaleString()} (${minutesAgo}m ago)`);
    console.log(`│  Expires:     ${new Date(s.expires_at).toLocaleString()}`);
    console.log(`│  Status:      ${isExpired ? "⛔ EXPIRED" : isActive ? "🟢 ACTIVE" : "🔴 INACTIVE"}`);
    console.log(`└────────────────────────────────────────────────\n`);
  });

  const active = sessions.filter(
    (s) => !new Date(s.expires_at) && Date.now() - new Date(s.last_activity).getTime() < 10 * 60 * 1000
  ).length;
  console.log(`Summary: ${sessions.length} total | ~${active} active in last 10min\n`);
}

debugSessions();


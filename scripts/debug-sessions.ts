import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path";

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

async function debugSessions() {
  console.log("🔍 Fetching active user sessions...");

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error(
      "❌ Missing environment variables: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY"
    );
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  try {
    const { data: sessions, error } = await supabase
      .from("user_sessions")
      .select(`
        id,
        user_id,
        device_name,
        device_type,
        browser,
        ip_address,
        last_activity,
        created_at,
        users (
          email
        )
      `)
      .order("last_activity", { ascending: false });

    if (error) {
      throw error;
    }

    if (!sessions || sessions.length === 0) {
      console.log("ℹ️ No active sessions found in the database.");
      process.exit(0);
    }

    console.log(`✅ Found ${sessions.length} active session(s):\n`);

    sessions.forEach((session, index) => {
      // Determine if session is active (seen in last 10 minutes)
      const lastActivityDate = new Date(session.last_activity);
      const isInactive = Date.now() - lastActivityDate.getTime() > 10 * 60 * 1000;
      
      console.log(`--- Session ${index + 1} ---`);
      console.log(`User ID:      ${session.user_id}`);
      // @ts-expect-error - joined table data
      console.log(`Email:        ${session.users?.email || 'Unknown'}`);
      console.log(`Device:       ${session.device_name} (${session.device_type})`);
      console.log(`Browser:      ${session.browser}`);
      console.log(`IP Address:   ${session.ip_address}`);
      console.log(`Created:      ${new Date(session.created_at).toLocaleString()}`);
      console.log(`Last Seen:    ${lastActivityDate.toLocaleString()} ${isInactive ? "(INACTIVE)" : "(ACTIVE)"}`);
      console.log("");
    });
  } catch (error) {
    console.error("❌ Failed to fetch sessions:");
    console.error(error);
    process.exit(1);
  }
}

// Execute the debug script
debugSessions();

import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase environment variables");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function addColumn() {
  console.log("Adding landing_page_settings column to courses table...");

  // Directly executing SQL via supabase-js is not possible for DDL unless using a specific hook or RPC
  // However, we can try to use the REST API to see if it works, or just instruct the user.
  // Actually, Supabase doesn't expose a "run sql" method in the JS client for security.

  console.log(
    "Supabase JS client does not support executing arbitrary SQL for DDL changes.",
  );
  console.log("Please run the following SQL in your Supabase SQL Editor:");
  console.log(
    "ALTER TABLE courses ADD COLUMN landing_page_settings JSONB DEFAULT NULL;",
  );
}

addColumn();

import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  // Try to find the user
  const { data: user } = await supabase.from("users").select("id").limit(1).single();
  if (!user) {
    console.log("No users found");
    return;
  }
  
  console.log("Trying to upsert for user:", user.id);
  
  const { data, error } = await supabase
    .from("admin_notification_settings")
    .upsert(
      {
        admin_user_id: user.id,
        recipient_emails: ["test@test.com"],
        preferences: {},
        updated_at: new Date().toISOString(),
      },
      { onConflict: "admin_user_id" },
    )
    .select()
    .single();

  console.log("Error:", error);
  console.log("Data:", data);
}

main();

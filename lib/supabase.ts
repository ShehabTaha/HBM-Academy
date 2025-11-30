import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://xpxeqwgexgbhqukxrpai.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhweGVxd2dleGdiaHF1a3hycGFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEwODA4MzUsImV4cCI6MjA3NjY1NjgzNX0.lcLr-t0kkwfFbu06SwH08r63b0id6RtAtxUAss5bBh4";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

if (!supabaseUrl || !supabase) {
  throw new Error("Missing SUPABASE_URL or SUPABASE_KEY environment variables");
}

supabase
  .from("users")
  .select("*")
  .then(({ data, error }) => {
    console.log(data, error);
  });

export default supabase;
// Example usage:

// You can now use the `supabase` client to interact with your Supabase database
// For example, to fetch data from a table called 'users':

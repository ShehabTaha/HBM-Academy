import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/security/requireAdmin";

export async function GET() {
  const { error: authError } = await requireAdmin();
  if (authError) return authError;

  const supabase = createAdminClient();
  const { data, error } = await (supabase.from("conversations") as any)
    .select("*, student:users(name,email,avatar), messages(body,sender_role,is_read,created_at)")
    .order("updated_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ conversations: data ?? [] });
}

import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/security/requireAdmin";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(req: NextRequest) {
  const { error: authError } = await requireAdmin();
  if (authError) return authError;

  const supabaseAdmin = createAdminClient();

  try {
    const { data, error } = await supabaseAdmin
      .from("videos")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { error: authError } = await requireAdmin();
  if (authError) return authError;

  try {
    const body = await req.json();
    const supabaseAdmin = createAdminClient();

    const { user } = await requireAdmin(); // We know it's admin if we reach here
    const { error } = await supabaseAdmin.from("videos").insert({
      ...body,
      instructor_id: user?.id,
    });

    if (error) throw error;

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

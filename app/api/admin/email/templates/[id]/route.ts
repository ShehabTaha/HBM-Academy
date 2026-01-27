import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const user = await requireAdmin();
    const supabase = await createClient();
    const body = await request.json();
    const { id } = await params;

    const { error } = await supabase
      .from("email_templates")
      .update({
        ...body,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

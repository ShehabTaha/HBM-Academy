import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    await requireAdmin();
    const supabase = await createClient();

    const { data: templates, error } = await supabase
      .from("email_templates")
      .select("*")
      .order("template_key");

    if (error) throw error;

    return NextResponse.json(templates);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

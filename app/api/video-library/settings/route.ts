import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user: authUser },
    error: authError,
  } = await supabase.auth.getUser();

  let user = authUser;

  // Fallback for development
  if (!user && process.env.NODE_ENV === "development") {
    user = { id: "00000000-0000-0000-0000-000000000000" } as any;
  } else if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { data, error } = await supabase
      .from("video_library_settings" as any)
      .select("*")
      .eq("instructor_id", user!.id)
      .single();

    if (error && error.code !== "PGRST116") throw error; // PGRST116 is "No rows found"

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user: authUser },
    error: authError,
  } = await supabase.auth.getUser();

  let user = authUser;

  if (!user && process.env.NODE_ENV === "development") {
    user = { id: "00000000-0000-0000-0000-000000000000" } as any;
  } else if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { data, error } = await supabase
      .from("video_library_settings" as any)
      .upsert({
        instructor_id: user!.id,
        ...body,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user: authUser },
    error: authError,
  } = await supabase.auth.getUser();

  let user = authUser;

  // Fallback for development if auth is disabled
  if (!user && process.env.NODE_ENV === "development") {
    console.warn("No Supabase user session found, using development fallback");
    user = { id: "00000000-0000-0000-0000-000000000000" } as any;
  } else if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { data, error } = await supabase
      .from("videos" as any)
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  // This is primarily for metadata creation after upload, or if we did multipart upload here directly.
  // See upload/route.ts for actual file handling usually, but standard REST might put it here.
  // We will assume this creates the DB record.
  const supabase = await createClient();
  const {
    data: { user: authUser },
    error: authError,
  } = await supabase.auth.getUser();

  let user = authUser;

  // Fallback for development if auth is disabled
  if (!user && process.env.NODE_ENV === "development") {
    console.warn("No Supabase user session found, using development fallback");
    user = { id: "00000000-0000-0000-0000-000000000000" } as any;
  } else if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { error } = await (supabase.from("videos") as any).insert({
      ...body,
      instructor_id: user!.id,
    });

    if (error) throw error;

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

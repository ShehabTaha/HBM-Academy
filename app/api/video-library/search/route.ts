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

  const url = new URL(req.url);
  const q = url.searchParams.get("q");

  try {
    let query = supabase.from("videos" as any).select("*");

    // Basic full text search if supported or simple like
    if (q) {
      query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%`);
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

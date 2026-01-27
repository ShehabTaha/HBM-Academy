import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

export async function GET(req: NextRequest) {
  // Use NextAuth for authentication
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = await createClient();

  try {
    const { data: videosRaw, error } = await supabase
      .from("videos" as any)
      .select("file_size")
      .eq("instructor_id", session.user.id);

    if (error) throw error;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const videos = videosRaw as any[];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const used = videos.reduce(
      (acc: number, v: any) => acc + (v.file_size || 0),
      0,
    );
    const limit = 53687091200; // 50 GB default

    return NextResponse.json({
      used,
      limit,
      percentage: (used / limit) * 100,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

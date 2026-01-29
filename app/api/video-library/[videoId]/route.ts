import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/security/requireAdmin";
import { createAdminClient } from "@/lib/supabase/admin";

export async function DELETE(
  req: NextRequest,
  props: { params: Promise<{ videoId: string }> },
) {
  const { error: authError } = await requireAdmin();
  if (authError) return authError;

  const supabase = createAdminClient();

  const { videoId } = await props.params;

  try {
    // 1. Get video to find storage path
    const { data: videoRaw, error: fetchError } = await supabase
      .from("videos" as any)
      .select("*")
      .eq("id", videoId)
      .single();

    if (fetchError || !videoRaw) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const video = videoRaw as any;

    // 2. Delete from Storage
    if (video.file_url) {
      // Extract path from URL or store path in DB. Assuming standard path structure
      // URL: .../storage/v1/object/public/lecture-videos/{uid}/{vid}/{filename}
      // We need: {uid}/{vid}/{filename}
      try {
        const url = new URL(video.file_url);
        const pathParts = url.pathname.split("/lecture-videos/");
        if (pathParts.length > 1) {
          const storagePath = pathParts[1];
          await supabase.storage.from("lecture-videos").remove([storagePath]);
        }
      } catch (e) {
        console.error("Error parsing/deleting file", e);
      }
    }

    // 3. Delete from DB
    const { error } = await supabase
      .from("videos" as any)
      .delete()
      .eq("id", videoId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  props: { params: Promise<{ videoId: string }> },
) {
  const { error: authError } = await requireAdmin();
  if (authError) return authError;

  const supabase = createAdminClient();

  const { videoId } = await props.params;

  try {
    const body = await req.json();
    const { data, error } = await (supabase.from("videos" as any) as any)
      .update(body)
      .eq("id", videoId)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

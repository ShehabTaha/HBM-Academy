import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

export async function POST(
  req: NextRequest,
  props: { params: Promise<{ videoId: string }> },
) {
  const params = await props.params;
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { videoId } = params;
  const supabase = await createClient();

  try {
    // 1. Fetch original video
    const { data: originalVideoRaw, error: fetchError } = await supabase
      .from("videos" as any)
      .select("*")
      .eq("id", videoId)
      .single();

    if (fetchError || !originalVideoRaw) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const originalVideo = originalVideoRaw as any;

    const newVideoId = crypto.randomUUID();
    let newFileUrl = originalVideo.file_url;

    // 2. Copy file in storage if it exists
    if (originalVideo.file_url) {
      try {
        const url = new URL(originalVideo.file_url);
        // Path format: .../lecture-videos/{path}
        const pathParts = url.pathname.split("/lecture-videos/");

        if (pathParts.length > 1) {
          const sourcePath = pathParts[1]; // e.g., "user_123/video_456/lesson.mp4"
          // We want to create: "user_123/{newVideoId}/lesson.mp4"
          // So we need to replace the middle part.
          // Assuming structure is always instructor_id/video_id/filename
          // But it might be safer to just extract filename

          const pathSegments = sourcePath.split("/");
          const fileName = pathSegments[pathSegments.length - 1];
          const newPath = `${session.user.id}/${newVideoId}/${fileName}`;

          const { error: copyError } = await supabase.storage
            .from("lecture-videos")
            .copy(sourcePath, newPath);

          if (copyError) {
            console.error("Failed to copy file in storage:", copyError);
            // Verify if it failed because it already exists or something.
            // If copy fails, we might abort or continue with null file.
            // pushing through for now, but logging it.
            throw copyError;
          }

          const { data: publicUrlData } = supabase.storage
            .from("lecture-videos")
            .getPublicUrl(newPath);

          newFileUrl = publicUrlData.publicUrl;
        }
      } catch (e) {
        console.error("Error copying file:", e);
        return NextResponse.json(
          { error: "Failed to copy video file" },
          { status: 500 },
        );
      }
    }

    // 3. Create new video record
    const { data: newVideo, error: insertError } = await (
      supabase.from("videos" as any) as any
    )
      .insert({
        ...originalVideo,
        id: newVideoId,
        instructor_id: session.user.id, // Ensure ownership
        title: `${originalVideo.title} (Copy)`,
        file_url: newFileUrl,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (insertError) throw insertError;

    return NextResponse.json(newVideo);
  } catch (error: any) {
    console.error("Duplicate error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

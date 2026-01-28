import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

// Initialize Supabase Admin Client
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function POST(req: NextRequest) {
  // Use NextAuth for authentication
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // const supabase = await createClient(); // Removed

  try {
    // Check Content-Type to support both JSON (new) and potentially handling legacy if needed,
    // but we are switching to JSON for the client-side upload flow.
    const contentType = req.headers.get("content-type") || "";

    if (!contentType.includes("application/json")) {
      return NextResponse.json(
        { error: "Content-Type must be application/json" },
        { status: 400 },
      );
    }

    const {
      title,
      description,
      tags,
      is_public,
      duration,
      width,
      height,
      codecs,
      file_path,
      file_size,
      thumbnail_url,
    } = await req.json();

    if (!file_path || !title) {
      return NextResponse.json(
        { error: "Missing required fields (file_path, title)" },
        { status: 400 },
      );
    }

    // Get Public URL
    const {
      data: { publicUrl },
    } = supabaseAdmin.storage.from("lecture-videos").getPublicUrl(file_path);

    const videoId = file_path.split("/")[1]; // Assuming path is user_id/video_id/filename

    // 2. Create DB Record
    const { data: video, error: dbError } = await (
      supabaseAdmin.from("videos") as any
    )
      .insert({
        id: videoId || crypto.randomUUID(), // Use ID from path if available, else new
        instructor_id: session.user.id,
        title,
        description,
        tags: tags || [],
        is_public: is_public || false,
        file_url: publicUrl,
        thumbnail_url: thumbnail_url || null,
        file_size: file_size || 0,
        duration: duration || 0,
        metadata: {
          resolution: `${width || 0}x${height || 0}`,
          videoCodec: codecs || "",
        },
      })
      .select()
      .single();

    if (dbError) throw dbError;

    return NextResponse.json(video);
  } catch (error: any) {
    console.error("Upload handler error", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

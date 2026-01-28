import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase Admin Client
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function POST(req: NextRequest) {
  // 1. Authenticate with NextAuth
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const {
      filename,
      contentType,
      videoId: clientVideoId,
      resourceType,
    } = await req.json();

    if (!filename) {
      return NextResponse.json(
        { error: "Filename is required" },
        { status: 400 },
      );
    }

    const videoId = clientVideoId || crypto.randomUUID();
    const fileExt = filename.split(".").pop();

    // Path structure
    let filePath = "";
    if (resourceType === "thumbnail") {
      const thumbnailId = crypto.randomUUID();
      filePath = `${session.user.id}/${videoId}/thumbnail_${thumbnailId}.${fileExt}`;
    } else {
      // Default to video
      filePath = `${session.user.id}/${videoId}/${videoId}.${fileExt}`;
    }

    // 2. Generate Signed Upload URL
    // This allows the client to upload specifically to this path without being previously authenticated with Supabase
    const { data, error } = await supabaseAdmin.storage
      .from("lecture-videos")
      .createSignedUploadUrl(filePath);

    if (error) throw error;

    return NextResponse.json({
      signedUrl: data.signedUrl,
      token: data.token,
      path: filePath, // Client needs this path to save metadata later
    });
  } catch (error: any) {
    console.error("Error generating signed upload URL:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

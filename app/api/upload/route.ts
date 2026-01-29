import { NextRequest, NextResponse } from "next/server";
import {
  StorageService,
  uploadVideo,
  uploadAudio,
  uploadCourseMaterial,
  uploadCourseThumbnail,
  uploadAvatar,
} from "@/lib/services/storage.service";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { requireAdmin } from "@/lib/security/requireAdmin";

/**
 * POST /api/upload
 * Generic file upload endpoint
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const type = formData.get("type") as string; // 'avatar', 'course-thumbnail', 'video', 'audio', 'material'
    const entityId = formData.get("entity_id") as string; // User ID, Course ID, or Lesson ID

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!type) {
      return NextResponse.json(
        { error: "Upload type required" },
        { status: 400 },
      );
    }

    let result;

    switch (type) {
      case "avatar":
        // SECURITY: Users can only upload their own avatar unless they are admins
        if (entityId && entityId !== session.user.id) {
          const { error: adminError } = await requireAdmin();
          if (adminError) return adminError;
        }
        result = await uploadAvatar(entityId || session.user.id, file);
        break;

      case "course-thumbnail":
      case "video":
      case "audio":
      case "material":
        // SECURITY: Only admins can upload course-related content
        const { error: adminError } = await requireAdmin();
        if (adminError) return adminError;

        if (!entityId) {
          return NextResponse.json(
            { error: "Entity ID (Course/Lesson) required" },
            { status: 400 },
          );
        }

        if (type === "course-thumbnail")
          result = await uploadCourseThumbnail(entityId, file);
        else if (type === "video") result = await uploadVideo(entityId, file);
        else if (type === "audio") result = await uploadAudio(entityId, file);
        else result = await uploadCourseMaterial(entityId, file);
        break;

      default:
        return NextResponse.json(
          { error: "Invalid upload type" },
          { status: 400 },
        );
    }

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      url: result.url,
      path: result.path,
    });
  } catch (error) {
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}

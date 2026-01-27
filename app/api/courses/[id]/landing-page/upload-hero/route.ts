import { NextRequest, NextResponse } from "next/server";
import { uploadLandingPageHero } from "@/lib/services/storage.service";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { CourseService } from "@/lib/services/courses.service";

/**
 * POST /api/courses/[id]/landing-page/upload-hero
 * Upload hero background image for a course
 */
export async function POST(
  request: NextRequest,
  props: { params: Promise<{ id: string }> },
) {
  const params = await props.params;

  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    // Check if user owns the course or is admin
    const { course: existingCourse } = await CourseService.getCourseById(id);
    if (!existingCourse) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    if (
      existingCourse.instructor_id !== session.user.id &&
      session.user.role !== "admin"
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const result = await uploadLandingPageHero(id, file);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      url: result.url,
      path: result.path,
    });
  } catch (error) {
    console.error("Hero upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}

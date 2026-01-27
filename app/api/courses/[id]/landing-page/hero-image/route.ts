import { NextRequest, NextResponse } from "next/server";
import { deleteLandingPageHero } from "@/lib/services/storage.service";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { CourseService } from "@/lib/services/courses.service";

/**
 * DELETE /api/courses/[id]/landing-page/hero-image
 * Delete hero background image for a course
 */
export async function DELETE(
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

    const { searchParams } = new URL(request.url);
    const path = searchParams.get("path");

    if (!path) {
      return NextResponse.json({ error: "No path provided" }, { status: 400 });
    }

    const result = await deleteLandingPageHero(path);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Hero delete error:", error);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}

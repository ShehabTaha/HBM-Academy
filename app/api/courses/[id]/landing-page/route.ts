import { NextRequest, NextResponse } from "next/server";
import { CourseService } from "@/lib/services/courses.service";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

/**
 * GET /api/courses/[id]/landing-page
 * Get landing page settings for a course
 */
export async function GET(
  request: NextRequest,
  props: { params: Promise<{ id: string }> },
) {
  const params = await props.params;
  try {
    const { id } = params;
    const { settings, error } = await CourseService.getLandingPageSettings(id);

    if (error) {
      return NextResponse.json({ error }, { status: 404 });
    }

    return NextResponse.json({ settings });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch landing page settings" },
      { status: 500 },
    );
  }
}

/**
 * PUT /api/courses/[id]/landing-page
 * Update landing page settings for a course
 */
export async function PUT(
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
    const settings = await request.json();

    // Check if user owns the course or is admin
    const { course: existingCourse } = await CourseService.getCourseById(id);

    if (
      existingCourse &&
      existingCourse.instructor_id !== session.user.id &&
      session.user.role !== "admin"
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { course, error } = await CourseService.updateLandingPageSettings(
      id,
      settings,
    );

    if (error) {
      return NextResponse.json({ error }, { status: 400 });
    }

    return NextResponse.json({ course });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update landing page settings" },
      { status: 500 },
    );
  }
}

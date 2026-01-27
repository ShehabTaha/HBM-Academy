import { NextRequest, NextResponse } from "next/server";
import { CourseService } from "@/lib/services/courses.service";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

/**
 * GET /api/courses/[id]
 * Get course by ID with full details
 */
export async function GET(
  request: NextRequest,
  props: { params: Promise<{ id: string }> },
) {
  const params = await props.params;
  try {
    const { id } = params;
    const searchParams = request.nextUrl.searchParams;
    const withDetails = searchParams.get("details") === "true";

    if (withDetails) {
      const { course, error } = await CourseService.getCourseWithDetails(id);

      if (error) {
        return NextResponse.json({ error }, { status: 404 });
      }

      return NextResponse.json({ course });
    } else {
      const { course, error } = await CourseService.getCourseById(id);

      if (error) {
        return NextResponse.json({ error }, { status: 404 });
      }

      return NextResponse.json({ course });
    }
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch course" },
      { status: 500 },
    );
  }
}

/**
 * PUT /api/courses/[id]
 * Update course
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
    const body = await request.json();

    // Check if user owns the course or is admin
    const { course: existingCourse } = await CourseService.getCourseById(id);

    if (
      existingCourse &&
      existingCourse.instructor_id !== session.user.id &&
      session.user.role !== "admin"
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { course, error } = await CourseService.updateCourse(id, body);

    if (error) {
      return NextResponse.json({ error }, { status: 400 });
    }

    return NextResponse.json({ course });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update course" },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/courses/[id]
 * Delete course
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
    const { course } = await CourseService.getCourseById(id);

    if (
      course &&
      course.instructor_id !== session.user.id &&
      session.user.role !== "admin"
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { success, error } = await CourseService.deleteCourse(id);

    if (error) {
      return NextResponse.json({ error }, { status: 400 });
    }

    return NextResponse.json({ success });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete course" },
      { status: 500 },
    );
  }
}

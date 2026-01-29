import { NextRequest, NextResponse } from "next/server";
import { EnrollmentService } from "@/lib/services/enrollments.service";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

/**
 * GET /api/enrollments
 * Get enrollments (by student or course)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const studentId = searchParams.get("student_id");
    const courseId = searchParams.get("course_id");

    // Ownership check: If studentId is provided, it must match current user OR user must be admin
    if (
      studentId &&
      studentId !== session.user.id &&
      (session.user as any).role !== "admin"
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (studentId) {
      const { enrollments, error } =
        await EnrollmentService.getStudentEnrollments(studentId);

      if (error) {
        return NextResponse.json({ error }, { status: 400 });
      }

      return NextResponse.json({ enrollments });
    } else if (courseId) {
      const { enrollments, error } =
        await EnrollmentService.getCourseEnrollments(courseId);

      if (error) {
        return NextResponse.json({ error }, { status: 400 });
      }

      return NextResponse.json({ enrollments });
    } else {
      return NextResponse.json(
        { error: "student_id or course_id required" },
        { status: 400 },
      );
    }
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch enrollments" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/enrollments
 * Enroll a student in a course
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { course_id, student_id } = body;

    // Students can only enroll themselves
    if (session.user.role === "student" && student_id !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { enrollment, error } = await EnrollmentService.enrollStudent(
      student_id || session.user.id,
      course_id,
    );

    if (error) {
      return NextResponse.json({ error }, { status: 400 });
    }

    return NextResponse.json({ enrollment }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to enroll student" },
      { status: 500 },
    );
  }
}

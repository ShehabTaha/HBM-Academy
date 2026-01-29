import { NextRequest, NextResponse } from "next/server";
import { ProgressService } from "@/lib/services/progress.service";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * PUT /api/progress
 * Update lesson progress
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      enrollment_id,
      lesson_id,
      is_completed,
      time_spent,
      last_position,
    } = body;

    // SECURITY: Verify the enrollment belongs to the user
    const supabaseAdmin = createAdminClient();
    const { data: enrollment, error: enrollmentError } = await (supabaseAdmin
      .from("enrollments")
      .select("student_id")
      .eq("id", enrollment_id)
      .single() as any);

    if (enrollmentError || !enrollment) {
      return NextResponse.json(
        { error: "Enrollment not found" },
        { status: 404 },
      );
    }

    if (
      enrollment.student_id !== session.user.id &&
      (session.user as any).role !== "admin"
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { progress, error } = await ProgressService.updateLessonProgress(
      enrollment_id,
      lesson_id,
      {
        is_completed,
        time_spent,
        last_position,
      },
    );

    if (error) {
      return NextResponse.json({ error }, { status: 400 });
    }

    // If lesson was marked complete, recalculate course progress
    if (is_completed) {
      await ProgressService.calculateCourseProgress(enrollment_id);
    }

    return NextResponse.json({ progress });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update progress" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/progress/complete
 * Mark lesson as complete
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { enrollment_id, lesson_id } = body;

    // SECURITY: Verify the enrollment belongs to the user
    const supabaseAdmin = createAdminClient();
    const { data: enrollment, error: enrollmentError } = await (supabaseAdmin
      .from("enrollments")
      .select("student_id")
      .eq("id", enrollment_id)
      .single() as any);

    if (enrollmentError || !enrollment) {
      return NextResponse.json(
        { error: "Enrollment not found" },
        { status: 404 },
      );
    }

    if (
      enrollment.student_id !== session.user.id &&
      (session.user as any).role !== "admin"
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { progress, error } = await ProgressService.markLessonComplete(
      enrollment_id,
      lesson_id,
    );

    if (error) {
      return NextResponse.json({ error }, { status: 400 });
    }

    return NextResponse.json({ progress });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to mark lesson complete" },
      { status: 500 },
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { ProgressService } from "@/lib/services/progress.service";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

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

    // Verify the enrollment belongs to the user
    // This would be better done in the service with proper auth

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

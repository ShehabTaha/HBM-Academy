import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentStudent } from "@/lib/services/student.service";
import { markLessonComplete } from "@/lib/services/mastery.service";

const progressSchema = z.object({
  is_completed: z.literal(true),
  time_spent: z.number().int().min(0).optional(),
  last_position: z.number().int().min(0).optional(),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ lessonId: string }> },
) {
  const student = await getCurrentStudent();
  if (!student) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { lessonId } = await params;
  const parsed = progressSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid progress data" },
      { status: 400 },
    );
  }

  const result = await markLessonComplete({
    lessonId,
    studentId: student.id,
    timeSpent: parsed.data.time_spent,
    lastPosition: parsed.data.last_position,
  });

  if (result.error) {
    return NextResponse.json(
      { error: result.error },
      { status: result.status ?? 500 },
    );
  }

  return NextResponse.json(result);
}

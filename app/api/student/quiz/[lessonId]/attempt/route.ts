import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentStudent } from "@/lib/services/student.service";
import { submitQuizAttempt } from "@/lib/services/quiz.service";

const attemptSchema = z.object({
  answers: z.record(z.string(), z.enum(["a", "b", "c", "d"])),
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
  const parsed = attemptSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid quiz answers" }, { status: 400 });
  }

  const result = await submitQuizAttempt({
    studentId: student.id,
    lessonId,
    answers: parsed.data.answers,
  });

  if (result.error) {
    return NextResponse.json(
      { error: result.error },
      { status: result.status ?? 500 },
    );
  }

  return NextResponse.json(result);
}

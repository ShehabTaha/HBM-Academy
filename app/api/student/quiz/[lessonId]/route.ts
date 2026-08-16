import { NextResponse } from "next/server";
import { getCurrentStudent } from "@/lib/services/student.service";
import { getQuizForStudent } from "@/lib/services/quiz.service";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ lessonId: string }> },
) {
  const student = await getCurrentStudent();
  if (!student) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { lessonId } = await params;
  const result = await getQuizForStudent(student.id, lessonId);

  if (result.error) {
    return NextResponse.json(
      { error: result.error },
      { status: result.status ?? 500 },
    );
  }

  return NextResponse.json(result);
}

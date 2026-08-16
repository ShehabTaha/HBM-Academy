import { NextResponse } from "next/server";
import { getCurrentStudent } from "@/lib/services/student.service";
import { listPracticalSubmissions } from "@/lib/services/practical.service";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ lessonId: string }> },
) {
  const student = await getCurrentStudent();
  if (!student) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { lessonId } = await params;
  const result = await listPracticalSubmissions(student.id, lessonId);
  return NextResponse.json({ lessonId, ...result });
}

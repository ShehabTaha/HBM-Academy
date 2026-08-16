import { NextResponse } from "next/server";
import { getCurrentStudent } from "@/lib/services/student.service";
import { submitPracticalWork } from "@/lib/services/practical.service";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ lessonId: string }> },
) {
  const student = await getCurrentStudent();
  if (!student) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { lessonId } = await params;
  const formData = await request.formData();
  const file = formData.get("file");
  const notes = formData.get("notes");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "A file is required." }, { status: 400 });
  }

  const result = await submitPracticalWork({
    studentId: student.id,
    lessonId,
    file,
    notes: typeof notes === "string" ? notes : undefined,
  });

  if (result.error) {
    return NextResponse.json(
      { error: result.error },
      { status: result.status ?? 500 },
    );
  }

  return NextResponse.json(result);
}

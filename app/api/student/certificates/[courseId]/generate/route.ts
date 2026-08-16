import { NextResponse } from "next/server";
import { getCurrentStudent } from "@/lib/services/student.service";
import { CertificateService } from "@/lib/services/certificates.service";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ courseId: string }> },
) {
  const student = await getCurrentStudent();
  if (!student) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { courseId } = await params;
  const result = await CertificateService.generateForStudentCourse({
    studentId: student.id,
    courseId,
  });

  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: result.status ?? 500 });
  }

  return NextResponse.json(result);
}

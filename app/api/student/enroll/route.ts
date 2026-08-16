import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getCurrentStudent, getPublicCourse } from "@/lib/services/student.service";

const enrollSchema = z.object({
  courseId: z.string().uuid(),
});

export async function POST(request: Request) {
  const student = await getCurrentStudent();
  if (!student) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = enrollSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid course id" }, { status: 400 });
  }

  const course = await getPublicCourse(parsed.data.courseId);
  if (!course) {
    return NextResponse.json({ error: "Course not found" }, { status: 404 });
  }

  if (Number(course.price) > 0) {
    return NextResponse.json(
      { error: "Paid checkout is not enabled yet." },
      { status: 402 },
    );
  }

  const supabase = await createClient();
  const { data: existing } = await (supabase.from("enrollments") as any)
    .select("*")
    .eq("student_id", student.id)
    .eq("course_id", course.id)
    .maybeSingle();

  const enrollment =
    existing ??
    (
      await (supabase.from("enrollments") as any)
        .insert({
          student_id: student.id,
          course_id: course.id,
          progress_percentage: 0,
        })
        .select()
        .single()
    ).data;

  if (!enrollment) {
    return NextResponse.json(
      { error: "Could not create enrollment" },
      { status: 500 },
    );
  }

  return NextResponse.json({
    enrollment,
    firstLessonId: course.sections?.[0]?.lessons?.[0]?.id ?? null,
  });
}

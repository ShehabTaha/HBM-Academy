import { createClient } from "@/lib/supabase/server";
import { getCourseMastery } from "@/lib/services/mastery.service";

export async function requireStudentCourseAccess(studentId: string, courseId: string) {
  const supabase = await createClient();
  const { data: enrollment } = await (supabase.from("enrollments") as any)
    .select("*")
    .eq("student_id", studentId)
    .eq("course_id", courseId)
    .maybeSingle();

  if (!enrollment) return { error: "Enrollment required", status: 403 };
  return { enrollment };
}

export async function requireUnlockedLesson(studentId: string, lessonId: string) {
  const supabase = await createClient();
  const { data: lesson } = await (supabase.from("lessons") as any)
    .select("id,section:sections(course_id)")
    .eq("id", lessonId)
    .maybeSingle();

  if (!lesson?.section?.course_id) return { error: "Lesson not found", status: 404 };

  const mastery = await getCourseMastery(lesson.section.course_id, studentId, lessonId);
  const lessonState = mastery?.lessons.find((item) => item.id === lessonId);

  if (!mastery?.enrollment) return { error: "Enrollment required", status: 403 };
  if (!lessonState) return { error: "Lesson not found", status: 404 };
  if (lessonState.locked) return { error: "Complete the previous lesson first", status: 423 };

  return { mastery, lessonState };
}

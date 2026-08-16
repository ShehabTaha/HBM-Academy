import { createClient } from "@/lib/supabase/server";
import {
  getPublicCourse,
  sortCourse,
  type CourseLesson,
  type PublicCourse,
} from "@/lib/services/student.service";

export interface LessonState extends CourseLesson {
  completed: boolean;
  locked: boolean;
  active: boolean;
}

export interface CourseMastery {
  course: PublicCourse;
  enrollment: any;
  lessons: LessonState[];
  completedCount: number;
  totalLessons: number;
  progressPercent: number;
  nextLesson: LessonState | null;
}

export async function getCourseMastery(
  courseIdOrSlug: string,
  studentId: string,
  activeLessonId?: string,
): Promise<CourseMastery | null> {
  const supabase = await createClient();
  const course = await getPublicCourse(courseIdOrSlug);
  if (!course) return null;

  const { data: enrollment } = await (supabase.from("enrollments") as any)
    .select("*")
    .eq("course_id", course.id)
    .eq("student_id", studentId)
    .maybeSingle();

  if (!enrollment) {
    return {
      course,
      enrollment: null,
      lessons: flattenCourse(course).map((lesson, index) => ({
        ...lesson,
        completed: false,
        locked: index > 0 && !lesson.is_free_preview,
        active: lesson.id === activeLessonId,
      })),
      completedCount: 0,
      totalLessons: flattenCourse(course).length,
      progressPercent: 0,
      nextLesson: flattenCourse(course)[0] as LessonState | null,
    };
  }

  const { data: progress } = await (supabase.from("progress") as any)
    .select("*")
    .eq("enrollment_id", enrollment.id);

  const completedLessonIds = new Set(
    (progress ?? [])
      .filter((item: any) => item.is_completed)
      .map((item: any) => item.lesson_id),
  );

  let previousComplete = true;
  const lessons = flattenCourse(course).map((lesson) => {
    const completed = completedLessonIds.has(lesson.id);
    const locked = !lesson.is_free_preview && !previousComplete;
    previousComplete = completed;

    return {
      ...lesson,
      completed,
      locked,
      active: lesson.id === activeLessonId,
    };
  });

  const completedCount = lessons.filter((lesson) => lesson.completed).length;
  const totalLessons = lessons.length;
  const progressPercent =
    totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  return {
    course: sortCourse(course),
    enrollment,
    lessons,
    completedCount,
    totalLessons,
    progressPercent,
    nextLesson:
      lessons.find((lesson) => !lesson.completed && !lesson.locked) ?? null,
  };
}

export async function markLessonComplete(params: {
  lessonId: string;
  studentId: string;
  timeSpent?: number;
  lastPosition?: number;
}) {
  const supabase = await createClient();

  const { data: lesson } = await (supabase.from("lessons") as any)
    .select("*, section:sections(course_id)")
    .eq("id", params.lessonId)
    .maybeSingle();

  if (!lesson?.section?.course_id) {
    return { error: "Lesson not found", status: 404 };
  }

  if (lesson.type === "quiz" || lesson.type === "practical") {
    return {
      error: "This lesson type must be completed through its assessment flow.",
      status: 400,
    };
  }

  const mastery = await getCourseMastery(
    lesson.section.course_id,
    params.studentId,
    params.lessonId,
  );
  const state = mastery?.lessons.find((item) => item.id === params.lessonId);

  if (!mastery?.enrollment || !state) {
    return { error: "Enrollment required", status: 403 };
  }

  if (state.locked) {
    return { error: "Complete the previous lesson first", status: 423 };
  }

  const { data, error } = await (supabase.from("progress") as any)
    .upsert(
      {
        enrollment_id: mastery.enrollment.id,
        lesson_id: params.lessonId,
        is_completed: true,
        completed_at: new Date().toISOString(),
        time_spent: params.timeSpent ?? 0,
        last_position: params.lastPosition ?? 0,
      },
      { onConflict: "enrollment_id,lesson_id" },
    )
    .select()
    .single();

  if (error) return { error: error.message, status: 500 };

  const updatedMastery = await getCourseMastery(
    lesson.section.course_id,
    params.studentId,
  );

  if (updatedMastery?.enrollment) {
    await (supabase.from("enrollments") as any)
      .update({
        progress_percentage: updatedMastery.progressPercent,
        completed_at:
          updatedMastery.progressPercent === 100
            ? new Date().toISOString()
            : null,
      })
      .eq("id", updatedMastery.enrollment.id);

    if (updatedMastery.progressPercent === 100) {
      const { CertificateService } = await import(
        "@/lib/services/certificates.service"
      );
      await CertificateService.generateForStudentCourse({
        studentId: params.studentId,
        courseId: lesson.section.course_id,
      });
    }
  }

  return { progress: data, nextLesson: updatedMastery?.nextLesson ?? null };
}

export async function completeAssessmentLesson(params: {
  lessonId: string;
  studentId: string;
}) {
  const supabase = await createClient();

  const { data: lesson } = await (supabase.from("lessons") as any)
    .select("*, section:sections(course_id)")
    .eq("id", params.lessonId)
    .maybeSingle();

  if (!lesson?.section?.course_id) {
    return { error: "Lesson not found", status: 404 };
  }

  const mastery = await getCourseMastery(
    lesson.section.course_id,
    params.studentId,
    params.lessonId,
  );
  const state = mastery?.lessons.find((item) => item.id === params.lessonId);

  if (!mastery?.enrollment || !state) {
    return { error: "Enrollment required", status: 403 };
  }

  if (state.locked) {
    return { error: "Complete the previous lesson first", status: 423 };
  }

  const { data, error } = await (supabase.from("progress") as any)
    .upsert(
      {
        enrollment_id: mastery.enrollment.id,
        lesson_id: params.lessonId,
        is_completed: true,
        completed_at: new Date().toISOString(),
      },
      { onConflict: "enrollment_id,lesson_id" },
    )
    .select()
    .single();

  if (error) return { error: error.message, status: 500 };

  const updatedMastery = await getCourseMastery(
    lesson.section.course_id,
    params.studentId,
  );

  if (updatedMastery?.enrollment) {
    await (supabase.from("enrollments") as any)
      .update({
        progress_percentage: updatedMastery.progressPercent,
        completed_at:
          updatedMastery.progressPercent === 100
            ? new Date().toISOString()
            : null,
      })
      .eq("id", updatedMastery.enrollment.id);

    if (updatedMastery.progressPercent === 100) {
      const { CertificateService } = await import(
        "@/lib/services/certificates.service"
      );
      await CertificateService.generateForStudentCourse({
        studentId: params.studentId,
        courseId: lesson.section.course_id,
      });
    }
  }

  return { progress: data, nextLesson: updatedMastery?.nextLesson ?? null };
}

export function flattenCourse(course: PublicCourse): CourseLesson[] {
  return (course.sections ?? []).flatMap((section) => section.lessons ?? []);
}

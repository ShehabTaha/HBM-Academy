import { createClient } from "@/lib/supabase/server";
import { completeAssessmentLesson, getCourseMastery } from "@/lib/services/mastery.service";

type QuizQuestionRow = {
  id: string;
  lesson_id: string;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string | null;
  option_d: string | null;
  correct_option: "a" | "b" | "c" | "d";
  explanation: string | null;
  order_index: number;
};

export async function getQuizForStudent(studentId: string, lessonId: string) {
  const supabase = await createClient();
  const access = await getLessonAccess(studentId, lessonId);
  if (access.error) return access;

  const { data: questions, error } = await (supabase.from("quiz_questions") as any)
    .select("id,lesson_id,question_text,option_a,option_b,option_c,option_d,explanation,order_index")
    .eq("lesson_id", lessonId)
    .order("order_index", { ascending: true });

  if (error) return { error: error.message, status: 500 };

  const { data: attempts } = await (supabase.from("quiz_attempts") as any)
    .select("id,score,passed,attempt_number,submitted_at")
    .eq("lesson_id", lessonId)
    .eq("student_id", studentId)
    .order("submitted_at", { ascending: false });

  return {
    questions: questions ?? [],
    attempts: attempts ?? [],
    completed: access.lessonState?.completed ?? false,
  };
}

export async function submitQuizAttempt(params: {
  studentId: string;
  lessonId: string;
  answers: Record<string, "a" | "b" | "c" | "d">;
}) {
  const supabase = await createClient();
  const access = await getLessonAccess(params.studentId, params.lessonId);
  if (access.error) return access;

  const { data: questions, error } = await (supabase.from("quiz_questions") as any)
    .select("*")
    .eq("lesson_id", params.lessonId)
    .order("order_index", { ascending: true });

  if (error) return { error: error.message, status: 500 };

  const rows = (questions ?? []) as QuizQuestionRow[];
  if (rows.length === 0) {
    return { error: "This quiz has no questions yet.", status: 400 };
  }

  const correct = rows.filter(
    (question) => params.answers[question.id] === question.correct_option,
  ).length;
  const score = Math.round((correct / rows.length) * 100);

  const { count } = await (supabase.from("quiz_attempts") as any)
    .select("*", { count: "exact", head: true })
    .eq("student_id", params.studentId)
    .eq("lesson_id", params.lessonId);

  const { data: attempt, error: insertError } = await (supabase.from("quiz_attempts") as any)
    .insert({
      student_id: params.studentId,
      lesson_id: params.lessonId,
      answers: params.answers,
      score,
      attempt_number: (count ?? 0) + 1,
    })
    .select()
    .single();

  if (insertError) return { error: insertError.message, status: 500 };

  const passed = score === 100;
  const completion = passed
    ? await completeAssessmentLesson({
        studentId: params.studentId,
        lessonId: params.lessonId,
      })
    : null;

  return {
    attempt,
    passed,
    score,
    correct,
    total: rows.length,
    explanations: rows.map((question) => ({
      questionId: question.id,
      correctOption: question.correct_option,
      explanation: question.explanation,
      isCorrect: params.answers[question.id] === question.correct_option,
    })),
    nextLesson: completion && "nextLesson" in completion ? completion.nextLesson : null,
  };
}

async function getLessonAccess(studentId: string, lessonId: string) {
  const supabase = await createClient();
  const { data: lesson } = await (supabase.from("lessons") as any)
    .select("id,type,section:sections(course_id)")
    .eq("id", lessonId)
    .maybeSingle();

  if (!lesson?.section?.course_id || lesson.type !== "quiz") {
    return { error: "Quiz lesson not found", status: 404 };
  }

  const mastery = await getCourseMastery(lesson.section.course_id, studentId, lessonId);
  const lessonState = mastery?.lessons.find((item) => item.id === lessonId);

  if (!mastery?.enrollment) return { error: "Enrollment required", status: 403 };
  if (!lessonState) return { error: "Lesson not found", status: 404 };
  if (lessonState.locked) return { error: "Complete the previous lesson first", status: 423 };

  return { mastery, lessonState };
}

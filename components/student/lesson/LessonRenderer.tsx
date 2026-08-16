import { AudioLesson } from "@/components/student/lesson/AudioLesson";
import { PdfLesson } from "@/components/student/lesson/PdfLesson";
import { PracticalLesson } from "@/components/student/lesson/PracticalLesson";
import { QuizLesson } from "@/components/student/lesson/QuizLesson";
import { TextLesson } from "@/components/student/lesson/TextLesson";
import { VideoLesson } from "@/components/student/lesson/VideoLesson";
import { LessonCompleteButton } from "@/components/student/lesson/LessonCompleteButton";
import type { LessonState } from "@/lib/services/mastery.service";

export function LessonRenderer({ lesson }: { lesson: LessonState }) {
  if (lesson.type === "video") return <VideoLesson lesson={lesson} />;
  if (lesson.type === "audio") return <AudioLesson lesson={lesson} />;
  if (lesson.type === "pdf") return <PdfLesson lesson={lesson} />;
  if (lesson.type === "text") return <TextLesson lesson={lesson} />;
  if (lesson.type === "quiz") return <QuizLesson lesson={lesson} />;
  if (lesson.type === "practical" || lesson.type === "assignment") {
    return <PracticalLesson lesson={lesson} />;
  }

  return (
    <div className="space-y-6 rounded-lg border bg-white p-6">
      <div className="prose max-w-none" dir="auto">
        <p>{lesson.description ?? "This lesson is ready to complete."}</p>
      </div>
      <LessonCompleteButton lessonId={lesson.id} completed={lesson.completed} />
    </div>
  );
}

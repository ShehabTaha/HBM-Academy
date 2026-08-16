import { LessonCompleteButton } from "@/components/student/lesson/LessonCompleteButton";
import type { LessonState } from "@/lib/services/mastery.service";

export function PdfLesson({ lesson }: { lesson: LessonState }) {
  const url = lesson.content?.url || lesson.content?.pdfUrl || lesson.downloadable_file;

  return (
    <div className="space-y-6">
      <iframe
        src={url}
        title={lesson.title}
        className="h-[70vh] w-full rounded-lg border bg-white"
      />
      <div className="flex justify-end">
        <LessonCompleteButton lessonId={lesson.id} completed={lesson.completed} />
      </div>
    </div>
  );
}

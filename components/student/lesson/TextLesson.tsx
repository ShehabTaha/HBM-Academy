"use client";

import { useState } from "react";
import { LessonCompleteButton } from "@/components/student/lesson/LessonCompleteButton";
import type { LessonState } from "@/lib/services/mastery.service";

export function TextLesson({ lesson }: { lesson: LessonState }) {
  const [readToEnd, setReadToEnd] = useState(lesson.completed);
  const html = lesson.content?.html || lesson.content?.text || "";

  return (
    <div className="space-y-6">
      <article
        dir="auto"
        onScroll={(event) => {
          const target = event.currentTarget;
          const atBottom =
            target.scrollTop + target.clientHeight >= target.scrollHeight - 24;
          if (atBottom) setReadToEnd(true);
        }}
        className="prose max-h-[68vh] max-w-none overflow-y-auto rounded-lg border bg-white p-6"
        dangerouslySetInnerHTML={{ __html: html }}
      />
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-white p-4">
        <p className="text-sm text-muted-foreground">
          Read to the end, then mark this lesson complete.
        </p>
        {readToEnd ? (
          <LessonCompleteButton lessonId={lesson.id} completed={lesson.completed} />
        ) : null}
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { LessonCompleteButton } from "@/components/student/lesson/LessonCompleteButton";
import type { LessonState } from "@/lib/services/mastery.service";

export function AudioLesson({ lesson }: { lesson: LessonState }) {
  const [ended, setEnded] = useState(lesson.completed);
  const url = lesson.content?.url || lesson.content?.audioUrl || "";

  return (
    <div className="space-y-6">
      <div className="rounded-lg border bg-white p-6">
        <audio
          src={url}
          controls
          controlsList="nodownload"
          onEnded={() => setEnded(true)}
          onContextMenu={(event) => event.preventDefault()}
          className="w-full"
        />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-white p-4">
        <p className="text-sm text-muted-foreground">
          Listen to the end to unlock completion.
        </p>
        {ended ? (
          <LessonCompleteButton lessonId={lesson.id} completed={lesson.completed} />
        ) : null}
      </div>
    </div>
  );
}

"use client";

import { useRef, useState } from "react";
import { LessonCompleteButton } from "@/components/student/lesson/LessonCompleteButton";
import type { LessonState } from "@/lib/services/mastery.service";

export function VideoLesson({ lesson }: { lesson: LessonState }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [watched, setWatched] = useState(0);
  const url = lesson.content?.url || lesson.content?.videoUrl || "";
  const isReadyToComplete = watched >= 90 || lesson.completed;

  return (
    <div className="space-y-6">
      <video
        ref={videoRef}
        src={url}
        controls
        controlsList="nodownload"
        onContextMenu={(event) => event.preventDefault()}
        onTimeUpdate={(event) => {
          const target = event.currentTarget;
          if (target.duration) {
            setWatched(Math.round((target.currentTime / target.duration) * 100));
          }
        }}
        className="aspect-video w-full rounded-lg bg-black"
      />
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-white p-4">
        <p className="text-sm text-muted-foreground">
          Watch progress: {Math.min(watched, 100)}%
        </p>
        {isReadyToComplete ? (
          <LessonCompleteButton lessonId={lesson.id} completed={lesson.completed} />
        ) : (
          <p className="text-sm font-medium">Watch 90% to complete.</p>
        )}
      </div>
    </div>
  );
}

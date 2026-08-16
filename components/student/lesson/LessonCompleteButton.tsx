"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2 } from "lucide-react";

export function LessonCompleteButton({
  lessonId,
  completed,
}: {
  lessonId: string;
  completed?: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function completeLesson() {
    setLoading(true);
    setError(null);

    const response = await fetch(`/api/student/progress/${lessonId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_completed: true }),
    });

    const data = await response.json();
    setLoading(false);

    if (!response.ok) {
      setError(data.error ?? "Could not update progress.");
      return;
    }

    if (data.nextLesson?.id) {
      router.push(data.nextLesson.href ?? `./${data.nextLesson.id}`);
    }
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-2">
      <Button onClick={completeLesson} disabled={loading || completed}>
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <CheckCircle2 className="h-4 w-4" />
        )}
        {completed ? "Completed" : "Mark complete"}
      </Button>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}

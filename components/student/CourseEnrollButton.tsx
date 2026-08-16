"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export function CourseEnrollButton({
  courseId,
  firstLessonId,
  enrolled,
}: {
  courseId: string;
  firstLessonId?: string;
  enrolled?: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    if (enrolled) {
      router.push(`/courses/${courseId}/learn/${firstLessonId ?? ""}`);
      return;
    }

    setLoading(true);
    setError(null);
    const response = await fetch("/api/student/enroll", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseId }),
    });

    if (response.status === 401) {
      router.push(`/auth/login?redirect=/courses/${courseId}`);
      return;
    }

    const data = await response.json();
    setLoading(false);

    if (!response.ok) {
      setError(data.error ?? "Could not enroll in this course.");
      return;
    }

    router.push(`/courses/${courseId}/learn/${data.firstLessonId ?? firstLessonId ?? ""}`);
    router.refresh();
  }

  return (
    <div>
      <Button onClick={handleClick} disabled={loading || !firstLessonId} size="lg">
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        {enrolled ? "Resume course" : "Enroll free"}
      </Button>
      {error ? <p className="mt-2 text-sm text-destructive">{error}</p> : null}
    </div>
  );
}

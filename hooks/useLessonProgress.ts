"use client";

import { useState } from "react";

export function useLessonProgress(lessonId: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function markComplete() {
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
      return null;
    }

    return data;
  }

  return { markComplete, loading, error };
}

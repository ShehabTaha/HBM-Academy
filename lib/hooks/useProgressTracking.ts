"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/types/database.types";

type Progress = Database["public"]["Tables"]["progress"]["Row"];

/**
 * Hook to track real-time progress updates for an enrollment
 */
export function useProgressTracking(enrollmentId: string | null) {
  const [progress, setProgress] = useState<Progress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enrollmentId) {
      setLoading(false);
      return;
    }

    const supabase = createClient();

    // Fetch initial progress
    const fetchProgress = async () => {
      const { data, error } = await (supabase.from("progress") as any)
        .select("*")
        .eq("enrollment_id", enrollmentId);

      if (error) {
        setError(error.message);
      } else {
        setProgress(data || []);
      }
      setLoading(false);
    };

    fetchProgress();

    // Subscribe to real-time updates
    const channel = supabase
      .channel(`progress:${enrollmentId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "progress",
          filter: `enrollment_id=eq.${enrollmentId}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setProgress((prev) => [...prev, payload.new as Progress]);
          } else if (payload.eventType === "UPDATE") {
            setProgress((prev) =>
              prev.map((p) =>
                p.id === payload.new.id ? (payload.new as Progress) : p,
              ),
            );
          } else if (payload.eventType === "DELETE") {
            setProgress((prev) => prev.filter((p) => p.id !== payload.old.id));
          }
        },
      )
      .subscribe();

    // Cleanup subscription
    return () => {
      supabase.removeChannel(channel);
    };
  }, [enrollmentId]);

  return { progress, loading, error };
}

/**
 * Hook to track completion percentage with real-time updates
 */
export function useEnrollmentProgress(enrollmentId: string | null) {
  const [percentage, setPercentage] = useState(0);
  const [completedLessons, setCompletedLessons] = useState(0);
  const [totalLessons, setTotalLessons] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!enrollmentId) {
      setLoading(false);
      return;
    }

    const supabase = createClient();

    // Fetch enrollment with progress
    const fetchEnrollmentProgress = async () => {
      const { data: enrollmentRaw, error } = await (
        supabase.from("enrollments") as any
      )
        .select(
          `
          *,
          course:courses (
            sections (
              lessons (id)
            )
          )
        `,
        )
        .eq("id", enrollmentId)
        .single();

      if (error) {
        setLoading(false);
        return;
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const enrollment = enrollmentRaw as any;

      // Calculate total lessons
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const course = enrollment.course as any;
      const total = course.sections.reduce(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (sum: number, section: any) => sum + section.lessons.length,
        0,
      );
      setTotalLessons(total);

      // Get completed lessons count
      const { data: progressData } = await (supabase.from("progress") as any)
        .select("id")
        .eq("enrollment_id", enrollmentId)
        .eq("is_completed", true);

      const completed = progressData?.length || 0;
      setCompletedLessons(completed);
      setPercentage(total > 0 ? Math.round((completed / total) * 100) : 0);
      setLoading(false);
    };

    fetchEnrollmentProgress();

    // Subscribe to progress changes
    const channel = supabase
      .channel(`enrollment-progress:${enrollmentId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "progress",
          filter: `enrollment_id=eq.${enrollmentId}`,
        },
        async () => {
          // Recalculate on any progress change
          const { data: progressData } = await (
            supabase.from("progress") as any
          )
            .select("id")
            .eq("enrollment_id", enrollmentId)
            .eq("is_completed", true);

          const completed = progressData?.length || 0;
          setCompletedLessons(completed);
          setPercentage(
            totalLessons > 0 ? Math.round((completed / totalLessons) * 100) : 0,
          );
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "enrollments",
          filter: `id=eq.${enrollmentId}`,
        },
        (payload) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const newEnrollment = payload.new as any;
          setPercentage(newEnrollment.progress_percentage || 0);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [enrollmentId, totalLessons]);

  return {
    percentage,
    completedLessons,
    totalLessons,
    loading,
  };
}

/**
 * Hook to track individual lesson progress
 */
export function useLessonProgress(
  enrollmentId: string | null,
  lessonId: string | null,
) {
  const [progress, setProgress] = useState<Progress | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!enrollmentId || !lessonId) {
      setLoading(false);
      return;
    }

    const supabase = createClient();

    // Fetch initial progress
    const fetchProgress = async () => {
      const { data } = await (supabase.from("progress") as any)
        .select("*")
        .eq("enrollment_id", enrollmentId)
        .eq("lesson_id", lessonId)
        .single();

      setProgress(data || null);
      setLoading(false);
    };

    fetchProgress();

    // Subscribe to real-time updates
    const channel = supabase
      .channel(`lesson-progress:${enrollmentId}:${lessonId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "progress",
          filter: `enrollment_id=eq.${enrollmentId},lesson_id=eq.${lessonId}`,
        },
        (payload) => {
          if (
            payload.eventType === "INSERT" ||
            payload.eventType === "UPDATE"
          ) {
            setProgress(payload.new as Progress);
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [enrollmentId, lessonId]);

  return { progress, loading, isCompleted: progress?.is_completed || false };
}

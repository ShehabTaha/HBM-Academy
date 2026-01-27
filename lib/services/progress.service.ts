import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/types/database.types";
import { EnrollmentService } from "./enrollments.service";

type Progress = Database["public"]["Tables"]["progress"]["Row"];
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type ProgressInsert = Database["public"]["Tables"]["progress"]["Insert"];
type ProgressUpdate = Database["public"]["Tables"]["progress"]["Update"];

export interface UpdateProgressData {
  is_completed?: boolean;
  time_spent?: number;
  last_position?: number;
}

/**
 * Progress service for tracking student lesson completion
 */
export class ProgressService {
  /**
   * Mark a lesson as complete
   */
  static async markLessonComplete(
    enrollmentId: string,
    lessonId: string,
  ): Promise<{ progress?: Progress; error?: string }> {
    try {
      const supabase = createClient();

      // Check if progress record exists
      const { data: existing } = await (supabase.from("progress") as any)
        .select("*")
        .eq("enrollment_id", enrollmentId)
        .eq("lesson_id", lessonId)
        .single();

      if (existing) {
        // Update existing progress
        const { data: progressRaw, error } = await (
          supabase.from("progress") as any
        )
          .update({
            is_completed: true,
            completed_at: new Date().toISOString(),
          })
          .eq("id", existing.id)
          .select()
          .single();

        if (error) {
          return { error: error.message };
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const progress = progressRaw as any;

        // Update enrollment progress percentage
        await this.calculateCourseProgress(enrollmentId);

        return { progress };
      } else {
        // Create new progress record
        const { data: progressRaw, error } = await (
          supabase.from("progress") as any
        )
          .insert({
            enrollment_id: enrollmentId,
            lesson_id: lessonId,
            is_completed: true,
            completed_at: new Date().toISOString(),
            time_spent: 0,
            last_position: 0,
          })
          .select()
          .single();

        if (error) {
          return { error: error.message };
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const progress = progressRaw as any;

        // Update enrollment progress percentage
        await this.calculateCourseProgress(enrollmentId);

        return { progress };
      }
    } catch (error) {
      return {
        error:
          error instanceof Error
            ? error.message
            : "Failed to mark lesson complete",
      };
    }
  }

  /**
   * Update lesson progress
   */
  static async updateLessonProgress(
    enrollmentId: string,
    lessonId: string,
    data: UpdateProgressData,
  ): Promise<{ progress?: Progress; error?: string }> {
    try {
      const supabase = createClient();

      // Check if progress record exists
      const { data: existing } = await (supabase.from("progress") as any)
        .select("*")
        .eq("enrollment_id", enrollmentId)
        .eq("lesson_id", lessonId)
        .single();

      if (existing) {
        // Update existing progress
        const updateData: ProgressUpdate = { ...data };

        if (data.is_completed) {
          updateData.completed_at = new Date().toISOString();
        }

        const { data: progressRaw, error } = await (
          supabase.from("progress") as any
        )
          .update(updateData)
          .eq("id", existing.id)
          .select()
          .single();

        if (error) {
          return { error: error.message };
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const progress = progressRaw as any;

        return { progress };
      } else {
        // Create new progress record
        const { data: progressRaw, error } = await (
          supabase.from("progress") as any
        )
          .insert({
            enrollment_id: enrollmentId,
            lesson_id: lessonId,
            is_completed: data.is_completed || false,
            completed_at: data.is_completed ? new Date().toISOString() : null,
            time_spent: data.time_spent || 0,
            last_position: data.last_position || 0,
          })
          .select()
          .single();

        if (error) {
          return { error: error.message };
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const progress = progressRaw as any;

        return { progress };
      }
    } catch (error) {
      return {
        error:
          error instanceof Error ? error.message : "Failed to update progress",
      };
    }
  }

  /**
   * Get progress for an enrollment
   */
  static async getEnrollmentProgress(enrollmentId: string): Promise<{
    progress: Progress[];
    error?: string;
  }> {
    try {
      const supabase = createClient();

      const { data: progressRaw, error } = await (
        supabase.from("progress") as any
      )
        .select("*")
        .eq("enrollment_id", enrollmentId);

      if (error) {
        return { progress: [], error: error.message };
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const progress = (progressRaw as any[]) || [];

      return { progress };
    } catch (error) {
      return {
        progress: [],
        error:
          error instanceof Error ? error.message : "Failed to fetch progress",
      };
    }
  }

  /**
   * Calculate and update course progress percentage
   */
  static async calculateCourseProgress(enrollmentId: string): Promise<{
    percentage: number;
    error?: string;
  }> {
    try {
      const supabase = createClient();

      // Get enrollment with course
      const { data: enrollmentRaw, error: enrollmentError } = await (
        supabase.from("enrollments") as any
      )
        .select(
          `
          *,
          course:courses (
            id,
            sections (
              id,
              lessons (id)
            )
          )
        `,
        )
        .eq("id", enrollmentId)
        .single();

      if (enrollmentError) {
        return { percentage: 0, error: enrollmentError.message };
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const enrollment = enrollmentRaw as any;

      // Count total lessons
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const course = enrollment.course as any;
      const totalLessons = course.sections.reduce(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (total: number, section: any) => total + section.lessons.length,
        0,
      );

      if (totalLessons === 0) {
        return { percentage: 0 };
      }

      // Get completed lessons
      const { data: completedProgress, error: progressError } = await (
        supabase.from("progress") as any
      )
        .select("id")
        .eq("enrollment_id", enrollmentId)
        .eq("is_completed", true);

      if (progressError) {
        return { percentage: 0, error: progressError.message };
      }

      const completedLessons = completedProgress?.length || 0;
      const percentage = Math.round((completedLessons / totalLessons) * 100);

      // Update enrollment
      await EnrollmentService.updateProgress(enrollmentId, percentage);

      return { percentage };
    } catch (error) {
      return {
        percentage: 0,
        error:
          error instanceof Error
            ? error.message
            : "Failed to calculate progress",
      };
    }
  }

  /**
   * Update video/audio playback position
   */
  static async updateLastPosition(
    enrollmentId: string,
    lessonId: string,
    position: number,
  ): Promise<{ progress?: Progress; error?: string }> {
    return await this.updateLessonProgress(enrollmentId, lessonId, {
      last_position: position,
    });
  }

  /**
   * Get lesson progress
   */
  static async getLessonProgress(
    enrollmentId: string,
    lessonId: string,
  ): Promise<{ progress?: Progress; error?: string }> {
    try {
      const supabase = createClient();

      const { data: progressRaw, error } = await (
        supabase.from("progress") as any
      )
        .select("*")
        .eq("enrollment_id", enrollmentId)
        .eq("lesson_id", lessonId)
        .single();

      if (error && error.code !== "PGRST116") {
        return { error: error.message };
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const progress = progressRaw as any;

      return { progress: progress || undefined };
    } catch (error) {
      return {
        error:
          error instanceof Error ? error.message : "Failed to fetch progress",
      };
    }
  }

  /**
   * Check if lesson is completed
   */
  static async isLessonCompleted(
    enrollmentId: string,
    lessonId: string,
  ): Promise<boolean> {
    const { progress } = await this.getLessonProgress(enrollmentId, lessonId);
    return progress?.is_completed || false;
  }

  /**
   * Get course completion stats
   */
  static async getCourseCompletionStats(enrollmentId: string): Promise<{
    total: number;
    completed: number;
    percentage: number;
    error?: string;
  }> {
    try {
      const supabase = createClient();

      // Get enrollment with course
      const { data: enrollmentRaw, error: enrollmentError } = await (
        supabase.from("enrollments") as any
      )
        .select(
          `
          *,
          course:courses (
            id,
            sections (
              id,
              lessons (id)
            )
          )
        `,
        )
        .eq("id", enrollmentId)
        .single();

      if (enrollmentError) {
        return {
          total: 0,
          completed: 0,
          percentage: 0,
          error: enrollmentError.message,
        };
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const enrollment = enrollmentRaw as any;

      // Count total lessons
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const course = enrollment.course as any;
      const totalLessons = course.sections.reduce(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (total: number, section: any) => total + section.lessons.length,
        0,
      );

      // Get completed lessons
      const { data: completedProgress } = await (
        supabase.from("progress") as any
      )
        .select("id")
        .eq("enrollment_id", enrollmentId)
        .eq("is_completed", true);

      const completedLessons = completedProgress?.length || 0;
      const percentage =
        totalLessons > 0
          ? Math.round((completedLessons / totalLessons) * 100)
          : 0;

      return {
        total: totalLessons,
        completed: completedLessons,
        percentage,
      };
    } catch (error) {
      return {
        total: 0,
        completed: 0,
        percentage: 0,
        error: error instanceof Error ? error.message : "Failed to get stats",
      };
    }
  }
}

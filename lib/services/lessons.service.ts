import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/types/database.types";

type Lesson = Database["public"]["Tables"]["lessons"]["Row"];
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type LessonInsert = Database["public"]["Tables"]["lessons"]["Insert"];
type LessonUpdate = Database["public"]["Tables"]["lessons"]["Update"];
type LessonType = Database["public"]["Enums"]["lesson_type"];

export interface CreateLessonData {
  section_id: string;
  title: string;
  type: LessonType;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  content: any; // JSON content (video URL, HTML, quiz data, etc.)
  description?: string;
  downloadable_file?: string;
  order: number;
  duration?: number;
  is_free_preview?: boolean;
  is_prerequisite?: boolean;
  enable_discussions?: boolean;
  is_downloadable?: boolean;
}

export interface UpdateLessonData {
  title?: string;
  type?: LessonType;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  content?: any;
  description?: string;
  downloadable_file?: string;
  order?: number;
  duration?: number;
  is_free_preview?: boolean;
  is_prerequisite?: boolean;
  enable_discussions?: boolean;
  is_downloadable?: boolean;
}

/**
 * Lesson service for managing lesson operations
 */
export class LessonService {
  /**
   * Create a new lesson
   */
  static async createLesson(
    data: CreateLessonData,
  ): Promise<{ lesson?: Lesson; error?: string }> {
    try {
      const supabase = createClient();

      const { data: lessonRaw, error } = await (supabase.from("lessons") as any)
        .insert({
          ...data,
          duration: data.duration || 0,
          is_free_preview: data.is_free_preview || false,
          is_prerequisite: data.is_prerequisite || false,
          enable_discussions: data.enable_discussions !== false,
          is_downloadable: data.is_downloadable || false,
        })
        .select()
        .single();

      if (error) {
        return { error: error.message };
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const lesson = lessonRaw as any;

      return { lesson };
    } catch (error) {
      return {
        error:
          error instanceof Error ? error.message : "Failed to create lesson",
      };
    }
  }

  /**
   * Get lesson by ID
   */
  static async getLessonById(
    id: string,
  ): Promise<{ lesson?: Lesson; error?: string }> {
    try {
      const supabase = createClient();

      const { data: lessonRaw, error } = await (supabase.from("lessons") as any)
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        return { error: error.message };
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const lesson = lessonRaw as any;

      return { lesson };
    } catch (error) {
      return {
        error:
          error instanceof Error ? error.message : "Failed to fetch lesson",
      };
    }
  }

  /**
   * Get lessons by section
   */
  static async getLessonsBySection(sectionId: string): Promise<{
    lessons: Lesson[];
    error?: string;
  }> {
    try {
      const supabase = createClient();

      const { data: lessonsRaw, error } = await (
        supabase.from("lessons") as any
      )
        .select("*")
        .eq("section_id", sectionId)
        .order("order", { ascending: true });

      if (error) {
        return { lessons: [], error: error.message };
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const lessons = (lessonsRaw as any[]) || [];

      return { lessons };
    } catch (error) {
      return {
        lessons: [],
        error:
          error instanceof Error ? error.message : "Failed to fetch lessons",
      };
    }
  }

  /**
   * Update lesson
   */
  static async updateLesson(
    id: string,
    data: UpdateLessonData,
  ): Promise<{ lesson?: Lesson; error?: string }> {
    try {
      const supabase = createClient();

      const { data: lessonRaw, error } = await (supabase.from("lessons") as any)
        .update(data)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        return { error: error.message };
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const lesson = lessonRaw as any;

      return { lesson };
    } catch (error) {
      return {
        error:
          error instanceof Error ? error.message : "Failed to update lesson",
      };
    }
  }

  /**
   * Delete lesson
   */
  static async deleteLesson(
    id: string,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const supabase = createClient();

      const { error } = await (supabase.from("lessons") as any)
        .delete()
        .eq("id", id);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to delete lesson",
      };
    }
  }

  /**
   * Reorder lessons within a section
   */
  static async reorderLessons(
    sectionId: string,
    lessonIds: string[],
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const supabase = createClient();

      // Update each lesson's order
      const updates = lessonIds.map((id, index) =>
        (supabase.from("lessons") as any).update({ order: index }).eq("id", id),
      );

      await Promise.all(updates);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to reorder lessons",
      };
    }
  }

  /**
   * Update lesson video URL
   */
  static async updateLessonVideo(
    id: string,
    videoUrl: string,
  ): Promise<{ lesson?: Lesson; error?: string }> {
    return await this.updateLesson(id, { content: { url: videoUrl } });
  }

  /**
   * Update lesson audio URL
   */
  static async updateLessonAudio(
    id: string,
    audioUrl: string,
  ): Promise<{ lesson?: Lesson; error?: string }> {
    return await this.updateLesson(id, { content: { url: audioUrl } });
  }

  /**
   * Update lesson PDF URL
   */
  static async updateLessonPdf(
    id: string,
    pdfUrl: string,
  ): Promise<{ lesson?: Lesson; error?: string }> {
    return await this.updateLesson(id, { content: { url: pdfUrl } });
  }

  /**
   * Update lesson downloadable file
   */
  static async updateDownloadableFile(
    id: string,
    fileUrl: string,
  ): Promise<{ lesson?: Lesson; error?: string }> {
    return await this.updateLesson(id, { downloadable_file: fileUrl });
  }

  /**
   * Update quiz/survey questions
   */
  static async updateQuizContent(
    id: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    questions: any[],
  ): Promise<{ lesson?: Lesson; error?: string }> {
    return await this.updateLesson(id, { content: questions });
  }

  /**
   * Get next lesson in sequence
   */
  static async getNextLesson(currentLessonId: string): Promise<{
    lesson?: Lesson;
    error?: string;
  }> {
    try {
      const supabase = createClient();

      // Get current lesson
      const { lesson: currentLesson, error: currentError } =
        await this.getLessonById(currentLessonId);

      if (currentError || !currentLesson) {
        return { error: currentError || "Lesson not found" };
      }

      // Get next lesson in the same section
      const { data: nextLesson, error } = await (
        supabase.from("lessons") as any
      )
        .select("*")
        .eq("section_id", currentLesson.section_id)
        .gt("order", currentLesson.order)
        .order("order", { ascending: true })
        .limit(1)
        .single();

      if (error && error.code !== "PGRST116") {
        // PGRST116 = no rows returned
        return { error: error.message };
      }

      return { lesson: nextLesson || undefined };
    } catch (error) {
      return {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch next lesson",
      };
    }
  }

  /**
   * Get previous lesson in sequence
   */
  static async getPreviousLesson(currentLessonId: string): Promise<{
    lesson?: Lesson;
    error?: string;
  }> {
    try {
      const supabase = createClient();

      // Get current lesson
      const { lesson: currentLesson, error: currentError } =
        await this.getLessonById(currentLessonId);

      if (currentError || !currentLesson) {
        return { error: currentError || "Lesson not found" };
      }

      // Get previous lesson in the same section
      const { data: prevLesson, error } = await (
        supabase.from("lessons") as any
      )
        .select("*")
        .eq("section_id", currentLesson.section_id)
        .lt("order", currentLesson.order)
        .order("order", { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== "PGRST116") {
        return { error: error.message };
      }

      return { lesson: prevLesson || undefined };
    } catch (error) {
      return {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch previous lesson",
      };
    }
  }
}

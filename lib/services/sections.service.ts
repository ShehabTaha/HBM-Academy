import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/types/database.types";

type Section = Database["public"]["Tables"]["sections"]["Row"];
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type SectionInsert = Database["public"]["Tables"]["sections"]["Insert"];
type SectionUpdate = Database["public"]["Tables"]["sections"]["Update"];

export interface CreateSectionData {
  course_id: string;
  title: string;
  order: number;
}

export interface UpdateSectionData {
  title?: string;
  order?: number;
}

/**
 * Section service for managing course sections/chapters
 */
export class SectionService {
  /**
   * Create a new section
   */
  static async createSection(
    data: CreateSectionData,
  ): Promise<{ section?: Section; error?: string }> {
    try {
      const supabase = createClient();

      const { data: sectionRaw, error } = await (
        supabase.from("sections") as any
      )
        .insert(data)
        .select()
        .single();

      if (error) {
        return { error: error.message };
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const section = sectionRaw as any;

      return { section };
    } catch (error) {
      return {
        error:
          error instanceof Error ? error.message : "Failed to create section",
      };
    }
  }

  /**
   * Update section
   */
  static async updateSection(
    id: string,
    data: UpdateSectionData,
  ): Promise<{ section?: Section; error?: string }> {
    try {
      const supabase = createClient();

      const { data: sectionRaw, error } = await (
        supabase.from("sections") as any
      )
        .update(data)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        return { error: error.message };
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const section = sectionRaw as any;

      return { section };
    } catch (error) {
      return {
        error:
          error instanceof Error ? error.message : "Failed to update section",
      };
    }
  }

  /**
   * Delete section
   */
  static async deleteSection(
    id: string,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const supabase = createClient();

      const { error } = await (supabase.from("sections") as any)
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
          error instanceof Error ? error.message : "Failed to delete section",
      };
    }
  }

  /**
   * Reorder sections
   */
  static async reorderSections(
    courseId: string,
    sectionIds: string[],
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const supabase = createClient();

      // Update each section's order
      const updates = sectionIds.map((id, index) =>
        (supabase.from("sections") as any)
          .update({ order: index })
          .eq("id", id),
      );

      await Promise.all(updates);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to reorder sections",
      };
    }
  }
}

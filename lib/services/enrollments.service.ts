import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/types/database.types";

type Enrollment = Database["public"]["Tables"]["enrollments"]["Row"];
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type EnrollmentInsert = Database["public"]["Tables"]["enrollments"]["Insert"];
type EnrollmentUpdate = Database["public"]["Tables"]["enrollments"]["Update"];

/**
 * Enrollment service for managing student course enrollments
 */
export class EnrollmentService {
  /**
   * Enroll a student in a course
   */
  static async enrollStudent(
    studentId: string,
    courseId: string,
  ): Promise<{ enrollment?: Enrollment; error?: string }> {
    try {
      const supabase = createClient();

      // Check if already enrolled
      const { data: existing } = await (supabase.from("enrollments") as any)
        .select("id")
        .eq("student_id", studentId)
        .eq("course_id", courseId)
        .single();

      if (existing) {
        return { error: "Student is already enrolled in this course" };
      }

      // Create enrollment
      const { data: enrollmentRaw, error } = await (
        supabase.from("enrollments") as any
      )
        .insert({
          student_id: studentId,
          course_id: courseId,
          progress_percentage: 0,
        })
        .select()
        .single();

      if (error) {
        return { error: error.message };
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const enrollment = enrollmentRaw as any;

      return { enrollment };
    } catch (error) {
      return {
        error:
          error instanceof Error ? error.message : "Failed to enroll student",
      };
    }
  }

  /**
   * Get enrollment by student and course
   */
  static async getEnrollment(
    studentId: string,
    courseId: string,
  ): Promise<{ enrollment?: Enrollment; error?: string }> {
    try {
      const supabase = createClient();

      const { data: enrollmentRaw, error } = await (
        supabase.from("enrollments") as any
      )
        .select("*")
        .eq("student_id", studentId)
        .eq("course_id", courseId)
        .single();

      if (error) {
        return { error: error.message };
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const enrollment = enrollmentRaw as any;

      return { enrollment };
    } catch (error) {
      return {
        error:
          error instanceof Error ? error.message : "Failed to fetch enrollment",
      };
    }
  }

  /**
   * Get all enrollments for a student
   */
  static async getStudentEnrollments(studentId: string): Promise<{
    enrollments: Enrollment[];
    error?: string;
  }> {
    try {
      const supabase = createClient();

      const { data: enrollmentsRaw, error } = await (
        supabase.from("enrollments") as any
      )
        .select("*")
        .eq("student_id", studentId)
        .order("enrolled_at", { ascending: false });

      if (error) {
        return { enrollments: [], error: error.message };
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const enrollments = (enrollmentsRaw as any[]) || [];

      return { enrollments };
    } catch (error) {
      return {
        enrollments: [],
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch enrollments",
      };
    }
  }

  /**
   * Get all enrollments for a course
   */
  static async getCourseEnrollments(courseId: string): Promise<{
    enrollments: Enrollment[];
    error?: string;
  }> {
    try {
      const supabase = createClient();

      const { data: enrollmentsRaw, error } = await (
        supabase.from("enrollments") as any
      )
        .select("*")
        .eq("course_id", courseId)
        .order("enrolled_at", { ascending: false });

      if (error) {
        return { enrollments: [], error: error.message };
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const enrollments = (enrollmentsRaw as any[]) || [];

      return { enrollments };
    } catch (error) {
      return {
        enrollments: [],
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch enrollments",
      };
    }
  }

  /**
   * Unenroll a student from a course
   */
  static async unenrollStudent(enrollmentId: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      const supabase = createClient();

      const { error } = await (supabase.from("enrollments") as any)
        .delete()
        .eq("id", enrollmentId);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to unenroll student",
      };
    }
  }

  /**
   * Check if a student is enrolled in a course
   */
  static async checkEnrollment(
    studentId: string,
    courseId: string,
  ): Promise<{ enrolled: boolean; enrollment?: Enrollment }> {
    const { enrollment, error } = await this.getEnrollment(studentId, courseId);
    return {
      enrolled: !error && !!enrollment,
      enrollment,
    };
  }

  /**
   * Update enrollment progress
   */
  static async updateProgress(
    enrollmentId: string,
    progressPercentage: number,
  ): Promise<{ enrollment?: Enrollment; error?: string }> {
    try {
      const supabase = createClient();

      const updateData: EnrollmentUpdate = {
        progress_percentage: Math.min(100, Math.max(0, progressPercentage)),
      };

      // Mark as completed if 100%
      if (progressPercentage >= 100) {
        updateData.completed_at = new Date().toISOString();
      }

      const { data: enrollmentRaw, error } = await (
        supabase.from("enrollments") as any
      )
        .update(updateData)
        .eq("id", enrollmentId)
        .select()
        .single();

      if (error) {
        return { error: error.message };
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const enrollment = enrollmentRaw as any;

      return { enrollment };
    } catch (error) {
      return {
        error:
          error instanceof Error ? error.message : "Failed to update progress",
      };
    }
  }

  /**
   * Get enrollment with course details
   */
  static async getEnrollmentWithCourse(enrollmentId: string): Promise<{
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    enrollment?: Enrollment & { course: any };
    error?: string;
  }> {
    try {
      const supabase = createClient();

      const { data, error } = await (supabase.from("enrollments") as any)
        .select(
          `
          *,
          course:courses (*)
        `,
        )
        .eq("id", enrollmentId)
        .single();

      if (error) {
        return { error: error.message };
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return { enrollment: data as any };
    } catch (error) {
      return {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch enrollment with course",
      };
    }
  }
}

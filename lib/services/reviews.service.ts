import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/types/database.types";

type Review = Database["public"]["Tables"]["reviews"]["Row"];
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type ReviewInsert = Database["public"]["Tables"]["reviews"]["Insert"];
type ReviewUpdate = Database["public"]["Tables"]["reviews"]["Update"];

export interface CreateReviewData {
  course_id: string;
  student_id: string;
  rating: number;
  comment?: string;
}

export interface UpdateReviewData {
  rating?: number;
  comment?: string;
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
}

/**
 * Review service for managing course reviews and ratings
 */
export class ReviewService {
  /**
   * Create a review
   */
  static async createReview(
    data: CreateReviewData,
  ): Promise<{ review?: Review; error?: string }> {
    try {
      const supabase = createClient();

      // Validate rating
      if (data.rating < 1 || data.rating > 5) {
        return { error: "Rating must be between 1 and 5" };
      }

      // Check if review already exists
      const { data: existing } = await (supabase.from("reviews") as any)
        .select("id")
        .eq("course_id", data.course_id)
        .eq("student_id", data.student_id)
        .single();

      if (existing) {
        return { error: "You have already reviewed this course" };
      }

      // Create review
      const { data: reviewRaw, error } = await (supabase.from("reviews") as any)
        .insert(data)
        .select()
        .single();

      if (error) {
        return { error: error.message };
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const review = reviewRaw as any;

      return { review };
    } catch (error) {
      return {
        error:
          error instanceof Error ? error.message : "Failed to create review",
      };
    }
  }

  /**
   * Get review by ID
   */
  static async getReview(
    id: string,
  ): Promise<{ review?: Review; error?: string }> {
    try {
      const supabase = createClient();

      const { data: reviewRaw, error } = await (supabase.from("reviews") as any)
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        return { error: error.message };
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const review = reviewRaw as any;

      return { review };
    } catch (error) {
      return {
        error:
          error instanceof Error ? error.message : "Failed to fetch review",
      };
    }
  }

  /**
   * Get reviews for a course
   */
  static async getCourseReviews(
    courseId: string,
    pagination?: PaginationOptions,
  ): Promise<{ reviews: Review[]; total: number; error?: string }> {
    try {
      const supabase = createClient();
      const page = pagination?.page || 1;
      const limit = pagination?.limit || 20;
      const offset = (page - 1) * limit;

      const {
        data: reviewsRaw,
        count,
        error,
      } = await (supabase.from("reviews") as any)
        .select("*", { count: "exact" })
        .eq("course_id", courseId)
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        return { reviews: [], total: 0, error: error.message };
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const reviews = (reviewsRaw as any[]) || [];

      return { reviews, total: count || 0 };
    } catch (error) {
      return {
        reviews: [],
        total: 0,
        error:
          error instanceof Error ? error.message : "Failed to fetch reviews",
      };
    }
  }

  /**
   * Get user's review for a course
   */
  static async getUserReview(
    courseId: string,
    studentId: string,
  ): Promise<{ review?: Review; error?: string }> {
    try {
      const supabase = createClient();

      const { data: reviewRaw, error } = await (supabase.from("reviews") as any)
        .select("*")
        .eq("course_id", courseId)
        .eq("student_id", studentId)
        .single();

      if (error && error.code !== "PGRST116") {
        // PGRST116 = no rows returned
        return { error: error.message };
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const review = reviewRaw as any;

      return { review: review || undefined };
    } catch (error) {
      return {
        error:
          error instanceof Error ? error.message : "Failed to fetch review",
      };
    }
  }

  /**
   * Update review
   */
  static async updateReview(
    id: string,
    data: UpdateReviewData,
  ): Promise<{ review?: Review; error?: string }> {
    try {
      const supabase = createClient();

      // Validate rating if provided
      if (data.rating && (data.rating < 1 || data.rating > 5)) {
        return { error: "Rating must be between 1 and 5" };
      }

      const { data: reviewRaw, error } = await (supabase.from("reviews") as any)
        .update(data)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        return { error: error.message };
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const review = reviewRaw as any;

      return { review };
    } catch (error) {
      return {
        error:
          error instanceof Error ? error.message : "Failed to update review",
      };
    }
  }

  /**
   * Delete review
   */
  static async deleteReview(
    id: string,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const supabase = createClient();

      const { error } = await (supabase.from("reviews") as any)
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
          error instanceof Error ? error.message : "Failed to delete review",
      };
    }
  }

  /**
   * Get average rating for a course
   */
  static async getAverageRating(courseId: string): Promise<{
    average: number;
    count: number;
    error?: string;
  }> {
    try {
      const supabase = createClient();

      const { data: reviews, error } = await (supabase.from("reviews") as any)
        .select("rating")
        .eq("course_id", courseId);

      if (error) {
        return { average: 0, count: 0, error: error.message };
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const reviewsList = (reviews as any[]) || [];

      if (!reviewsList || reviewsList.length === 0) {
        return { average: 0, count: 0 };
      }

      const sum = reviewsList.reduce(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (acc: number, review: any) => acc + review.rating,
        0,
      );
      const average = sum / reviewsList.length;

      return {
        average: Math.round(average * 10) / 10, // Round to 1 decimal place
        count: reviewsList.length,
      };
    } catch (error) {
      return {
        average: 0,
        count: 0,
        error:
          error instanceof Error ? error.message : "Failed to calculate rating",
      };
    }
  }

  /**
   * Get rating distribution for a course
   */
  static async getRatingDistribution(courseId: string): Promise<{
    distribution: { [key: number]: number };
    error?: string;
  }> {
    try {
      const supabase = createClient();

      const { data: reviews, error } = await (supabase.from("reviews") as any)
        .select("rating")
        .eq("course_id", courseId);

      if (error) {
        return { distribution: {}, error: error.message };
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const reviewsList = (reviews as any[]) || [];

      const distribution: { [key: number]: number } = {
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0,
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      reviewsList?.forEach((review: any) => {
        distribution[review.rating] = (distribution[review.rating] || 0) + 1;
      });

      return { distribution };
    } catch (error) {
      return {
        distribution: {},
        error:
          error instanceof Error ? error.message : "Failed to get distribution",
      };
    }
  }

  /**
   * Get reviews with user information
   */
  static async getCourseReviewsWithUsers(
    courseId: string,
    pagination?: PaginationOptions,
  ): Promise<{
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    reviews: Array<Review & { student: any }>;
    total: number;
    error?: string;
  }> {
    try {
      const supabase = createClient();
      const page = pagination?.page || 1;
      const limit = pagination?.limit || 20;
      const offset = (page - 1) * limit;

      const { data, count, error } = await (supabase.from("reviews") as any)
        .select(
          `
          *,
          student:users (
            id,
            name,
            avatar
          )
        `,
          { count: "exact" },
        )
        .eq("course_id", courseId)
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        return { reviews: [], total: 0, error: error.message };
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return { reviews: (data as any) || [], total: count || 0 };
    } catch (error) {
      return {
        reviews: [],
        total: 0,
        error:
          error instanceof Error ? error.message : "Failed to fetch reviews",
      };
    }
  }
}

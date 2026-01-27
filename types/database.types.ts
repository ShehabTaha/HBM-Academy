/**
 * Database types for Supabase
 * These types will be auto-generated from your Supabase schema
 * For now, we define them manually based on our schema design
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type LessonType =
  | "video"
  | "text"
  | "pdf"
  | "audio"
  | "quiz"
  | "survey"
  | "assignment";
export type UserRole = "student" | "lecturer" | "admin";
export type CourseLevel = "beginner" | "intermediate" | "advanced";

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string;
          password: string;
          role: UserRole;
          avatar: string | null;
          bio: string | null;
          is_email_verified: boolean;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          email: string;
          name: string;
          password: string;
          role?: UserRole;
          avatar?: string | null;
          bio?: string | null;
          is_email_verified?: boolean;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          password?: string;
          role?: UserRole;
          avatar?: string | null;
          bio?: string | null;
          is_email_verified?: boolean;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
      };
      courses: {
        Row: {
          id: string;
          title: string;
          slug: string;
          description: string;
          image: string | null;
          instructor_id: string;
          category: string | null;
          level: CourseLevel | null;
          price: number;
          is_published: boolean;
          duration: number;

          payment_type: string; // 'one-time' | 'subscription' | 'installment'
          recurring_interval: string | null; // 'month' | 'year'
          recurring_price: number | null;
          installment_count: number | null;
          landing_page_settings: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          slug: string;
          description: string;
          image?: string | null;
          instructor_id: string;
          category?: string | null;
          level?: CourseLevel | null;
          price?: number;
          is_published?: boolean;
          duration?: number;

          payment_type?: string;
          recurring_interval?: string | null;
          recurring_price?: number | null;
          installment_count?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          slug?: string;
          description?: string;
          image?: string | null;
          instructor_id?: string;
          category?: string | null;
          level?: CourseLevel | null;
          price?: number;
          is_published?: boolean;
          duration?: number;

          payment_type?: string;
          recurring_interval?: string | null;
          recurring_price?: number | null;
          installment_count?: number | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      sections: {
        Row: {
          id: string;
          course_id: string;
          title: string;
          order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          course_id: string;
          title: string;
          order: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          course_id?: string;
          title?: string;
          order?: number;
          created_at?: string;
        };
      };
      lessons: {
        Row: {
          id: string;
          section_id: string;
          title: string;
          type: LessonType;
          content: Json;
          description: string | null;
          downloadable_file: string | null;
          order: number;
          duration: number;
          is_free_preview: boolean;
          is_prerequisite: boolean;
          enable_discussions: boolean;
          is_downloadable: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          section_id: string;
          title: string;
          type: LessonType;
          content: Json;
          description?: string | null;
          downloadable_file?: string | null;
          order: number;
          duration?: number;
          is_free_preview?: boolean;
          is_prerequisite?: boolean;
          enable_discussions?: boolean;
          is_downloadable?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          section_id?: string;
          title?: string;
          type?: LessonType;
          content?: Json;
          description?: string | null;
          downloadable_file?: string | null;
          order?: number;
          duration?: number;
          is_free_preview?: boolean;
          is_prerequisite?: boolean;
          enable_discussions?: boolean;
          is_downloadable?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      enrollments: {
        Row: {
          id: string;
          student_id: string;
          course_id: string;
          enrolled_at: string;
          completed_at: string | null;
          progress_percentage: number;
        };
        Insert: {
          id?: string;
          student_id: string;
          course_id: string;
          enrolled_at?: string;
          completed_at?: string | null;
          progress_percentage?: number;
        };
        Update: {
          id?: string;
          student_id?: string;
          course_id?: string;
          enrolled_at?: string;
          completed_at?: string | null;
          progress_percentage?: number;
        };
      };
      progress: {
        Row: {
          id: string;
          enrollment_id: string;
          lesson_id: string;
          is_completed: boolean;
          completed_at: string | null;
          time_spent: number;
          last_position: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          enrollment_id: string;
          lesson_id: string;
          is_completed?: boolean;
          completed_at?: string | null;
          time_spent?: number;
          last_position?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          enrollment_id?: string;
          lesson_id?: string;
          is_completed?: boolean;
          completed_at?: string | null;
          time_spent?: number;
          last_position?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      reviews: {
        Row: {
          id: string;
          course_id: string;
          student_id: string;
          rating: number;
          comment: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          course_id: string;
          student_id: string;
          rating: number;
          comment?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          course_id?: string;
          student_id?: string;
          rating?: number;
          comment?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      certificates: {
        Row: {
          id: string;
          enrollment_id: string;
          certificate_number: string;
          issued_at: string;
          certificate_url: string | null;
        };
        Insert: {
          id?: string;
          enrollment_id: string;
          certificate_number: string;
          issued_at?: string;
          certificate_url?: string | null;
        };
        Update: {
          id?: string;
          enrollment_id?: string;
          certificate_number?: string;
          issued_at?: string;
          certificate_url?: string | null;
        };
      };
      videos: {
        Row: {
          id: string;
          instructor_id: string;
          title: string;
          description: string | null;
          duration: number;
          file_size: number;
          file_url: string;
          thumbnail_url: string | null;
          upload_date: string;
          is_public: boolean;
          tags: string[] | null;
          usage_count: number;
          metadata: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          instructor_id: string;
          title: string;
          description?: string | null;
          duration: number;
          file_size: number;
          file_url: string;
          thumbnail_url?: string | null;
          upload_date?: string;
          is_public?: boolean;
          tags?: string[] | null;
          usage_count?: number;
          metadata?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          instructor_id?: string;
          title?: string;
          description?: string | null;
          duration?: number;
          file_size?: number;
          file_url?: string;
          thumbnail_url?: string | null;
          upload_date?: string;
          is_public?: boolean;
          tags?: string[] | null;
          usage_count?: number;
          metadata?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      lesson_videos: {
        Row: {
          id: string;
          lesson_id: string;
          video_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          lesson_id: string;
          video_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          lesson_id?: string;
          video_id?: string;
          created_at?: string;
        };
      };
      user_profiles: {
        Row: {
          id: string;
          user_id: string;
          phone: string | null;
          location: string | null;
          country: string | null;
          timezone: string;
          language: string;
          date_of_birth: string | null;
          company: string | null;
          job_title: string | null;
          website: string | null;
          social_links: Json;
          preferences: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          phone?: string | null;
          location?: string | null;
          country?: string | null;
          timezone?: string;
          language?: string;
          date_of_birth?: string | null;
          company?: string | null;
          job_title?: string | null;
          website?: string | null;
          social_links?: Json;
          preferences?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          phone?: string | null;
          location?: string | null;
          country?: string | null;
          timezone?: string;
          language?: string;
          date_of_birth?: string | null;
          company?: string | null;
          job_title?: string | null;
          website?: string | null;
          social_links?: Json;
          preferences?: Json;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_sessions: {
        Row: {
          id: string;
          user_id: string;
          session_token: string;
          device_name: string | null;
          device_type: "desktop" | "mobile" | "tablet" | null;
          browser: string | null;
          ip_address: string | null;
          country: string | null;
          last_activity: string;
          created_at: string;
          expires_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          session_token: string;
          device_name?: string | null;
          device_type?: "desktop" | "mobile" | "tablet" | null;
          browser?: string | null;
          ip_address?: string | null;
          country?: string | null;
          last_activity?: string;
          created_at?: string;
          expires_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          session_token?: string;
          device_name?: string | null;
          device_type?: "desktop" | "mobile" | "tablet" | null;
          browser?: string | null;
          ip_address?: string | null;
          country?: string | null;
          last_activity?: string;
          created_at?: string;
          expires_at?: string;
        };
      };
      password_reset_tokens: {
        Row: {
          id: string;
          user_id: string;
          token: string;
          token_hash: string;
          expires_at: string;
          used_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          token: string;
          token_hash: string;
          expires_at: string;
          used_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          token?: string;
          token_hash?: string;
          expires_at?: string;
          used_at?: string | null;
          created_at?: string;
        };
      };
      login_attempts: {
        Row: {
          id: string;
          email: string | null;
          ip_address: string | null;
          user_agent: string | null;
          success: boolean | null;
          failure_reason: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          email?: string | null;
          ip_address?: string | null;
          user_agent?: string | null;
          success?: boolean | null;
          failure_reason?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string | null;
          ip_address?: string | null;
          user_agent?: string | null;
          success?: boolean | null;
          failure_reason?: string | null;
          created_at?: string;
        };
      };
      email_verification: {
        Row: {
          id: string;
          user_id: string;
          email: string;
          token: string;
          token_hash: string;
          expires_at: string;
          verified_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          email: string;
          token: string;
          token_hash: string;
          expires_at: string;
          verified_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          email?: string;
          token?: string;
          token_hash?: string;
          expires_at?: string;
          verified_at?: string | null;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      lesson_type: LessonType;
      user_role: UserRole;
      course_level: CourseLevel;
    };
  };
}

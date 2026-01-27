import { CourseLevel, LessonType } from "@/types/database.types";

export interface CourseWithDetails {
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
  payment_type: string;
  recurring_interval: string | null;
  recurring_price: number | null;
  installment_count: number | null;
  created_at: string;
  updated_at: string;
  sections: SectionWithLessons[];
  settings?: {
    isPublic: boolean;
    isHidden: boolean;
    tradeFileSource: boolean;
    enableRatings: boolean;
    enableDiscussions: boolean;
    enableCertificates: boolean;
    certificateValidityDays: number | null;
  };
}

export interface SectionWithLessons {
  id: string;
  course_id: string;
  title: string;
  order: number;
  created_at: string;
  lessons: Lesson[];
}

export interface Lesson {
  id: string;
  section_id: string;
  title: string;
  type: LessonType;
  content: string;
  description: string | null;
  downloadable_file: string | null;
  order: number;
  duration: number;
  thumbnail: string | null;
  is_free_preview: boolean;
  is_prerequisite: boolean;
  enable_discussions: boolean;
  is_downloadable: boolean;
  created_at: string;
  updated_at: string;
}

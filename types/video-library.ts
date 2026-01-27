export interface VideoMetadata {
  videoCodec?: string;
  audioCodec?: string;
  resolution?: string;
  frameRate?: number;
  uploadedAt?: string;
}

export interface Video {
  id: string;
  instructor_id: string;
  title: string;
  description: string | null;
  duration: number; // in seconds
  file_size: number; // in bytes
  file_url: string;
  thumbnail_url: string | null;
  upload_date: string;
  is_public: boolean;
  tags: string[];
  usage_count: number;
  metadata: VideoMetadata;
  created_at: string;
  updated_at: string;
}

export interface VideoAnalytics {
  usage_count: number;
  lessons: {
    lesson_title: string;
    course_title: string;
  }[];
  courses_count: number;
  total_views?: number; // Placeholder for future
}

export interface StorageStats {
  used: number; // bytes
  limit: number; // bytes
  percentage: number;
}

export interface LibrarySettings {
  default_privacy: "public" | "private";
  auto_generate_thumbnails: boolean;
  notify_on_storage_limit: boolean;
  storage_limit_threshold: number; // percentage
}

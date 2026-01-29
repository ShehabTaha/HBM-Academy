import { createClient } from "@/lib/supabase/client";

export type StorageBucket =
  | "avatars"
  | "course-thumbnails"
  | "videos"
  | "course-materials"
  | "audio-files"
  | "certificates";

export interface UploadOptions {
  bucket: StorageBucket;
  file: File;
  path: string;
  upsert?: boolean;
}

export interface UploadResult {
  success: boolean;
  url?: string;
  path?: string;
  error?: string;
}

/**
 * Storage service for file uploads and management
 */
export class StorageService {
  /**
   * Upload a file to Supabase Storage
   */
  static async uploadFile({
    bucket,
    file,
    path,
    upsert = false,
  }: UploadOptions): Promise<UploadResult> {
    try {
      // Determine if we are on server or client
      const isServer = typeof window === "undefined";
      let supabase;

      if (isServer) {
        // If on server, we try to use the Admin client to bypass RLS
        // This requires importing createAdminClient dynamically to avoid build issues on client?
        // Actually, imports are static. Let's use the one imported at top if possible.
        // But createAdminClient usually needs env vars only available on server.
        // The safest way is to use createClient (standard) on client, and admin on server.
        const { createAdminClient } = await import("@/lib/supabase/admin");
        supabase = createAdminClient();
      } else {
        supabase = createClient();
      }

      // Upload the file
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(path, file, {
          upsert,
          contentType: file.type,
        });

      if (error) {
        console.error("Upload error:", error);
        return { success: false, error: error.message };
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path);

      return {
        success: true,
        url: urlData.publicUrl,
        path: data.path,
      };
    } catch (error) {
      console.error("Storage service error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Delete a file from storage
   */
  static async deleteFile(
    bucket: StorageBucket,
    path: string,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const isServer = typeof window === "undefined";
      let supabase;

      if (isServer) {
        const { createAdminClient } = await import("@/lib/supabase/admin");
        supabase = createAdminClient();
      } else {
        supabase = createClient();
      }

      const { error } = await supabase.storage.from(bucket).remove([path]);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Get public URL for a file
   */
  static getPublicUrl(bucket: StorageBucket, path: string): string {
    const supabase = createClient();
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  }

  /**
   * Get signed URL for private files
   */
  static async getSignedUrl(
    bucket: StorageBucket,
    path: string,
    expiresIn: number = 3600, // 1 hour default
  ): Promise<{ url?: string; error?: string }> {
    try {
      const isServer = typeof window === "undefined";
      let supabase;

      if (isServer) {
        const { createAdminClient } = await import("@/lib/supabase/admin");
        supabase = createAdminClient();
      } else {
        supabase = createClient();
      }

      const { data, error } = await supabase.storage
        .from(bucket)
        .createSignedUrl(path, expiresIn);

      if (error) {
        return { error: error.message };
      }

      return { url: data.signedUrl };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Upload with progress tracking
   */
  static async uploadWithProgress(
    options: UploadOptions,
    onProgress?: (progress: number) => void,
  ): Promise<UploadResult> {
    // For now, we'll use the standard upload
    // Supabase JS SDK doesn't have built-in progress tracking
    // You can implement chunked upload for large files if needed
    return await this.uploadFile(options);
  }

  /**
   * Generate unique file path
   */
  static generatePath(userId: string, fileName: string): string {
    const timestamp = Date.now();
    const sanitizedName = fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
    return `${userId}/${timestamp}_${sanitizedName}`;
  }

  /**
   * Validate file type
   */
  static validateFileType(file: File, allowedTypes: string[]): boolean {
    return allowedTypes.some((type) => {
      if (type.endsWith("/*")) {
        const baseType = type.split("/")[0];
        return file.type.startsWith(baseType + "/");
      }
      return file.type === type;
    });
  }

  /**
   * Validate file size
   */
  static validateFileSize(file: File, maxSizeInMB: number): boolean {
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
    return file.size <= maxSizeInBytes;
  }
}

// Helper functions for common upload scenarios

export async function uploadAvatar(
  userId: string,
  file: File,
): Promise<UploadResult> {
  // Validate
  if (
    !StorageService.validateFileType(file, [
      "image/jpeg",
      "image/png",
      "image/webp",
    ])
  ) {
    return {
      success: false,
      error: "Invalid file type. Only JPEG, PNG, and WebP are allowed.",
    };
  }

  if (!StorageService.validateFileSize(file, 5)) {
    return { success: false, error: "File size must be less than 5MB." };
  }

  const path = StorageService.generatePath(userId, file.name);
  return await StorageService.uploadFile({
    bucket: "avatars",
    file,
    path,
    upsert: true,
  });
}

export async function uploadCourseThumbnail(
  courseId: string,
  file: File,
): Promise<UploadResult> {
  if (
    !StorageService.validateFileType(file, [
      "image/jpeg",
      "image/png",
      "image/webp",
    ])
  ) {
    return {
      success: false,
      error: "Invalid file type. Only JPEG, PNG, and WebP are allowed.",
    };
  }

  if (!StorageService.validateFileSize(file, 5)) {
    return { success: false, error: "File size must be less than 5MB." };
  }

  const path = StorageService.generatePath(courseId, file.name);
  return await StorageService.uploadFile({
    bucket: "course-thumbnails",
    file,
    path,
    upsert: true,
  });
}

export async function uploadVideo(
  lessonId: string,
  file: File,
  onProgress?: (progress: number) => void,
): Promise<UploadResult> {
  if (!StorageService.validateFileType(file, ["video/*"])) {
    return {
      success: false,
      error: "Invalid file type. Only video files are allowed.",
    };
  }

  if (!StorageService.validateFileSize(file, 2048)) {
    // 2GB
    return { success: false, error: "File size must be less than 2GB." };
  }

  const path = StorageService.generatePath(lessonId, file.name);
  return await StorageService.uploadWithProgress(
    {
      bucket: "videos",
      file,
      path,
    },
    onProgress,
  );
}

export async function uploadAudio(
  lessonId: string,
  file: File,
): Promise<UploadResult> {
  if (!StorageService.validateFileType(file, ["audio/*"])) {
    return {
      success: false,
      error: "Invalid file type. Only audio files are allowed.",
    };
  }

  if (!StorageService.validateFileSize(file, 100)) {
    return { success: false, error: "File size must be less than 100MB." };
  }

  const path = StorageService.generatePath(lessonId, file.name);
  return await StorageService.uploadFile({
    bucket: "audio-files",
    file,
    path,
  });
}

export async function uploadCourseMaterial(
  lessonId: string,
  file: File,
): Promise<UploadResult> {
  if (!StorageService.validateFileSize(file, 100)) {
    return { success: false, error: "File size must be less than 100MB." };
  }

  const path = StorageService.generatePath(lessonId, file.name);
  return await StorageService.uploadFile({
    bucket: "course-materials",
    file,
    path,
  });
}

export async function uploadLandingPageHero(
  courseId: string,
  file: File,
): Promise<UploadResult> {
  if (
    !StorageService.validateFileType(file, [
      "image/jpeg",
      "image/png",
      "image/webp",
    ])
  ) {
    return {
      success: false,
      error: "Invalid file type. Only JPEG, PNG, and WebP are allowed.",
    };
  }

  if (!StorageService.validateFileSize(file, 10)) {
    return { success: false, error: "File size must be less than 10MB." };
  }

  const path = `courses/${courseId}/landing-hero/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
  return await StorageService.uploadFile({
    bucket: "course-thumbnails",
    file,
    path,
    upsert: true,
  });
}

export async function deleteLandingPageHero(
  path: string,
): Promise<{ success: boolean; error?: string }> {
  return await StorageService.deleteFile("course-thumbnails", path);
}

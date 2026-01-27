import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Video } from "@/types/video-library";
import {
  getVideoMetadata,
  generateVideoThumbnail,
} from "@/utils/video-helpers";
import { createClient } from "@/lib/supabase/client";

export const useVideoUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const uploadVideo = async (file: File, metadata: Partial<Video> = {}) => {
    setIsUploading(true);
    setUploadProgress(0);
    setError(null);

    const supabase = createClient();

    try {
      // 1. Get User
      const {
        data: { user: authUser },
        error: authError,
      } = await supabase.auth.getUser();

      let user = authUser;

      // Fallback for development if auth is disabled
      if (!user && process.env.NODE_ENV === "development") {
        console.warn("No Supabase user found, using development fallback");
        user = { id: "00000000-0000-0000-0000-000000000000" } as any;
      } else if (authError || !user) {
        throw new Error("Unauthorized");
      }

      // 2. Get Video Metadata
      const videoMeta = await getVideoMetadata(file);

      const videoId = crypto.randomUUID();

      // 2.5 Generate and Upload Thumbnail
      let thumbnailUrl = "";
      try {
        const thumbnailBlob = await generateVideoThumbnail(file, 1);
        const thumbnailId = crypto.randomUUID();
        const thumbnailPath = `${user!.id}/${videoId}/thumbnail_${thumbnailId}.jpg`;

        const { error: thumbError } = await supabase.storage
          .from("lecture-videos")
          .upload(thumbnailPath, thumbnailBlob, {
            contentType: "image/jpeg",
            upsert: false,
          });

        if (!thumbError) {
          const {
            data: { publicUrl },
          } = supabase.storage
            .from("lecture-videos")
            .getPublicUrl(thumbnailPath);
          thumbnailUrl = publicUrl;
        }
      } catch (thumbErr) {
        console.error("Failed to generate thumbnail:", thumbErr);
        // Continue without thumbnail if it fails
      }

      // 3. Upload to Supabase Storage
      const fileExt = file.name.split(".").pop();
      const filePath = `${user!.id}/${videoId}/${videoId}.${fileExt}`;

      // Set indeterminate progress (since we don't have granular progress with basic upload)
      // Or we can simulate it
      const interval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) return prev;
          return prev + 5;
        });
      }, 500);

      const { error: uploadError } = await supabase.storage
        .from("lecture-videos")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      clearInterval(interval);

      if (uploadError) throw uploadError;

      setUploadProgress(100);

      // 4. Create DB Record via API
      const response = await fetch("/api/video-library/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: metadata.title,
          description: metadata.description,
          tags: metadata.tags,
          is_public: metadata.is_public,
          duration: videoMeta.duration,
          width: videoMeta.width,
          height: videoMeta.height,
          codecs: videoMeta.codecs,
          file_path: filePath,
          file_size: file.size,
          thumbnail_url: thumbnailUrl,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save video metadata");
      }

      const savedVideo = await response.json();

      toast({
        title: "Success",
        description: "Video uploaded successfully",
      });

      return savedVideo;
    } catch (err: any) {
      console.error("Upload error:", err);
      setError(err.message);
      toast({
        title: "Error",
        description: err.message || "Failed to upload video",
        variant: "destructive",
      });
      setIsUploading(false);
      throw err;
    } finally {
      setIsUploading(false);
    }
  };

  const cancel = () => {
    // Current implementation doesn't support cancellation of the promise-based upload
    // In a real TUS implementation, we would abort the upload
    setIsUploading(false);
  };

  return {
    uploadVideo,
    isUploading,
    uploadProgress,
    error,
    cancel,
  };
};

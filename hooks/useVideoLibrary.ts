import { useState, useCallback } from "react";
import { Video, VideoAnalytics } from "@/types/video-library";
import { useToast } from "@/components/ui/use-toast";

export const useVideoLibrary = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchVideos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/video-library");
      if (!res.ok) throw new Error("Failed to fetch videos");
      const data = await res.json();
      setVideos(data);
    } catch (err: any) {
      setError(err.message);
      toast({
        title: "Error",
        description: "Failed to load video library",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const deleteVideo = async (id: string) => {
    try {
      const res = await fetch(`/api/video-library/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete video");

      setVideos((prev) => prev.filter((v) => v.id !== id));
      toast({
        title: "Success",
        description: "Video deleted successfully",
      });
      return true;
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to delete video",
        variant: "destructive",
      });
      return false;
    }
  };

  const updateVideo = async (id: string, updates: Partial<Video>) => {
    try {
      const res = await fetch(`/api/video-library/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error("Failed to update video");

      const updatedVideo = await res.json();
      setVideos((prev) => prev.map((v) => (v.id === id ? updatedVideo : v)));
      toast({
        title: "Success",
        description: "Video updated successfully",
      });
      return updatedVideo;
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to update video",
        variant: "destructive",
      });
      return null;
    }
  };

  const duplicateVideo = async (id: string) => {
    try {
      const res = await fetch(`/api/video-library/${id}/duplicate`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed to duplicate video");

      const newVideo = await res.json();
      setVideos((prev) => [newVideo, ...prev]);
      toast({
        title: "Success",
        description: "Video duplicated successfully",
      });
      return newVideo;
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to duplicate video",
        variant: "destructive",
      });
      return null;
    }
  };

  const getVideoAnalytics = async (
    id: string,
  ): Promise<VideoAnalytics | null> => {
    try {
      const res = await fetch(`/api/video-library/${id}/analytics`);
      if (!res.ok) throw new Error("Failed to fetch analytics");
      return await res.json();
    } catch (err: any) {
      console.error(err);
      return null;
    }
  };

  return {
    videos,
    loading,
    error,
    refetch: fetchVideos,
    fetchVideos,
    deleteVideo,
    updateVideo,
    duplicateVideo,
    getVideoAnalytics,
  };
};

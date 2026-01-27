"use client";

import { useState, useCallback } from "react";
import { LandingPageSettings } from "@/lib/validations/landingPage";

export function useLandingPageAPI(courseId: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/courses/${courseId}/landing-page`);
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "Failed to fetch settings");
      return data.settings as LandingPageSettings;
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      return null;
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  const saveSettings = useCallback(
    async (settings: LandingPageSettings) => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/courses/${courseId}/landing-page`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(settings),
        });
        const data = await response.json();
        if (!response.ok)
          throw new Error(data.error || "Failed to save settings");
        return data.course;
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [courseId],
  );

  const uploadHeroImage = useCallback(
    async (file: File) => {
      setLoading(true);
      setError(null);
      try {
        const formData = new FormData();
        formData.append("file", file);
        const response = await fetch(
          `/api/courses/${courseId}/landing-page/upload-hero`,
          {
            method: "POST",
            body: formData,
          },
        );
        const data = await response.json();
        if (!response.ok)
          throw new Error(data.error || "Failed to upload image");
        return { url: data.url, path: data.path };
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [courseId],
  );

  const deleteHeroImage = useCallback(
    async (path: string) => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `/api/courses/${courseId}/landing-page/hero-image?path=${encodeURIComponent(path)}`,
          {
            method: "DELETE",
          },
        );
        const data = await response.json();
        if (!response.ok)
          throw new Error(data.error || "Failed to delete image");
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [courseId],
  );

  return {
    loading,
    error,
    fetchSettings,
    saveSettings,
    uploadHeroImage,
    deleteHeroImage,
  };
}

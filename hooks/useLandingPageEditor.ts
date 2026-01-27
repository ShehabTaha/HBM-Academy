"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  LandingPageSettings,
  LandingPageSettingsSchema,
} from "@/lib/validations/landingPage";
import { useLandingPageAPI } from "./useLandingPageAPI";
import { toast } from "@/components/ui/use-toast";

const DEFAULT_SETTINGS: LandingPageSettings = {
  hero_background_type: "color",
  hero_background_color: "#3b82f6",
  hero_subtitle: "",
  hero_cta_text: "Enroll Now",
  show_instructor_in_hero: true,
  show_overview: true,
  show_learning_outcomes: true,
  show_curriculum: true,
  show_instructor: true,
  show_reviews: true,
  show_faqs: true,
  learning_outcomes: [],
  faqs: [],
  curriculum_sections_limit: 0,
  curriculum_expand_by_default: false,
  reviews_count: 3,
  reviews_sort_by: "newest",
};

export function useLandingPageEditor(courseId: string) {
  const api = useLandingPageAPI(courseId);
  const [originalSettings, setOriginalSettings] =
    useState<LandingPageSettings | null>(null);
  const [currentSettings, setCurrentSettings] =
    useState<LandingPageSettings>(DEFAULT_SETTINGS);

  const isDirty = useMemo(() => {
    if (!originalSettings) return false;
    return JSON.stringify(originalSettings) !== JSON.stringify(currentSettings);
  }, [originalSettings, currentSettings]);

  useEffect(() => {
    const loadSettings = async () => {
      const settings = await api.fetchSettings();
      const effectiveOriginal = settings || DEFAULT_SETTINGS;
      setOriginalSettings(effectiveOriginal);

      // Check for cached draft
      const cacheKey = `landing_page_draft_${courseId}`;
      const cached = localStorage.getItem(cacheKey);

      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (parsed && typeof parsed === "object") {
            setCurrentSettings(parsed);
            setTimeout(() => {
              toast({
                title: "Draft Restored",
                description: "We found unsaved changes and restored them.",
              });
            }, 500);
            return;
          }
        } catch (e) {
          console.error("Failed to parse draft", e);
        }
      }

      setCurrentSettings(effectiveOriginal);
    };
    loadSettings();
  }, [courseId, api]);

  useEffect(() => {
    if (!originalSettings) return;

    // Save/Clear cache based on dirty state
    const cacheKey = `landing_page_draft_${courseId}`;
    if (isDirty) {
      localStorage.setItem(cacheKey, JSON.stringify(currentSettings));
    } else {
      localStorage.removeItem(cacheKey);
    }
  }, [currentSettings, originalSettings, courseId, isDirty]);

  const updateSettings = useCallback(
    (updates: Partial<LandingPageSettings>) => {
      setCurrentSettings((prev) => ({ ...prev, ...updates }));
    },
    [],
  );

  const save = useCallback(async () => {
    try {
      const validated = LandingPageSettingsSchema.parse(currentSettings);
      await api.saveSettings(validated);
      setOriginalSettings(currentSettings);
      toast({
        title: "Success",
        description: "Landing page settings saved successfully",
      });
    } catch (err) {
      toast({
        title: "Error",
        description:
          err instanceof Error ? err.message : "Failed to save settings",
        variant: "destructive",
      });
    }
  }, [currentSettings, api]);

  const discard = useCallback(() => {
    if (originalSettings) {
      setCurrentSettings(originalSettings);
    }
  }, [originalSettings]);

  return {
    settings: currentSettings,
    originalSettings,
    updateSettings,
    isDirty,
    loading: api.loading,
    error: api.error,
    save,
    discard,
    uploadHeroImage: api.uploadHeroImage,
    deleteHeroImage: api.deleteHeroImage,
  };
}

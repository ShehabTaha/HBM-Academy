import { useState, useEffect, useCallback } from "react";
import {
  PlatformSettings,
  SettingCategory,
  PaymentIntegration,
  EmailTemplate,
} from "@/types/settings";
import { toast } from "@/components/ui/use-toast";

interface UsePlatformSettingsReturn {
  settings: Partial<PlatformSettings>;
  isLoading: boolean;
  isSaving: boolean;
  activeTab: SettingCategory;
  setActiveTab: (tab: SettingCategory) => void;
  updateSetting: (key: keyof PlatformSettings, value: any) => void;
  saveSettings: () => Promise<void>;
  hasUnsavedChanges: boolean;
  refreshSettings: () => Promise<void>;
  error: string | null;
}

export function usePlatformSettings(): UsePlatformSettingsReturn {
  const [settings, setSettings] = useState<Partial<PlatformSettings>>({});
  const [originalSettings, setOriginalSettings] = useState<
    Partial<PlatformSettings>
  >({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<SettingCategory>("general");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch settings
  const fetchSettings = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await fetch("/api/admin/settings");
      const data = await res.json();

      if (!res.ok) {
        if (data.code === "MISSING_TABLE") {
          throw new Error(
            "Database setup required: Please run the migration script.",
          );
        }
        throw new Error(data.error || "Failed to fetch settings");
      }

      setSettings(data);
      setOriginalSettings(data);
      setHasUnsavedChanges(false);
    } catch (error: any) {
      console.error(error);
      setError(error.message);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // Update a single setting in state
  const updateSetting = useCallback(
    (key: keyof PlatformSettings, value: any) => {
      setSettings((prev) => {
        const newSettings = { ...prev, [key]: value };
        const isContentChanged =
          JSON.stringify(newSettings[key]) !==
          JSON.stringify(originalSettings[key]);
        setHasUnsavedChanges(true);
        return newSettings;
      });
    },
    [originalSettings],
  );

  // Save settings
  const saveSettings = async () => {
    try {
      setIsSaving(true);

      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings }),
      });

      if (!res.ok) throw new Error("Failed to save settings");

      setOriginalSettings(settings);
      setHasUnsavedChanges(false);
      toast({
        title: "Success",
        description: "Settings saved successfully",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return {
    settings,
    isLoading,
    isSaving,
    activeTab,
    setActiveTab,
    updateSetting,
    saveSettings,
    hasUnsavedChanges,
    refreshSettings: fetchSettings,
    error,
  };
}

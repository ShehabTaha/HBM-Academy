"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "@/components/ui/use-toast";
import {
  AdminNotificationSettings,
  adminNotificationSettingsSchema,
} from "@/lib/validations/admin-notifications";

// Default values matching schema defaults
const defaultSettings: AdminNotificationSettings = {
  recipient_emails: [],
  preferences: {
    assignment_submission: "immediate",
    quiz_submission: "immediate",
    student_report: "immediate",
    new_student: "immediate",
    csv_import_failed: "immediate",
    csv_import_success: "off",
    job_failed: "immediate",
    analytics_refresh_failed: "daily",
    course_published: "daily",
    video_upload_success: "off",
    video_upload_failed: "immediate",
    new_device_login: "immediate",
    failed_login_attempts: "immediate",
    role_change: "immediate",
    data_export: "daily",
    storage_limit: "daily",
    error_spike: "immediate",
  },
};

export function useAdminNotificationSettings() {
  const [settings, setSettings] =
    useState<AdminNotificationSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSendingTest, setIsSendingTest] = useState(false);

  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/notification-settings");
      if (res.ok) {
        const data = await res.json();
        // Merge with defaults to ensure all keys exist
        if (data && data.preferences) {
          setSettings({
            recipient_emails: data.recipient_emails || [],
            preferences: {
              ...defaultSettings.preferences,
              ...data.preferences,
            },
          });
        }
      }
    } catch (error) {
      console.error("Failed to fetch notification settings", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const updateSettings = async (newSettings: AdminNotificationSettings) => {
    setIsSaving(true);
    try {
      // Validate before sending
      const validation = adminNotificationSettingsSchema.safeParse(newSettings);
      if (!validation.success) {
        throw new Error("Invalid settings format");
      }

      const res = await fetch("/api/admin/notification-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSettings),
      });

      if (!res.ok) throw new Error("Failed to save");

      setSettings(newSettings);
      toast({
        title: "Settings saved",
        description: "Your notification preferences have been updated.",
      });
      return true;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const sendTestNotification = async () => {
    setIsSendingTest(true);
    try {
      const res = await fetch("/api/admin/notification-settings/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "TEST_ALERT",
          recipients: settings.recipient_emails,
        }),
      });

      if (!res.ok) throw new Error("Failed");

      toast({
        title: "Test Sent",
        description:
          "A test notification has been sent to your configured emails.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send test notification.",
        variant: "destructive",
      });
    } finally {
      setIsSendingTest(false);
    }
  };

  return {
    settings,
    isLoading,
    isSaving,
    isSendingTest,
    setSettings,
    updateSettings,
    sendTestNotification,
    refresh: fetchSettings,
  };
}

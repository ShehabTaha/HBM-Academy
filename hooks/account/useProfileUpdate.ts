import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { User, UserProfile } from "@/types/account";
import { toast } from "@/components/ui/use-toast";

export function useProfileUpdate() {
  const [isUpdating, setIsUpdating] = useState(false);

  const updateBasicInfo = async (userId: string, data: Partial<User>) => {
    try {
      setIsUpdating(true);

      const response = await fetch("/api/user/profile/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to update profile");
      }

      toast({
        title: "Success",
        description: "Account information updated successfully.",
      });
      return { success: true };
    } catch (error: any) {
      console.error("Error updating basic info:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update account information.",
        variant: "destructive",
      });
      return { success: false, error };
    } finally {
      setIsUpdating(false);
    }
  };

  const updateProfileDetails = async (
    userId: string,
    data: Partial<UserProfile>,
  ) => {
    try {
      setIsUpdating(true);

      const response = await fetch("/api/user/profile/details", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        // handle 503 specifically if needed, but generic error works
        throw new Error(result.error || "Failed to update profile details");
      }

      toast({
        title: "Success",
        description: "Profile details updated successfully.",
      });
      return { success: true };
    } catch (error: any) {
      console.error("Error updating profile details:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update profile details.",
        variant: "destructive",
      });
      return { success: false, error };
    } finally {
      setIsUpdating(false);
    }
  };

  const updatePreferences = async (userId: string, preferences: any) => {
    try {
      setIsUpdating(true);

      const response = await fetch("/api/user/preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ preferences }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to update preferences");
      }

      toast({
        title: "Success",
        description: "Preferences updated successfully.",
      });
      return { success: true };
    } catch (error: any) {
      console.error("Error updating preferences:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update preferences.",
        variant: "destructive",
      });
      return { success: false, error };
    } finally {
      setIsUpdating(false);
    }
  };

  const updateAvatar = async (userId: string, file: File) => {
    try {
      setIsUpdating(true);

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/user/profile/avatar", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to upload avatar");
      }

      toast({
        title: "Success",
        description: "Profile picture updated successfully.",
      });
      return { success: true, url: result.url };
    } catch (error: any) {
      console.error("Error uploading avatar:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to upload profile picture.",
        variant: "destructive",
      });
      return { success: false, error };
    } finally {
      setIsUpdating(false);
    }
  };

  const updateEmail = async (userId: string, email: string) => {
    try {
      setIsUpdating(true);

      const response = await fetch("/api/user/email/change", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to update email");
      }

      toast({
        title: "Success",
        description:
          "Email updated successfully. Please login again with your new email.",
      });
      return { success: true };
    } catch (error: any) {
      console.error("Error updating email:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update email.",
        variant: "destructive",
      });
      return { success: false, error };
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    isUpdating,
    updateBasicInfo,
    updateProfileDetails,
    updatePreferences,
    updateAvatar,
    updateEmail,
  };
}

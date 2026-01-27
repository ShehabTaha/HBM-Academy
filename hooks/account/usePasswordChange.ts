import { useState } from "react";
import { PasswordChangeRequest } from "@/types/account";
import { toast } from "@/components/ui/use-toast";

export function usePasswordChange() {
  const [isChanging, setIsChanging] = useState(false);

  const changePassword = async (data: PasswordChangeRequest) => {
    if (data.newPassword !== data.confirmPassword) {
      toast({
        title: "Validation Error",
        description: "New passwords do not match.",
        variant: "destructive",
      });
      return { success: false };
    }

    try {
      setIsChanging(true);

      const response = await fetch("/api/account/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to change password");
      }

      toast({
        title: "Success",
        description: "Your password has been changed successfully.",
      });
      return { success: true };
    } catch (error: any) {
      console.error("Error changing password:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to change password.",
        variant: "destructive",
      });
      return { success: false, error };
    } finally {
      setIsChanging(false);
    }
  };

  return {
    isChanging,
    changePassword,
  };
}

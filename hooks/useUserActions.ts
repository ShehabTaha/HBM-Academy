import { useState } from "react";
import { mutate } from "swr";

export function useUserActions() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const verifyEmail = async (userId: string) => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}/verify-email`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed to verify email");
      await mutate((key) => Array.isArray(key) || typeof key === "string");
      return true;
    } catch (e) {
      console.error(e);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const suspendUser = async (userId: string, reason: string) => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}/suspend`, {
        method: "POST",
        body: JSON.stringify({ reason }),
      });
      if (!res.ok) throw new Error("Failed to suspend user");
      return true;
    } catch (e) {
      console.error(e);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteUser = async (userId: string) => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete user");
      return true;
    } catch (e) {
      console.error(e);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateUser = async (userId: string, data: any) => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update");
      return await res.json();
    } catch (e) {
      console.error(e);
      return null;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    verifyEmail,
    suspendUser,
    deleteUser,
    updateUser,
    isSubmitting,
  };
}

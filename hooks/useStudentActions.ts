import { useState } from "react";
import { mutate } from "swr";

export function useStudentActions() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const verifyEmail = async (studentId: string) => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/admin/students/${studentId}/verify-email`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed to verify email");
      await mutate((key) => Array.isArray(key) || typeof key === "string"); // Mutate all keys roughly
      // Specific key mutation is hard without context. We rely on global mutate or manual revalidation in components.
      return true;
    } catch (e) {
      console.error(e);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const suspendStudent = async (studentId: string, reason: string) => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/admin/students/${studentId}/suspend`, {
        method: "POST",
        body: JSON.stringify({ reason }),
      });
      if (!res.ok) throw new Error("Failed to suspend student");
      return true;
    } catch (e) {
      console.error(e);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteStudent = async (studentId: string) => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/admin/students/${studentId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete student");
      return true;
    } catch (e) {
      console.error(e);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateStudent = async (studentId: string, data: any) => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/admin/students/${studentId}`, {
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
    suspendStudent,
    deleteStudent,
    updateStudent,
    isSubmitting,
  };
}

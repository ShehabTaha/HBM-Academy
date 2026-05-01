"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "@/components/ui/use-toast";

export interface UserEmail {
  id: string;
  user_id: string;
  email: string;
  is_primary: boolean;
  is_verified: boolean;
  created_at: string;
}

export function useUserEmails() {
  const [emails, setEmails] = useState<UserEmail[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchEmails = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/account/emails");
      if (res.ok) {
        const data = await res.json();
        setEmails(data);
      }
    } catch (error) {
      console.error("Failed to fetch user emails", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEmails();
  }, [fetchEmails]);

  const addEmail = async (email: string) => {
    try {
      const res = await fetch("/api/account/emails", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to add email");
      }
      toast({
        title: "Email added",
        description: "The new email address has been successfully added to your account.",
      });
      fetchEmails();
      return true;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }
  };

  const makePrimary = async (id: string) => {
    try {
      const res = await fetch(`/api/account/emails/${id}/primary`, {
        method: "PUT",
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to update primary email");
      }
      toast({
        title: "Primary email updated",
        description: "Your primary email address has been changed.",
      });
      fetchEmails();
      return true;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }
  };

  const deleteEmail = async (id: string) => {
    try {
      const res = await fetch(`/api/account/emails/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to delete email");
      }
      toast({
        title: "Email removed",
        description: "The email address has been successfully removed.",
      });
      fetchEmails();
      return true;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    emails,
    isLoading,
    addEmail,
    makePrimary,
    deleteEmail,
    refresh: fetchEmails,
  };
}

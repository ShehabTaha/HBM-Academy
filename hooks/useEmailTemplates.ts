import { useState, useEffect, useCallback } from "react";
import {
  EmailTemplate,
  EmailLog,
} from "@/types/settings";
import { toast } from "@/components/ui/use-toast";

interface UseEmailTemplatesReturn {
  templates: EmailTemplate[];
  logs: EmailLog[];
  loading: boolean;
  logsLoading: boolean;
  createTemplate: (data: Omit<EmailTemplate, "id" | "created_at" | "updated_at">) => Promise<boolean>;
  updateTemplate: (id: string, updates: Partial<EmailTemplate>) => Promise<boolean>;
  deleteTemplate: (id: string) => Promise<boolean>;
  sendTestEmail: (templateId: string, to?: string) => Promise<boolean>;
  refreshTemplates: () => Promise<void>;
  fetchLogs: (filters?: { status?: string; page?: number }) => Promise<void>;
}

export function useEmailTemplates(): UseEmailTemplatesReturn {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [logs, setLogs] = useState<EmailLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [logsLoading, setLogsLoading] = useState(false);

  const fetchTemplates = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/email/templates");
      if (res.ok) {
        const data = await res.json();
        setTemplates(data);
      } else {
        throw new Error("Failed to fetch templates");
      }
    } catch (error) {
      console.error("Failed to fetch templates:", error);
      toast({
        title: "Error",
        description: "Failed to load email templates",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const fetchLogs = useCallback(async (filters?: { status?: string; page?: number }) => {
    try {
      setLogsLoading(true);
      const params = new URLSearchParams();
      if (filters?.status) params.set("status", filters.status);
      if (filters?.page) params.set("page", String(filters.page));
      params.set("limit", "50");

      const res = await fetch(`/api/admin/email/logs?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs ?? []);
      }
    } catch (err) {
      console.error("Failed to fetch email logs:", err);
    } finally {
      setLogsLoading(false);
    }
  }, []);

  const createTemplate = useCallback(async (data: Omit<EmailTemplate, "id" | "created_at" | "updated_at">): Promise<boolean> => {
    try {
      const res = await fetch("/api/admin/email/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to create template");

      setTemplates((prev) => [json, ...prev]);
      toast({ title: "Template created", description: `"${data.name}" has been created.` });
      return true;
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
      return false;
    }
  }, []);

  const updateTemplate = useCallback(async (id: string, updates: Partial<EmailTemplate>): Promise<boolean> => {
    try {
      const res = await fetch(`/api/admin/email/templates/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to update template");

      setTemplates((prev) => prev.map((t) => (t.id === id ? { ...t, ...json } : t)));
      toast({ title: "Template updated", description: "Changes saved successfully." });
      return true;
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
      return false;
    }
  }, []);

  const deleteTemplate = useCallback(async (id: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/admin/email/templates/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete template");

      setTemplates((prev) => prev.filter((t) => t.id !== id));
      toast({ title: "Template deleted" });
      return true;
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
      return false;
    }
  }, []);

  const sendTestEmail = useCallback(async (templateId: string, to?: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/admin/email/templates/${templateId}/send-test`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error ?? "Test send failed");

      toast({ title: "Test email sent ✅", description: `Delivered to ${to ?? "your admin email"}` });
      return true;
    } catch (err: any) {
      toast({ title: "Test failed", description: err.message, variant: "destructive" });
      return false;
    }
  }, []);

  return {
    templates,
    logs,
    loading,
    logsLoading,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    sendTestEmail,
    refreshTemplates: fetchTemplates,
    fetchLogs,
  };
}

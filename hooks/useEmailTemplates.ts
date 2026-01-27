import { useState, useEffect } from "react";
import { EmailTemplate } from "@/types/settings";
import { toast } from "@/components/ui/use-toast";

export function useEmailTemplates() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchTemplates() {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/email/templates");
      if (res.ok) {
        const data = await res.json();
        setTemplates(data);
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
  }

  useEffect(() => {
    fetchTemplates();
  }, []);

  async function updateTemplate(id: string, updates: Partial<EmailTemplate>) {
    try {
      const res = await fetch(`/api/admin/email/templates/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      if (!res.ok) throw new Error("Failed to update template");

      // Optimistic update or refetch
      setTemplates((prev) =>
        prev.map((t) => (t.id === id ? { ...t, ...updates } : t)),
      );

      toast({
        title: "Success",
        description: "Template updated successfully",
      });
      return true;
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to update template",
        variant: "destructive",
      });
      return false;
    }
  }

  return {
    templates,
    loading,
    updateTemplate,
    refreshTemplates: fetchTemplates,
  };
}

import { useState, useEffect, useCallback } from "react";
import { UserSession } from "@/types/account";
import { useSession } from "next-auth/react";
import { toast } from "@/components/ui/use-toast";

export function useUserSessions() {
  const { data: session } = useSession();
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRevoking, setIsRevoking] = useState(false);

  const fetchSessions = useCallback(async () => {
    if (!session?.user?.id) return;

    try {
      setLoading(true);
      const response = await fetch("/api/user/sessions");
      const result = await response.json();

      if (!response.ok) {
        // If code is 503 (database table missing), we can ignore or show specific message if deeply needed,
        // but for now just log and set empty.
        if (response.status === 503) {
          console.warn("Sessions table not found, skipping fetch.");
          setSessions([]);
          return;
        }
        throw new Error(result.error || "Failed to fetch sessions");
      }

      setSessions(result.sessions || []);
    } catch (err: any) {
      console.error("Error fetching sessions:", err);
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id]);

  const revokeSession = async (sessionId: string) => {
    try {
      setIsRevoking(true);
      const response = await fetch("/api/user/sessions/revoke", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to revoke session");
      }

      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      toast({
        title: "Session Revoked",
        description: "The session has been successfully signed out.",
      });
    } catch (error: any) {
      console.error("Error revoking session:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to revoke session.",
        variant: "destructive",
      });
    } finally {
      setIsRevoking(false);
    }
  };

  const revokeAllOtherSessions = async () => {
    if (!session?.user?.id) return;

    try {
      setIsRevoking(true);

      const response = await fetch("/api/user/sessions/revoke", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ revokeAll: true }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to revoke other sessions");
      }

      await fetchSessions();
      toast({
        title: "All Sessions Revoked",
        description: "You have been signed out of all other devices.",
      });
    } catch (error: any) {
      console.error("Error revoking sessions:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to revoke other sessions.",
        variant: "destructive",
      });
    } finally {
      setIsRevoking(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  return {
    sessions,
    loading,
    isRevoking,
    refresh: fetchSessions,
    revokeSession,
    revokeAllOtherSessions,
  };
}

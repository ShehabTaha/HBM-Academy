"use client";

import { useEffect, useRef } from "react";
import { useSession, signOut } from "next-auth/react";
import { toast } from "@/components/ui/use-toast";

export function useSessionHeartbeat(intervalMs = 5 * 60 * 1000) {
  const { data: session, status } = useSession();
  const isPinging = useRef(false);

  useEffect(() => {
    // Only run when authenticated
    if (status !== "authenticated" || !session?.user) return;

    const pingHeartbeat = async () => {
      if (isPinging.current) return;
      
      // Don't ping if tab is hidden to save resources
      if (document.hidden) return;

      try {
        isPinging.current = true;
        const res = await fetch("/api/user/sessions/heartbeat", {
          method: "POST",
        });

        if (!res.ok) {
          const data = await res.json();
          // If the session was explicitly revoked, log out immediately
          if (res.status === 401 && data.revoked) {
            toast({
              title: "Session Revoked",
              description: "You have been signed out from another device.",
              variant: "destructive",
            });
            await signOut({ callbackUrl: "/auth/login" });
          }
        }
      } catch (error) {
        console.error("Heartbeat ping failed:", error);
      } finally {
        isPinging.current = false;
      }
    };

    // Ping immediately on mount
    pingHeartbeat();

    // Set up interval
    const interval = setInterval(pingHeartbeat, intervalMs);

    // Set up visibility listener to ping immediately when tab becomes active
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        pingHeartbeat();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [session, status, intervalMs]);
}

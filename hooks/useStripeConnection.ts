import { useState, useCallback } from "react";
import { StripeConnectionStatus } from "@/types/settings";
import { toast } from "@/components/ui/use-toast";

interface UseStripeConnectionReturn {
  status: StripeConnectionStatus | null;
  loading: boolean;
  testing: boolean;
  onboarding: boolean;
  fetchStatus: () => Promise<void>;
  testConnection: (secretKey?: string) => Promise<StripeConnectionStatus>;
  startOnboarding: () => Promise<void>;
}

export function useStripeConnection(): UseStripeConnectionReturn {
  const [status, setStatus] = useState<StripeConnectionStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [onboarding, setOnboarding] = useState(false);

  const fetchStatus = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/payment/stripe/status");
      if (res.ok) {
        const data = await res.json();
        setStatus(data);
      }
    } catch (err) {
      console.error("Failed to fetch Stripe status:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const testConnection = useCallback(async (secretKey?: string): Promise<StripeConnectionStatus> => {
    setTesting(true);
    try {
      const res = await fetch("/api/admin/payment/stripe/test-connection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secretKey }),
      });

      const data = await res.json();

      if (data.success) {
        const newStatus: StripeConnectionStatus = {
          connected: true,
          verified: true,
          test_mode: data.mode === "test",
          has_webhook: status?.has_webhook ?? false,
          account: { type: data.mode },
        };
        setStatus(newStatus);
        toast({
          title: "Stripe Connected ✅",
          description: `Running in ${data.mode === "live" ? "Live" : "Test"} mode`,
        });
        return newStatus;
      } else {
        const errStatus: StripeConnectionStatus = {
          connected: false,
          verified: false,
          test_mode: true,
          has_webhook: false,
          error: data.error,
        };
        setStatus(errStatus);
        toast({
          title: "Connection failed",
          description: data.error ?? "Could not connect to Stripe",
          variant: "destructive",
        });
        return errStatus;
      }
    } catch (err: any) {
      const errStatus: StripeConnectionStatus = {
        connected: false,
        verified: false,
        test_mode: true,
        has_webhook: false,
        error: err.message,
      };
      toast({
        title: "Connection error",
        description: err.message,
        variant: "destructive",
      });
      return errStatus;
    } finally {
      setTesting(false);
    }
  }, [status]);

  const startOnboarding = useCallback(async () => {
    setOnboarding(true);
    try {
      const response = await fetch("/api/admin/payment/stripe/connect", {
        method: "POST",
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Stripe onboarding could not be started.");
      }

      window.location.href = data.url;
    } catch (error) {
      toast({
        title: "Stripe onboarding failed",
        description:
          error instanceof Error ? error.message : "Stripe onboarding could not be started.",
        variant: "destructive",
      });
      setOnboarding(false);
    }
  }, []);

  return { status, loading, testing, onboarding, fetchStatus, testConnection, startOnboarding };
}

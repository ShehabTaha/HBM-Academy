import { useState, useEffect } from "react";

interface PaymentStatus {
  connected: boolean;
  verified: boolean;
  test_mode: boolean;
  account?: {
    email: string;
    type: string;
    country: string;
  };
}

export function usePaymentStatus() {
  const [status, setStatus] = useState<PaymentStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStatus() {
      try {
        const res = await fetch("/api/admin/payment/stripe/status");
        if (res.ok) {
          const data = await res.json();
          setStatus(data);
        }
      } catch (error) {
        console.error("Failed to fetch payment status:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchStatus();
  }, []);

  return { status, loading };
}

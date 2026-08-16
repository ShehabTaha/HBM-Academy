"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function BillingPortalButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function openPortal() {
    setLoading(true);
    setError(null);
    const response = await fetch("/api/student/checkout/portal", { method: "POST" });
    const data = await response.json();
    setLoading(false);
    if (!response.ok) {
      setError(data.error ?? "Billing portal unavailable.");
      return;
    }
    window.location.href = data.url;
  }

  return (
    <div className="space-y-2">
      <Button type="button" variant="outline" onClick={openPortal} disabled={loading}>
        {loading ? "Opening..." : "Manage billing"}
      </Button>
      {error ? <p className="text-sm text-muted-foreground">{error}</p> : null}
    </div>
  );
}

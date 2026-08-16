"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function NewConversationForm() {
  const router = useRouter();
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    const response = await fetch("/api/student/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subject, body }),
    });
    const data = await response.json();
    setLoading(false);
    if (!response.ok) {
      setError(data.error ?? "Could not create conversation.");
      return;
    }
    router.push(`/messages/${data.conversation.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="space-y-3 rounded-lg border bg-white p-4">
      <Input
        value={subject}
        onChange={(event) => setSubject(event.target.value)}
        placeholder="Subject"
        required
      />
      <Textarea
        value={body}
        onChange={(event) => setBody(event.target.value)}
        placeholder="How can the HBM team help?"
        required
      />
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <Button type="submit" disabled={loading}>
        {loading ? "Sending..." : "New message"}
      </Button>
    </form>
  );
}

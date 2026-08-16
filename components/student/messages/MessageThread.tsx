"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useRealtime } from "@/hooks/useRealtime";

type Message = {
  id: string;
  sender_role: "student" | "admin";
  body: string;
  created_at: string;
};

export function MessageThread({
  conversationId,
  initialMessages,
  resolved,
}: {
  conversationId: string;
  initialMessages: Message[];
  resolved: boolean;
}) {
  const router = useRouter();
  const [messages, setMessages] = useState(initialMessages);
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);

  const refreshMessages = useCallback(async () => {
    const response = await fetch(`/api/student/messages/${conversationId}`);
    if (!response.ok) return;
    const data = await response.json();
    setMessages(data.conversation?.messages ?? []);
  }, [conversationId]);

  useRealtime(
    `conversation:${conversationId}`,
    {
      table: "messages",
      event: "INSERT",
      filter: `conversation_id=eq.${conversationId}`,
    },
    refreshMessages,
  );

  async function sendMessage(event: React.FormEvent) {
    event.preventDefault();
    if (!body.trim()) return;
    setLoading(true);
    const response = await fetch(`/api/student/messages/${conversationId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body }),
    });
    setLoading(false);
    if (response.ok) {
      setBody("");
      await refreshMessages();
      router.refresh();
    }
  }

  return (
    <div className="space-y-5">
      <div className="space-y-4 rounded-lg border bg-white p-5">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex",
              message.sender_role === "student" ? "justify-end" : "justify-start",
            )}
          >
            <div
              className={cn(
                "max-w-[78%] rounded-lg px-4 py-3",
                message.sender_role === "student"
                  ? "bg-primary text-primary-foreground"
                  : "border bg-secondary",
              )}
            >
              {message.sender_role === "admin" ? (
                <p className="mb-1 text-xs font-semibold">HBM Team</p>
              ) : null}
              <p className="whitespace-pre-wrap text-sm" dir="auto">
                {message.body}
              </p>
              <p className="mt-2 text-xs opacity-70">
                {new Date(message.created_at).toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>

      {!resolved ? (
        <form onSubmit={sendMessage} className="flex gap-3">
          <Textarea
            value={body}
            onChange={(event) => setBody(event.target.value)}
            placeholder="Write a message..."
          />
          <Button type="submit" disabled={loading} className="self-end">
            Send
          </Button>
        </form>
      ) : (
        <p className="rounded-lg border bg-white p-4 text-sm text-muted-foreground">
          This conversation is resolved.
        </p>
      )}
    </div>
  );
}

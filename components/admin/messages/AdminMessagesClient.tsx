"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Conversation = {
  id: string;
  subject: string;
  status: "open" | "resolved";
  student?: { name: string; email: string };
  messages?: Array<{
    id: string;
    body: string;
    sender_role: "student" | "admin";
    created_at: string;
  }>;
};

export function AdminMessagesClient() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [reply, setReply] = useState("");

  async function load() {
    const response = await fetch("/api/admin/messages");
    if (!response.ok) return;
    const data = await response.json();
    setConversations(data.conversations ?? []);
    setSelectedId((current) => current ?? data.conversations?.[0]?.id ?? null);
  }

  useEffect(() => {
    const initialLoad = window.setTimeout(() => {
      void load();
    }, 0);
    const interval = window.setInterval(load, 15000);
    return () => {
      window.clearTimeout(initialLoad);
      window.clearInterval(interval);
    };
  }, []);

  const selected = conversations.find((item) => item.id === selectedId);
  const messages = [...(selected?.messages ?? [])].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  );

  async function sendReply() {
    if (!selected || !reply.trim()) return;
    await fetch(`/api/admin/messages/${selected.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: reply }),
    });
    setReply("");
    await load();
  }

  async function setStatus(status: "open" | "resolved") {
    if (!selected) return;
    await fetch(`/api/admin/messages/${selected.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    await load();
  }

  return (
    <div className="grid w-full gap-5 lg:grid-cols-[360px_1fr]">
      <Card className="rounded-lg bg-white">
        <CardContent className="space-y-2 p-4">
          {conversations.map((conversation) => (
            <button
              key={conversation.id}
              onClick={() => setSelectedId(conversation.id)}
              className={cn(
                "w-full rounded-md border p-3 text-left transition hover:bg-secondary",
                selectedId === conversation.id && "border-primary bg-secondary",
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="line-clamp-1 font-medium">{conversation.subject}</p>
                <Badge variant="secondary">{conversation.status}</Badge>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {conversation.student?.name ?? conversation.student?.email ?? "Student"}
              </p>
            </button>
          ))}
          {conversations.length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground">No conversations yet.</p>
          ) : null}
        </CardContent>
      </Card>

      <Card className="rounded-lg bg-white">
        <CardContent className="space-y-5 p-5">
          {selected ? (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-semibold">{selected.subject}</h2>
                  <p className="text-sm text-muted-foreground">
                    {selected.student?.email}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setStatus("open")}>
                    Open
                  </Button>
                  <Button onClick={() => setStatus("resolved")}>Resolve</Button>
                </div>
              </div>
              <div className="space-y-3">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "rounded-lg p-3",
                      message.sender_role === "admin"
                        ? "ml-auto max-w-[80%] bg-primary text-primary-foreground"
                        : "mr-auto max-w-[80%] bg-secondary",
                    )}
                  >
                    <p className="whitespace-pre-wrap text-sm">{message.body}</p>
                    <p className="mt-2 text-xs opacity-70">
                      {new Date(message.created_at).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
              <div className="flex gap-3">
                <Textarea
                  value={reply}
                  onChange={(event) => setReply(event.target.value)}
                  placeholder="Reply as HBM Team..."
                />
                <Button onClick={sendReply} className="self-end">
                  Reply
                </Button>
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              Select a conversation to reply.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

import Link from "next/link";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/student/EmptyState";
import { NewConversationForm } from "@/components/student/messages/NewConversationForm";
import { getCurrentStudent } from "@/lib/services/student.service";
import { listConversations } from "@/lib/services/messages.service";

export default async function MessagesPage() {
  const student = await getCurrentStudent();
  if (!student) redirect("/auth/login");
  const { conversations } = await listConversations(student.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Messages</h1>
        <p className="mt-2 text-muted-foreground">
          Conversation-based support with the HBM team.
        </p>
      </div>
      <NewConversationForm />
      {conversations.length === 0 ? (
        <EmptyState
          title="No conversations"
          description="Send your first message to start a support thread."
        />
      ) : (
        <div className="space-y-3">
          {conversations.map((conversation: any) => {
            const latest = [...(conversation.messages ?? [])].sort(
              (a, b) =>
                new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
            )[0];

            return (
              <Link key={conversation.id} href={`/messages/${conversation.id}`}>
                <Card className="rounded-lg bg-white transition hover:border-primary">
                  <CardContent className="flex items-center justify-between gap-4 p-5">
                    <div>
                      <p className="font-medium">{conversation.subject}</p>
                      <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">
                        {latest?.body ?? "No messages yet"}
                      </p>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {conversation.status}
                    </span>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

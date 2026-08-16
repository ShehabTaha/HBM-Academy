import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { MessageThread } from "@/components/student/messages/MessageThread";
import { getCurrentStudent } from "@/lib/services/student.service";
import { getConversation } from "@/lib/services/messages.service";

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ conversationId: string }>;
}) {
  const { conversationId } = await params;
  const student = await getCurrentStudent();
  if (!student) redirect("/auth/login");
  const result = await getConversation(student.id, conversationId);
  if (result.error || !result.conversation) notFound();
  const conversation = result.conversation;

  return (
    <div className="space-y-6">
      <Button asChild variant="outline">
        <Link href="/messages">Back to messages</Link>
      </Button>
      <div>
        <h1 className="text-3xl font-semibold">{conversation.subject}</h1>
        <p className="mt-2 text-muted-foreground">
          Status: {conversation.status}
        </p>
      </div>
      <MessageThread
        conversationId={conversation.id}
        initialMessages={conversation.messages ?? []}
        resolved={conversation.status === "resolved"}
      />
    </div>
  );
}

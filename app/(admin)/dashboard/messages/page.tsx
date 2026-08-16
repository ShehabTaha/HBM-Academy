import { AdminMessagesClient } from "@/components/admin/messages/AdminMessagesClient";

export default function AdminMessagesPage() {
  return (
    <div className="w-full space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Messages</h1>
        <p className="mt-2 text-muted-foreground">
          Reply to student support conversations.
        </p>
      </div>
      <AdminMessagesClient />
    </div>
  );
}

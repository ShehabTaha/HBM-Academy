import { createClient } from "@/lib/supabase/server";

export async function listConversations(studentId: string) {
  const supabase = await createClient();
  const { data, error } = await (supabase.from("conversations") as any)
    .select("*, messages(body,sender_role,is_read,created_at)")
    .eq("student_id", studentId)
    .order("updated_at", { ascending: false });

  if (error) return { error: error.message, conversations: [] };
  return { conversations: data ?? [] };
}

export async function getConversation(studentId: string, conversationId: string) {
  const supabase = await createClient();
  const { data, error } = await (supabase.from("conversations") as any)
    .select("*, messages(*)")
    .eq("id", conversationId)
    .eq("student_id", studentId)
    .maybeSingle();

  if (error) return { error: error.message, status: 500 };
  if (!data) return { error: "Conversation not found", status: 404 };

  const messages = [...(data.messages ?? [])].sort(
    (a: any, b: any) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  );

  await (supabase.from("messages") as any)
    .update({ is_read: true })
    .eq("conversation_id", conversationId)
    .eq("sender_role", "admin");

  return { conversation: { ...data, messages } };
}

export async function createConversation(params: {
  studentId: string;
  subject: string;
  body: string;
}) {
  const supabase = await createClient();
  const { data: conversation, error } = await (supabase.from("conversations") as any)
    .insert({
      student_id: params.studentId,
      subject: stripHtml(params.subject),
      status: "open",
    })
    .select()
    .single();

  if (error) return { error: error.message, status: 500 };

  const messageResult = await addMessage({
    studentId: params.studentId,
    conversationId: conversation.id,
    body: params.body,
  });

  if (messageResult.error) return messageResult;
  return { conversation, message: messageResult.message };
}

export async function addMessage(params: {
  studentId: string;
  conversationId: string;
  body: string;
}) {
  const supabase = await createClient();
  const { data: conversation } = await (supabase.from("conversations") as any)
    .select("id,status")
    .eq("id", params.conversationId)
    .eq("student_id", params.studentId)
    .maybeSingle();

  if (!conversation) return { error: "Conversation not found", status: 404 };
  if (conversation.status === "resolved") {
    return { error: "This conversation is resolved.", status: 400 };
  }

  const { data: message, error } = await (supabase.from("messages") as any)
    .insert({
      conversation_id: params.conversationId,
      sender_id: params.studentId,
      sender_role: "student",
      body: stripHtml(params.body),
    })
    .select()
    .single();

  if (error) return { error: error.message, status: 500 };

  await (supabase.from("conversations") as any)
    .update({ updated_at: new Date().toISOString() })
    .eq("id", params.conversationId);

  return { message };
}

function stripHtml(value: string) {
  return value.replace(/<[^>]*>/g, "").trim();
}

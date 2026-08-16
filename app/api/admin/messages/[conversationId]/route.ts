import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/security/requireAdmin";

const replySchema = z.object({
  body: z.string().min(1).max(4000),
});

const statusSchema = z.object({
  status: z.enum(["open", "resolved"]),
});

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ conversationId: string }> },
) {
  const { error: authError } = await requireAdmin();
  if (authError) return authError;

  const { conversationId } = await params;
  const supabase = createAdminClient();
  const { data, error } = await (supabase.from("conversations") as any)
    .select("*, student:users(name,email,avatar), messages(*)")
    .eq("id", conversationId)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: "Conversation not found" }, { status: 404 });

  const messages = [...(data.messages ?? [])].sort(
    (a: any, b: any) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  );

  return NextResponse.json({ conversation: { ...data, messages } });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ conversationId: string }> },
) {
  const { user, error: authError } = await requireAdmin();
  if (authError) return authError;

  const parsed = replySchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid reply" }, { status: 400 });

  const { conversationId } = await params;
  const supabase = createAdminClient();
  const { data, error } = await (supabase.from("messages") as any)
    .insert({
      conversation_id: conversationId,
      sender_id: user!.id,
      sender_role: "admin",
      body: parsed.data.body.replace(/<[^>]*>/g, "").trim(),
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await (supabase.from("conversations") as any)
    .update({ updated_at: new Date().toISOString(), status: "open" })
    .eq("id", conversationId);

  return NextResponse.json({ message: data });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ conversationId: string }> },
) {
  const { error: authError } = await requireAdmin();
  if (authError) return authError;

  const parsed = statusSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid status" }, { status: 400 });

  const { conversationId } = await params;
  const supabase = createAdminClient();
  const { data, error } = await (supabase.from("conversations") as any)
    .update({ status: parsed.data.status, updated_at: new Date().toISOString() })
    .eq("id", conversationId)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ conversation: data });
}

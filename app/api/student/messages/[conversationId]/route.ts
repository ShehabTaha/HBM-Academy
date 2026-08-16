import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentStudent } from "@/lib/services/student.service";
import { addMessage, getConversation } from "@/lib/services/messages.service";

const messageSchema = z.object({
  body: z.string().min(1).max(4000),
});

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ conversationId: string }> },
) {
  const student = await getCurrentStudent();
  if (!student) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { conversationId } = await params;
  const result = await getConversation(student.id, conversationId);
  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: result.status ?? 500 });
  }
  return NextResponse.json(result);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ conversationId: string }> },
) {
  const student = await getCurrentStudent();
  if (!student) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = messageSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid message" }, { status: 400 });

  const { conversationId } = await params;
  const result = await addMessage({
    studentId: student.id,
    conversationId,
    body: parsed.data.body,
  });
  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: result.status ?? 500 });
  }
  return NextResponse.json(result);
}

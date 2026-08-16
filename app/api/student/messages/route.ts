import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentStudent } from "@/lib/services/student.service";
import { createConversation, listConversations } from "@/lib/services/messages.service";

const createSchema = z.object({
  subject: z.string().min(2).max(160),
  body: z.string().min(1).max(4000),
});

export async function GET() {
  const student = await getCurrentStudent();
  if (!student) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const result = await listConversations(student.id);
  return NextResponse.json(result);
}

export async function POST(request: Request) {
  const student = await getCurrentStudent();
  if (!student) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = createSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid message" }, { status: 400 });
  }

  const result = await createConversation({
    studentId: student.id,
    subject: parsed.data.subject,
    body: parsed.data.body,
  });

  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: result.status ?? 500 });
  }

  return NextResponse.json(result);
}

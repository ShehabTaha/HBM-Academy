import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentStudent } from "@/lib/services/student.service";
import {
  createDiscussionPost,
  deleteDiscussionPost,
  listDiscussionPosts,
  updateDiscussionPost,
} from "@/lib/services/discussions.service";

const createSchema = z.object({
  body: z.string().min(1).max(3000),
  parentId: z.string().uuid().nullable().optional(),
});

const updateSchema = z.object({
  postId: z.string().uuid(),
  body: z.string().min(1).max(3000).optional(),
  action: z.enum(["update", "delete"]),
});

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ lessonId: string }> },
) {
  const student = await getCurrentStudent();
  if (!student) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { lessonId } = await params;
  const result = await listDiscussionPosts(student.id, lessonId);
  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: result.status ?? 500 });
  }
  return NextResponse.json(result);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ lessonId: string }> },
) {
  const student = await getCurrentStudent();
  if (!student) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = createSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid post" }, { status: 400 });

  const { lessonId } = await params;
  const result = await createDiscussionPost({
    studentId: student.id,
    lessonId,
    body: parsed.data.body,
    parentId: parsed.data.parentId,
  });
  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: result.status ?? 500 });
  }
  return NextResponse.json(result);
}

export async function PATCH(request: Request) {
  const student = await getCurrentStudent();
  if (!student) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = updateSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  const result =
    parsed.data.action === "delete"
      ? await deleteDiscussionPost(student.id, parsed.data.postId)
      : await updateDiscussionPost({
          studentId: student.id,
          postId: parsed.data.postId,
          body: parsed.data.body ?? "",
        });

  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: result.status ?? 500 });
  }
  return NextResponse.json(result);
}

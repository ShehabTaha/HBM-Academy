import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getCurrentStudent } from "@/lib/services/student.service";

const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(2000).nullable().optional(),
});

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ courseId: string }> },
) {
  const { courseId } = await params;
  const supabase = await createClient();
  const { data, error } = await (supabase.from("reviews") as any)
    .select("*, student:users(name,avatar)")
    .eq("course_id", courseId)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ reviews: data ?? [] });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ courseId: string }> },
) {
  const student = await getCurrentStudent();
  if (!student) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = reviewSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid review" }, { status: 400 });

  const { courseId } = await params;
  const supabase = await createClient();
  const { data: enrollment } = await (supabase.from("enrollments") as any)
    .select("id")
    .eq("student_id", student.id)
    .eq("course_id", courseId)
    .maybeSingle();

  if (!enrollment) {
    return NextResponse.json({ error: "Enrollment required" }, { status: 403 });
  }

  const { data, error } = await (supabase.from("reviews") as any)
    .upsert(
      {
        course_id: courseId,
        student_id: student.id,
        rating: parsed.data.rating,
        comment: parsed.data.comment ?? null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "course_id,student_id" },
    )
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ review: data });
}

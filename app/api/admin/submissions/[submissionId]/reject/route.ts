import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ submissionId: string }> },
) {
  try {
    const { submissionId } = await params;
    const body = await request.json();
    const { feedback, sendEmail } = body;

    const supabase = await createClient();

    // 1. Auth Check (Admin)
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { data: userData } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();
    if (userData?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // 2. Update Status
    const { error: updateError } = await supabase
      .from("assignment_submissions")
      .update({
        status: "rejected",
        admin_feedback: feedback,
        admin_id: user.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", submissionId);

    if (updateError) {
      throw updateError;
    }

    // 3. Ensure Progress is Incomplete (optional, but good for consistency)
    // We fetch details to finding enrollment
    const { data: submission } = await supabase
      .from("assignment_submissions")
      .select("student_id, course_id, assignment_id")
      .eq("id", submissionId)
      .single();

    if (submission) {
      const { data: enrollment } = await supabase
        .from("enrollments")
        .select("id")
        .eq("student_id", submission.student_id)
        .eq("course_id", submission.course_id)
        .single();

      if (enrollment) {
        await supabase
          .from("progress")
          .update({ is_completed: false })
          .eq("enrollment_id", enrollment.id)
          .eq("lesson_id", submission.assignment_id);
      }
    }

    // 4. Send Email (Mock)
    if (sendEmail) {
      console.log(`Sending rejection email`);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error rejecting submission:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

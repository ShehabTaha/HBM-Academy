import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/security/requireAdmin";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ submissionId: string }> },
) {
  try {
    const { user, error: authError } = await requireAdmin();
    if (authError) return authError;

    const { submissionId } = await params;
    const body = await request.json();
    const { feedback, sendEmail } = body;

    const supabase = createAdminClient();

    // 2. Update Status
    const { error: updateError } = await supabase
      .from("assignment_submissions")
      // @ts-ignore
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
    const { data: submissionData } = await supabase
      .from("assignment_submissions" as any)
      .select("student_id, course_id, assignment_id")
      .eq("id", submissionId)
      .single();

    const submission = submissionData as any;

    if (submission) {
      const { data: enrollmentData } = await supabase
        .from("enrollments")
        .select("id")
        .eq("student_id", submission.student_id)
        .eq("course_id", submission.course_id)
        .single();

      const enrollment = enrollmentData as any;

      if (enrollment) {
        await supabase
          .from("progress")
          // @ts-ignore
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

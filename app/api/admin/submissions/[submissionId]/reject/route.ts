import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/security/requireAdmin";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/services/email.service";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ submissionId: string }> },
) {
  try {
    const { user, error: authError } = await requireAdmin();
    if (authError) return authError;

    const { submissionId } = await params;
    const body = await request.json();
    const { feedback, sendEmail: shouldSendEmail } = body;

    const supabase = createAdminClient();

    // 2. Update Status
    const { error: updateError } = await supabase
      .from("assignment_submissions")
      // @ts-expect-error - Expected type mismatch for status
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: submissionData } = await (supabase.from("assignment_submissions") as any)
      .select("*, student:users(email)")
      .eq("id", submissionId)
      .single();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const submission = submissionData as any;

    if (submission) {
      const { data: enrollmentData } = await supabase
        .from("enrollments")
        .select("id")
        .eq("student_id", submission.student_id)
        .eq("course_id", submission.course_id)
        .single();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const enrollment = enrollmentData as any;

      if (enrollment) {
        await supabase
          .from("progress")
          // @ts-expect-error - Expected type mismatch for status
          .update({ is_completed: false })
          .eq("enrollment_id", enrollment.id)
          .eq("lesson_id", submission.assignment_id);
      }
    }

    // 4. Send Email
    if (shouldSendEmail) {
      const studentEmail = submission?.student?.email || "student@example.com";
      await sendEmail({
        to: studentEmail,
        subject: "Your Assignment Needs Revisions",
        html: `<p>Your assignment was reviewed but needs some changes.</p><p><strong>Feedback:</strong> ${feedback || "Please revise and resubmit."}</p>`,
      });
      console.log(`Sending rejection email to ${studentEmail}`);
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("Error rejecting submission:", error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

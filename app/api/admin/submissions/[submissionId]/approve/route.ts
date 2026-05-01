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

    // 2. Get Submission details (to find student, course, lesson)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: submissionData, error: subError } = await (supabase.from("assignment_submissions") as any)
      .select("*")
      .eq("id", submissionId)
      .single();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const submission = submissionData as any;

    if (subError || !submission) {
      return NextResponse.json(
        { error: "Submission not found" },
        { status: 404 },
      );
    }

    // 3. Update Submission Status
    const { error: updateError } = await supabase
      .from("assignment_submissions")
      // @ts-expect-error - Expected type mismatch for status in generated types
      .update({
        status: "approved",
        admin_feedback: feedback,
        admin_id: user.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", submissionId);

    if (updateError) {
      throw updateError;
    }

    // 4. Mark Lesson as Completed in Progress
    // First find enrollment
    const { data: enrollmentData } = await supabase
      .from("enrollments")
      .select("id")
      .eq("student_id", submission.student_id)
      .eq("course_id", submission.course_id)
      .single();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const enrollment = enrollmentData as any;

    if (enrollment) {
      // Upsert progress
      // @ts-expect-error - Supabase generated types missing upsert options
      const { error: progressError } = await supabase.from("progress").upsert(
        {
          enrollment_id: enrollment.id,
          lesson_id: submission.assignment_id,
          is_completed: true,
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "enrollment_id, lesson_id",
        },
      );

      if (progressError) {
        console.error("Failed to update progress:", progressError);
        // We don't fail the request, but log it
      }
    }

    // 5. Send Email
    if (shouldSendEmail) {
      const studentEmail = submission?.student?.email || "student@example.com";
      await sendEmail({
        to: studentEmail,
        subject: "Your Assignment was Approved",
        html: `<p>Great news! Your assignment has been approved.</p><p><strong>Feedback:</strong> ${feedback || "Good job!"}</p>`,
      });
      console.log(`Sending approval email to student ${submission.student_id}`);
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("Error approving submission:", error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

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
    if ((userData as any)?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // 2. Get Submission details (to find student, course, lesson)
    const { data: submissionData, error: subError } = await supabase
      .from("assignment_submissions" as any)
      .select("*")
      .eq("id", submissionId)
      .single();

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
      // @ts-ignore
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

    const enrollment = enrollmentData as any;

    if (enrollment) {
      // Upsert progress
      // @ts-ignore
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

    // 5. Send Email (Mock)
    if (sendEmail) {
      // TODO: Integrate with email service
      console.log(`Sending approval email to student ${submission.student_id}`);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error approving submission:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ assessmentId: string }> },
) {
  try {
    const { assessmentId } = await params;
    const body = await request.json();
    const { rubricScores, feedback, status, masteryLevel } = body;

    const supabase = await createClient();

    // 1. Auth Check
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { data: userData } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();
    if (userData?.role !== "admin")
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    // 2. Calculate Overall Score
    const scores = Object.values(rubricScores) as number[];
    const sum = scores.reduce((a, b) => a + b, 0);
    const avg = scores.length > 0 ? sum / scores.length : 0;

    // 3. Update Assessment
    const { data: assessment, error: updateError } = await supabase
      .from("practical_assessments")
      .update({
        rubric_scores: rubricScores,
        admin_feedback: feedback,
        overall_score: avg,
        status: status,
        mastery_level: masteryLevel,
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", assessmentId)
      .select()
      .single();

    if (updateError) throw updateError;

    // 4. Update Competency Record (if approved and competency_id exists)
    if (status === "approved" && assessment.competency_id) {
      // Calculate percentage (assuming 5 is max)
      const percent = (avg / 5) * 100;

      await supabase.from("student_competencies").upsert(
        {
          student_id: assessment.student_id,
          competency_id: assessment.competency_id,
          mastery_level: percent,
          achieved_at: new Date().toISOString(),
          last_assessed_at: new Date().toISOString(),
        },
        {
          onConflict: "student_id, competency_id",
        },
      );
    }

    return NextResponse.json({ success: true, overallScore: avg });
  } catch (error: any) {
    console.error("Error evaluating practical assessment:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

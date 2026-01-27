import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { PracticalAssessment } from "@/types/practical-types";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    // Check authentication using NextAuth
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Use admin client
    const supabase = createAdminClient();

    const { data: userData } = await supabase
      .from("users")
      .select("role")
      .eq("id", session.user.id)
      .single();
    if (!userData || (userData as any).role !== "admin")
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    // Query Params
    const searchParams = request.nextUrl.searchParams;
    const role = searchParams.get("role");
    const status = searchParams.get("status");

    let query = supabase.from("practical_assessments").select("*");

    if (role && role !== "all") {
      query = query.eq("role", role);
    }
    if (status && status !== "all") {
      query = query.eq("status", status);
    }

    query = query.order("submitted_at", { ascending: false });

    const { data, error } = await query;
    if (error) throw error;

    const assessments: PracticalAssessment[] = data.map((item: any) => ({
      id: item.id,
      studentId: item.student_id,
      studentName: "Student", // Simplified
      studentEmail: "student@example.com", // Simplified
      competencyId: item.competency_id,
      competencyName: item.competency_name,
      role: item.role,
      submittedAt: item.submitted_at,
      evidenceUrl: item.evidence_url,
      status: item.status,
      rubricScores: item.rubric_scores,
      overallScore: item.overall_score,
      adminFeedback: item.admin_feedback,
      masteryLevel: item.mastery_level,
      reviewedBy: item.reviewed_by,
      reviewedAt: item.reviewed_at,
    }));

    return NextResponse.json(assessments);
  } catch (error: any) {
    console.error("Error fetching practical assessments:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

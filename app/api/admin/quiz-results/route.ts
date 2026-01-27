import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { QuizAttempt } from "@/types/quiz-types";
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
    const status = searchParams.get("status");
    const courseId = searchParams.get("courseId");

    let query = supabase.from("quiz_attempts").select("*");

    if (status && status !== "all") {
      query = query.eq("status", status);
    }
    if (courseId) {
      query = query.eq("course_id", courseId);
    }

    // Order by date desc
    query = query.order("completed_at", {
      ascending: false,
      nullsFirst: false,
    });

    const { data, error } = await query;
    if (error) throw error;

    const attempts: QuizAttempt[] = data.map((item: any) => ({
      id: item.id,
      quizId: item.quiz_id,
      quizName: "Quiz", // Simplified
      studentId: item.student_id,
      studentName: "Student", // Simplified
      studentEmail: "student@example.com", // Simplified
      courseId: item.course_id,
      courseTitle: "Course", // Simplified
      startedAt: item.started_at,
      completedAt: item.completed_at,
      duration: item.duration,
      totalPoints: item.total_points,
      earnedPoints: item.earned_points,
      percentage: item.percentage,
      status: item.status,
      passingPercentage: item.passing_percentage,
      isPassing: item.is_passing,
      responses: item.responses || [],
    }));

    return NextResponse.json(attempts);
  } catch (error: any) {
    console.error("Error fetching quiz attempts:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

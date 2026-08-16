import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { AssignmentSubmission } from "@/types/assignment-submission-types";
import { requireAdmin } from "@/lib/security/requireAdmin";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { error: authError } = await requireAdmin();
    if (authError) return authError;

    // Use admin client instead of server client (no auth needed)
    const supabase = createAdminClient();

    // Get query params
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");
    const courseId = searchParams.get("courseId");
    const search = searchParams.get("search");

    // Build query - simplified to test
    let query = supabase.from("assignment_submissions").select("*");

    if (status && status !== "all") {
      query = query.eq("status", status);
    }

    if (courseId) {
      query = query.eq("course_id", courseId);
    }

    // Search is trickier with joins, usually needs separate logic or exact match on joined fields
    // For now, simpler implementation:
    if (search) {
      // Supabase basic search on main table fields, or use logical OR if possible
      // But searching joined tables is hard in one go without RPC
      // We'll filter text fields in the main table if any, or rely on client side filter for complex join search if list is small
      // Or search by fileName
      query = query.ilike("file_name", `%${search}%`);
    }

    query = query.order("submitted_at", { ascending: false });

    const { data, error } = await query;

    let practicalQuery = (supabase.from("practical_submissions") as any).select(
      "*, lesson:lessons(id,title,section:sections(course_id,course:courses(title))), student:users(name,email)",
    );

    if (status && status !== "all") {
      practicalQuery = practicalQuery.eq("status", status);
    }

    if (search) {
      practicalQuery = practicalQuery.ilike("file_name", `%${search}%`);
    }

    practicalQuery = practicalQuery.order("submitted_at", { ascending: false });
    const { data: practicalData, error: practicalError } = await practicalQuery;

    if (error) {
      console.error("Error fetching submissions:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (practicalError) {
      console.error("Error fetching practical submissions:", practicalError);
    }

    // Transform data to match interface (simplified for now)
    const submissions: AssignmentSubmission[] = data.map((item: any) => ({
      id: item.id,
      assignmentId: item.assignment_id,
      assignmentTitle: "Assignment", // Simplified
      studentId: item.student_id,
      studentName: "Student", // Simplified
      studentEmail: "student@example.com", // Simplified
      courseId: item.course_id,
      courseTitle: "Course", // Simplified
      submittedFileUrl: item.submitted_file_url,
      fileName: item.file_name,
      submittedContent: item.submitted_content,
      submittedAt: item.submitted_at,
      status: item.status,
      attemptNumber: item.attempt_number,
      maxAttempts: 3, // hardcoded or fetched from assignment config
      adminFeedback: item.admin_feedback,
      adminId: item.admin_id,
      reviewedAt: item.reviewed_at,
      submissionHistory: item.submission_history || [],
    }));

    const practicalSubmissions: AssignmentSubmission[] = (practicalData || [])
      .filter((item: any) => !courseId || item.lesson?.section?.course_id === courseId)
      .map((item: any) => ({
        id: item.id,
        assignmentId: item.lesson_id,
        assignmentTitle: item.lesson?.title || "Practical assessment",
        studentId: item.student_id,
        studentName: item.student?.name || "Student",
        studentEmail: item.student?.email || "student@example.com",
        courseId: item.lesson?.section?.course_id || "",
        courseTitle: item.lesson?.section?.course?.title || "Course",
        submittedFileUrl: item.file_url,
        fileName: item.file_name,
        submittedContent: item.notes,
        submittedAt: item.submitted_at,
        status: item.status,
        attemptNumber: item.attempt_number,
        maxAttempts: 999,
        adminFeedback: item.admin_feedback,
        adminId: item.reviewed_by,
        reviewedAt: item.reviewed_at,
        submissionHistory: [],
      }));

    return NextResponse.json([...submissions, ...practicalSubmissions]);
  } catch (error: any) {
    console.error("Unexpected error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

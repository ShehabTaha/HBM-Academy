import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/security/requireAdmin";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ studentId: string }> },
) {
  const { error: authError } = await requireAdmin();
  if (authError) return authError;

  const { studentId } = await params;
  const supabase = createAdminClient();

  // Fetch Student
  const { data: studentData, error } = await supabase
    .from("users" as any)
    .select("*")
    .eq("id", studentId)
    .single();

  const student = studentData as any;

  if (error || !student) {
    return NextResponse.json({ error: "Student not found" }, { status: 404 });
  }

  // Fetch Enrollments with Course Titles
  // Assuming courses table exists and has title.
  const { data: enrollmentsData } = await supabase
    .from("enrollments" as any)
    .select("*, courses(title)") // Join properly if FK exists
    .eq("student_id", studentId);

  const enrollments = enrollmentsData as any;

  // Fetch Certificates
  const { data: certificates } = await supabase
    .from("certificates")
    .select("*") // Maybe join enrollment -> course to get title
    .in("enrollment_id", enrollments?.map((e: any) => e.id) || []);
  // This IN query logic is tricky if no enrollments.
  // Better: certificates usually link to enrollment.
  // Implementation details can vary. I'll do a simple select.

  // Fetch Login History
  const { data: login_history } = await supabase
    .from("login_attempts")
    .select("created_at, ip_address")
    .eq("email", student.email)
    .order("created_at", { ascending: false })
    .limit(10);

  return NextResponse.json({
    student,
    enrollments:
      enrollments?.map((e: any) => ({
        ...e,
        course_title: e.courses?.title || "Unknown Course",
      })) || [],
    certificates: certificates || [],
    login_history:
      login_history?.map((l: any) => ({
        timestamp: l.created_at,
        ip_address: l.ip_address,
      })) || [],
  });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ studentId: string }> },
) {
  const { error: authError } = await requireAdmin();
  if (authError) return authError;

  const { studentId } = await params;
  const supabase = createAdminClient();

  const body = await req.json();
  const { name, email, bio } = body;

  const { data, error } = await supabase
    .from("users")
    // @ts-ignore
    .update({ name, email, bio, updated_at: new Date().toISOString() })
    .eq("id", studentId)
    .select()
    .single();

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ student: data });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ studentId: string }> },
) {
  const { error: authError } = await requireAdmin();
  if (authError) return authError;

  const { studentId } = await params;
  const supabase = createAdminClient();

  // Soft delete
  const { error } = await supabase
    .from("users")
    // @ts-ignore
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", studentId);

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ message: "Student deleted" });
}

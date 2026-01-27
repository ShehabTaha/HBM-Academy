import { createAdminClient } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> },
) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if ((session.user as { role?: string }).role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { userId } = await params;
  const supabase = createAdminClient();

  // Fetch user with related data
  const { data: user, error: userError } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .single();

  if (userError || !user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Fetch enrollments with course details
  const { data: enrollments } = await supabase
    .from("enrollments")
    .select(
      `
      id,
      enrolled_at,
      completed_at,
      progress_percentage,
      courses (
        id,
        title
      )
    `,
    )
    .eq("student_id", userId);

  // Fetch certificates through enrollments
  const { data: certificates } = await supabase
    .from("certificates")
    .select(
      `
      id,
      issued_at,
      enrollments!inner (
        student_id,
        courses (
          title
        )
      )
    `,
    )
    .eq("enrollments.student_id", userId);

  // Fetch login history (if you have a login_logs table)
  const { data: loginHistory } = await supabase
    .from("login_logs")
    .select("timestamp, ip_address")
    .eq("user_id", userId)
    .order("timestamp", { ascending: false })
    .limit(10);

  console.log("Raw data from DB:", {
    enrollmentsRaw: enrollments,
    certificatesRaw: certificates,
    loginHistoryRaw: loginHistory,
  });

  // Transform enrollments to flatten course data
  const transformedEnrollments = enrollments?.map((e: any) => ({
    id: e.id,
    enrolled_at: e.enrolled_at,
    completed_at: e.completed_at,
    progress_percentage: e.progress_percentage,
    course_title: e.courses?.title || "Unknown Course",
  }));

  // Transform certificates to flatten course data
  const transformedCertificates = certificates?.map((c: any) => ({
    id: c.id,
    issued_at: c.issued_at,
    course_title: c.enrollments?.courses?.title || "Unknown Course",
  }));

  console.log("User Details API Debug:", {
    userId,
    enrollmentsCount: transformedEnrollments?.length,
    certificatesCount: transformedCertificates?.length,
    loginHistoryCount: loginHistory?.length,
  });

  return NextResponse.json({
    user,
    enrollments: transformedEnrollments || [],
    certificates: transformedCertificates || [],
    login_history: loginHistory || [],
  });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> },
) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if ((session.user as { role?: string }).role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { userId } = await params;
  const body = await req.json();

  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("users")
    .update(body)
    .eq("id", userId)
    .select()
    .single();

  if (error) {
    console.error("Update user error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ user: data });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> },
) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if ((session.user as { role?: string }).role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { userId } = await params;
  const supabase = createAdminClient();

  // Soft delete by setting deleted_at timestamp
  const { error } = await supabase
    .from("users")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", userId);

  if (error) {
    console.error("Delete user error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

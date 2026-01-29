import { createAdminClient } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/security/requireAdmin";

export async function GET(req: NextRequest) {
  const { error: authError } = await requireAdmin();
  if (authError) return authError;

  // Use admin client to bypass RLS policies
  const supabase = createAdminClient();

  // 2. Parse Query Params
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const search = searchParams.get("search") || "";
  const statusFilter = searchParams.get("status");

  const offset = (page - 1) * limit;

  // 3. Build Query for students only (exclude admins and lecturers)
  // Start with a basic query
  let query = supabase
    .from("users")
    .select("*, enrollments(count)", { count: "exact" })
    .eq("role", "student");

  // Handle Deleted/Suspended Status
  if (statusFilter === "suspended") {
    // Explicitly ask for deleted users
    query = query.not("deleted_at", "is", null);
  } else {
    // Default: Only active (non-deleted) users
    query = query.is("deleted_at", null);
  }

  if (search) {
    query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
  }

  if (searchParams.get("verified")) {
    const isVerified = searchParams.get("verified") === "true";
    query = query.eq("is_email_verified", isVerified);
  }

  // Sorting
  const sortBy = searchParams.get("sortBy") || "created_at";
  const sortOrder = searchParams.get("sortOrder") === "asc";
  query = query.order(sortBy, { ascending: sortOrder });

  // Pagination
  query = query.range(offset, offset + limit - 1);

  const { data: usersData, error, count } = await query;

  console.log("Users API Debug:", {
    count,
    usersDataLength: usersData?.length,
    error: error?.message,
    params: { page, limit, search, statusFilter },
  });

  if (error) {
    console.error("Supabase query error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // 4. Fetch Stats (Parallel) - Students only
  const statsQuery = async () => {
    const { count: total } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true })
      .eq("role", "student")
      .is("deleted_at", null);

    // Consider users created in the last 30 days as active
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const { count: active } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true })
      .eq("role", "student")
      .is("deleted_at", null)
      .gte("created_at", thirtyDaysAgo.toISOString());

    const { count: enrolls } = await supabase
      .from("enrollments")
      .select("*", { count: "exact", head: true });

    const { count: verified } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true })
      .eq("role", "student")
      .eq("is_email_verified", true);

    return {
      total_users: total || 0,
      active_users: active || 0,
      inactive_users: (total || 0) - (active || 0),
      total_enrollments: enrolls || 0,
      avg_progress: 0,
      verified_percentage: total
        ? Math.round(((verified || 0) / total) * 100)
        : 0,
    };
  };

  const stats = await statsQuery();

  // 5. Transform Data
  const users = usersData.map(
    (u: {
      enrollments?: { count: number }[];
      deleted_at: string | null;
      created_at: string;
      [key: string]: unknown;
    }) => ({
      ...u,
      courses_enrolled:
        u.enrollments && u.enrollments.length > 0 ? u.enrollments[0].count : 0,
      courses_completed: 0,
      status: u.deleted_at
        ? "suspended"
        : new Date(u.created_at) >
            new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          ? "active"
          : "inactive",
    }),
  );

  return NextResponse.json({
    users: users,
    pagination: {
      total: count || 0,
      page,
      limit,
      pages: Math.ceil((count || 0) / limit),
    },
    stats,
  });
}

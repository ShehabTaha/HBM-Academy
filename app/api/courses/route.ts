import { NextRequest, NextResponse } from "next/server";
import { CourseService } from "@/lib/services/courses.service";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/courses
 * List courses with filters
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const searchParams = request.nextUrl.searchParams;

    // Get filters from query params
    const filters = {
      instructor_id: searchParams.get("instructor_id") || undefined,
      category: searchParams.get("category") || undefined,
      level: searchParams.get("level") as any,
      is_published:
        searchParams.get("is_published") === "true"
          ? true
          : searchParams.get("is_published") === "false"
            ? false
            : undefined,
      search: searchParams.get("search") || undefined,
    };

    // Get pagination params
    const pagination = {
      page: parseInt(searchParams.get("page") || "1"),
      limit: parseInt(searchParams.get("limit") || "20"),
    };

    const { courses, total, error } = await CourseService.listCourses(
      filters,
      pagination,
    );

    if (error) {
      return NextResponse.json({ error }, { status: 400 });
    }

    return NextResponse.json({
      courses,
      total,
      page: pagination.page,
      limit: pagination.limit,
      totalPages: Math.ceil(total / pagination.limit),
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch courses" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/courses
 * Create a new course
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    let userId = session?.user?.id;
    let userRole = session?.user?.role;
    let debugError = "";

    // Development Bypass: If no session, try to get a fallback user
    if (!userId && process.env.NODE_ENV === "development") {
      console.log("Dev mode: Attempting auth bypass...");

      // Strategy 1: Try Admin Client (Needs SUPABASE_SERVICE_ROLE_KEY)
      try {
        const supabaseAdmin = createAdminClient();
        console.log("Dev mode: Admin client created, checking users...");

        const { data: fallbackUserRaw } = await (
          supabaseAdmin.from("users") as any
        )
          .select("*")
          .or("role.eq.admin,role.eq.lecturer")
          .limit(1)
          .single();

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const fallbackUser = fallbackUserRaw as any;

        if (fallbackUser) {
          userId = fallbackUser.id;
          userRole = fallbackUser.role;
          console.warn(
            "Dev mode: Using fallback user (Admin strategy)",
            userId,
          );
        } else {
          // Create a dev admin if none exists
          console.warn(
            "Dev mode: No admin found, creating temporary dev admin",
          );
          const { data: newAdminRaw, error: createError } = await (
            supabaseAdmin.from("users") as any
          )
            .insert({
              email: "admin@example.com",
              name: "Dev Admin",
              role: "admin",
              password: "$2a$10$dummyhashdummyhashdummyhashdummyhash",
              is_email_verified: true,
            } as any)
            .select()
            .single();

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const newAdmin = newAdminRaw as any;

          if (newAdmin) {
            userId = newAdmin.id;
            userRole = newAdmin.role;
            console.warn("Dev mode: Created and using new dev admin");
          } else {
            console.error("Failed to create dev admin", createError);
            debugError = `Admin creation failed: ${createError.message}`;
          }
        }
      } catch (adminError) {
        console.warn(
          "Dev mode: Admin client failed (likely missing Service Key). Trying Anon client.",
          adminError,
        );
        debugError = "Admin client failed (missing key?)";

        // Strategy 2: Try Anon Client (Works if RLS is loose)
        try {
          const supabase = await createClient();
          const { data: fallbackUserRaw, error: anonError } = await (
            supabase.from("users") as any
          )
            .select("id, role")
            .or("role.eq.admin,role.eq.lecturer")
            .limit(1)
            .single();

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const fallbackUser = fallbackUserRaw as any;

          if (fallbackUser) {
            userId = fallbackUser.id;
            userRole = fallbackUser.role;
            console.warn(
              "Dev mode: Using fallback user (Anon strategy)",
              userId,
            );
          } else {
            console.warn(
              "Dev mode: Anon client found no suitable user or failed",
              anonError,
            );
            debugError += ` | Anon lookup failed: ${anonError?.message || "No user found"}`;
          }
        } catch (e) {
          console.error("Dev mode: Anon client crashed", e);
          debugError += " | Anon client crashed";
        }
      }

      // Strategy 3: Extreme Fail-safe (Ghost User)
      // If we still have no user, but we are in dev mode, just make one up.
      // This allows the API to proceed even if DB is empty and keys are missing.
      // Note: This might fail at DB level if foreign key constraints exist on instructor_id.
      if (!userId) {
        console.warn("Dev mode: All user lookups failed. Using GHOST ID.");
        userId = "00000000-0000-0000-0000-000000000000"; // Ghost UUID
        userRole = "admin";
      }
    }

    if (!userId) {
      return NextResponse.json(
        {
          error: `Unauthorized: Development auth bypass failed. ${debugError}`,
        },
        { status: 401 },
      );
    }

    // Check if user is lecturer or admin
    if (userRole !== "lecturer" && userRole !== "admin") {
      return NextResponse.json(
        {
          error: `Forbidden: User role not allowed. Current role: '${userRole}'`,
          debug: { userId, userRole },
        },
        { status: 403 },
      );
    }

    const body = await request.json();

    const { course, error } = await CourseService.createCourse({
      ...body,
      instructor_id: userId, // Use authenticated user ID
    });

    if (error) {
      return NextResponse.json({ error }, { status: 400 });
    }

    return NextResponse.json({ course }, { status: 201 });
  } catch (error) {
    console.error("Create course error:", error);
    return NextResponse.json(
      {
        error:
          "Failed to create course: " +
          (error instanceof Error ? error.message : String(error)),
      },
      { status: 500 },
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { CourseService } from "@/lib/services/courses.service";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { requireAdmin } from "@/lib/security/requireAdmin";

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
    const { user, error: authError } = await requireAdmin();
    if (authError) return authError;

    const body = await request.json();

    const { course, error } = await CourseService.createCourse({
      ...body,
      instructor_id: user.id, // Use authenticated user ID
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

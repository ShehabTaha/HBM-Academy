import { NextRequest, NextResponse } from "next/server";
import { UserService } from "@/lib/services/users.service";
import { CourseService } from "@/lib/services/courses.service";

import { requireAdmin } from "@/lib/security/requireAdmin";

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAdmin(req);
    if (!auth.authorized) return auth.response;

    const [usersResult, coursesResult] = await Promise.all([
      UserService.countUsers("student"),
      CourseService.countActiveCourses(),
    ]);

    if (usersResult.error) {
      console.error("Error fetching user count:", usersResult.error);
    }

    if (coursesResult.error) {
      console.error("Error fetching course count:", coursesResult.error);
    }

    return NextResponse.json({
      totalUsers: usersResult.count || 0,
      activeCourses: coursesResult.count || 0,
    });
  } catch (error) {
    console.error("Stats API error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

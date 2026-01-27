import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check admin role
  if ((session.user as { role?: string }).role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Return mock analytics data matching UserAnalytics type
  return NextResponse.json({
    user_growth: [
      { date: "2024-01", new_users: 20 },
      { date: "2024-02", new_users: 35 },
      { date: "2024-03", new_users: 28 },
    ],
    enrollment_status: [
      { status: "Active", count: 65 },
      { status: "Completed", count: 23 },
      { status: "Dropped", count: 5 },
    ],
    verification_status: {
      verified: 78,
      unverified: 15,
    },
    course_distribution: [
      { course_title: "Web Dev", count: 45 },
      { course_title: "React Advanced", count: 30 },
      { course_title: "Python Basics", count: 18 },
    ],
  });
}

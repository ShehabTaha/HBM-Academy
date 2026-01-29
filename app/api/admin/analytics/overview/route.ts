/**
 * Analytics Overview API Route
 * Returns executive summary KPIs
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/security/requireAdmin";
import { createClient } from "@supabase/supabase-js";

// Use service role key to bypass RLS for admin analytics
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function GET(request: NextRequest) {
  try {
    // SECURITY: Verify admin access
    const { error: authError } = await requireAdmin();
    if (authError) return authError;

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const dateRange = searchParams.get("dateRange") || "30d";
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // Parse courses filter
    const coursesParam = searchParams.get("courses");
    const courses = coursesParam ? coursesParam.split(",") : [];

    // Calculate date range
    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate ? new Date(startDate) : new Date();
    if (!startDate) {
      // Default date range logic
      switch (dateRange) {
        case "7d":
          start.setDate(end.getDate() - 7);
          break;
        case "90d":
          start.setDate(end.getDate() - 90);
          break;
        case "6m":
          start.setMonth(end.getMonth() - 6);
          break;
        case "1y":
          start.setFullYear(end.getFullYear() - 1);
          break;
        default:
          start.setDate(end.getDate() - 30);
      }
    }

    // Initialize values
    let totalStudents = 0;
    let activeUsers = 0;
    let completionRate = 0;
    let passRate = 0;
    let certsCount = 0;
    let attendanceRate = 0;
    let satisfactionJson = 0;

    // --- 1. Total Students ---
    try {
      if (courses.length > 0) {
        // Count distinct students in selected courses
        const { count, error } = await supabase
          .from("enrollments")
          .select("student_id", { count: "exact", head: true })
          .in("course_id", courses);

        if (!error) totalStudents = count || 0;
      } else {
        const { count, error } = await supabase
          .from("users")
          .select("*", { count: "exact", head: true })
          .eq("role", "student")
          .is("deleted_at", null); // Ensure we only count active students

        if (!error) totalStudents = count || 0;
      }
    } catch (e) {
      console.error("Error fetching total students:", e);
    }

    // --- 2. Active Users (Last 7 Days) ---
    try {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      if (courses.length > 0) {
        // Logic: Get enrollments for these courses, then check if linked users were active
        // Using two steps to avoid complex join issues
        const { data: enrollmentsData } = await supabase
          .from("enrollments")
          .select("student_id")
          .in("course_id", courses);

        if (enrollmentsData && enrollmentsData.length > 0) {
          const studentIds = enrollmentsData.map((e) => e.student_id);
          // Chunk if too many, but for now simple
          const { count, error } = await supabase
            .from("users")
            .select("*", { count: "exact", head: true })
            .in("id", studentIds)
            .gte("last_active_at", sevenDaysAgo.toISOString());

          if (!error) activeUsers = count || 0;
        }
      } else {
        // Global active students
        const { count, error } = await supabase
          .from("users")
          .select("*", { count: "exact", head: true })
          .eq("role", "student")
          .gte("last_active_at", sevenDaysAgo.toISOString()); // Note: check if last_active_at exists on users

        if (!error) activeUsers = count || 0;
        // If error (e.g. column doesn't exist), we ignore and leave as 0
      }
    } catch (e) {
      console.error("Error fetching active users:", e);
    }

    // --- 3. Completion Rate ---
    try {
      let query = supabase
        .from("enrollments")
        .select("id, completed_at")
        .gte("enrolled_at", start.toISOString())
        .lte("enrolled_at", end.toISOString());

      if (courses.length > 0) {
        query = query.in("course_id", courses);
      }

      const { data: enrollments, error } = await query;

      if (!error && enrollments && enrollments.length > 0) {
        completionRate =
          (enrollments.filter((e) => e.completed_at).length /
            enrollments.length) *
          100;
      }
    } catch (e) {
      console.error("Error fetching completion rate:", e);
    }

    // --- 4. Assessment Pass Rate ---
    try {
      // Simplification: Query assessments first to filter by course if needed
      let assessmentIds: string[] = [];
      if (courses.length > 0) {
        const { data: assessmentData } = await supabase
          .from("assessments")
          .select("id")
          .in("course_id", courses);

        if (assessmentData) assessmentIds = assessmentData.map((a) => a.id);

        // If no assessments found for selected courses, skip
        if (assessmentIds.length === 0) passRate = 0;
        else {
          // Query attempts
          const { data: attempts, error } = await supabase
            .from("assessment_attempts")
            .select("status")
            .in("assessment_id", assessmentIds)
            .gte("attempted_at", start.toISOString())
            .lte("attempted_at", end.toISOString());

          if (!error && attempts && attempts.length > 0) {
            const passed = attempts.filter(
              (a: any) => a.status === "passed",
            ).length;
            passRate = (passed / attempts.length) * 100;
          }
        }
      } else {
        // Global
        const { data: attempts, error } = await supabase
          .from("assessment_attempts")
          .select("status")
          .gte("attempted_at", start.toISOString())
          .lte("attempted_at", end.toISOString());

        if (!error && attempts && attempts.length > 0) {
          const passed = attempts.filter(
            (a: any) => a.status === "passed",
          ).length;
          passRate = (passed / attempts.length) * 100;
        }
      }
    } catch (e) {
      console.error("Error fetching pass rate:", e);
    }

    // --- 5. Certifications ---
    try {
      // Check if table exists by simple query
      const certsQuery = supabase
        .from("student_certifications")
        .select("id", { count: "exact", head: true })
        .eq("status", "passed")
        .gte("issued_at", start.toISOString())
        .lte("issued_at", end.toISOString());

      const { count, error } = await certsQuery;
      if (!error) certsCount = count || 0;
    } catch (e) {
      // Table might not exist
      console.error("Error fetching certifications:", e);
    }

    // --- 6. Attendance ---
    try {
      const attendanceQuery = supabase
        .from("attendance")
        .select("status")
        .gte("session_date", start.toISOString())
        .lte("session_date", end.toISOString());

      const { data: attendanceData, error } = await attendanceQuery;

      if (!error && attendanceData && attendanceData.length > 0) {
        const present = attendanceData.filter(
          (a: any) => a.status === "present",
        ).length;
        attendanceRate = (present / attendanceData.length) * 100;
      }
    } catch (e) {
      console.error("Error fetching attendance:", e);
    }

    // --- 7. Satisfaction ---
    try {
      // Using course_completions as proxy
      let satisfactionQuery = supabase
        .from("course_completions")
        .select("satisfaction_rating")
        .gte("completed_at", start.toISOString())
        .lte("completed_at", end.toISOString());

      if (courses.length > 0) {
        satisfactionQuery = satisfactionQuery.in("course_id", courses);
      }

      const { data: satisfactionData, error } = await satisfactionQuery;

      if (!error && satisfactionData && satisfactionData.length > 0) {
        // Filter out nulls
        const ratings = satisfactionData
          .filter((i: any) => i.satisfaction_rating)
          .map((i: any) => i.satisfaction_rating);
        if (ratings.length > 0) {
          const totalScore = ratings.reduce(
            (sum: number, r: number) => sum + r,
            0,
          );
          satisfactionJson = totalScore / ratings.length;
        }
      }
    } catch (e) {
      console.error("Error fetching satisfaction:", e);
    }

    // Prepare response
    const response = {
      data: {
        totalStudents: {
          value: totalStudents,
          target: 0,
          percentToTarget: 100,
          trend: {
            direction: "stable",
            percentChange: 0,
            comparisonPeriod: "previous period",
          },
          label: "Total Students",
          icon: "users",
        },
        activeUsers7d: {
          value: activeUsers,
          target: 0,
          percentToTarget: 100,
          trend: {
            direction: "stable",
            percentChange: 0,
            comparisonPeriod: "previous 7 days",
          },
          label: "Active Users",
          icon: "user-check",
        },
        courseCompletionRate: {
          value: completionRate,
          target: 85,
          percentToTarget: (completionRate / 85) * 100,
          trend: {
            direction: "stable",
            percentChange: 0,
            comparisonPeriod: "previous period",
          },
          label: "Completion Rate",
          icon: "graduation-cap",
          unit: "percentage",
        },
        assessmentPassRate: {
          value: passRate,
          target: 85,
          percentToTarget: (passRate / 85) * 100,
          trend: {
            direction: "stable",
            percentChange: 0,
            comparisonPeriod: "previous period",
          },
          label: "Pass Rate",
          icon: "clipboard-check",
          unit: "percentage",
        },
        certificationsIssued: {
          value: certsCount,
          target: 0,
          percentToTarget: 100,
          trend: {
            direction: "stable",
            percentChange: 0,
            comparisonPeriod: "",
          },
          label: "Certifications",
          icon: "award",
        },
        attendanceRate: {
          value: attendanceRate,
          target: 95,
          percentToTarget: (attendanceRate / 95) * 100,
          trend: {
            direction: "stable",
            percentChange: 0,
            comparisonPeriod: "",
          },
          label: "Attendance",
          icon: "calendar",
          unit: "percentage",
        },
        studentSatisfaction: {
          value: satisfactionJson,
          target: 4.6,
          percentToTarget: (satisfactionJson / 4.6) * 100,
          trend: {
            direction: "stable",
            percentChange: 0,
            comparisonPeriod: "",
          },
          label: "Satisfaction",
          icon: "star",
          unit: "rating",
        },
        lastUpdated: new Date(),
      },
      timestamp: new Date(),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Analytics API error:", error);
    // Return a valid empty response instead of 500 to prevent crash, but logged the error
    return NextResponse.json(
      {
        data: {
          totalStudents: {
            value: 0,
            label: "Total Students",
            icon: "users",
            trend: {},
          },
          activeUsers7d: {
            value: 0,
            label: "Active Users",
            icon: "user-check",
            trend: {},
          },
          courseCompletionRate: {
            value: 0,
            label: "Completion Rate",
            icon: "graduation-cap",
            unit: "percentage",
            trend: {},
          },
          assessmentPassRate: {
            value: 0,
            label: "Pass Rate",
            icon: "clipboard-check",
            unit: "percentage",
            trend: {},
          },
          certificationsIssued: {
            value: 0,
            label: "Certifications",
            icon: "award",
            trend: {},
          },
          attendanceRate: {
            value: 0,
            label: "Attendance",
            icon: "calendar",
            unit: "percentage",
            trend: {},
          },
          studentSatisfaction: {
            value: 0,
            label: "Satisfaction",
            icon: "star",
            unit: "rating",
            trend: {},
          },
          lastUpdated: new Date(),
        },
        timestamp: new Date(),
        error: "Partial data due to error", // Optional info for client
      },
      { status: 200 }, // Return 200 with fallback data
    );
  }
}

/**
 * Competencies API Route
 * Fetches competency mastery metrics
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { createClient } from "@supabase/supabase-js";
import { CompetencyData } from "@/lib/analytics/types";

// Create Supabase client with service role for admin access
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function GET(request: NextRequest) {
  try {
    // 1. Verify admin access
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const dateRange = searchParams.get("dateRange") || "30d";
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // Parse courses filter instead of roles
    const coursesParam = searchParams.get("courses");
    const courses = coursesParam ? coursesParam.split(",") : [];

    // Calculate dates
    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate ? new Date(startDate) : new Date();

    if (!startDate) {
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
          start.setDate(end.getDate() - 30); // 30d
      }
    }

    // 3. Fetch data from Supabase - ROBUST METHOD
    // Step A: Get Student Competencies (Base Data)
    const { data: rawCompetenciesData, error: compError } = await supabase
      .from("student_competencies")
      .select(
        `
        mastery_level,
        days_to_master,
        last_assessed_at,
        student_id,
        competencies!inner (
          id,
          name,
          category,
          is_critical
        )
      `,
      )
      .gte("last_assessed_at", start.toISOString())
      .lte("last_assessed_at", end.toISOString());

    if (compError) {
      console.error("Supabase error fetching student_competencies:", compError);
      throw compError;
    }

    // Step B: Filter and Enrich with Course & Role Data
    const studentIds = Array.from(
      new Set((rawCompetenciesData || []).map((x: any) => x.student_id)),
    );

    // Fetch enrollments for these students to map Student -> Courses AND Roles
    let enrollmentsQuery = supabase
      .from("enrollments")
      .select("student_id, course_id, role_type, courses(id, title)")
      .in("student_id", studentIds);

    if (courses.length > 0) {
      enrollmentsQuery = enrollmentsQuery.in("course_id", courses);
    }

    const { data: enrollmentsData, error: enrollError } =
      await enrollmentsQuery;

    if (enrollError) {
      console.error("Supabase error fetching enrollments:", enrollError);
    }

    // Maps
    const studentCoursesMap = new Map<
      string,
      Array<{ id: string; title: string }>
    >();
    const studentRolesMap = new Map<string, string>(); // Student -> Primary/Recent Role

    if (enrollmentsData) {
      enrollmentsData.forEach((e: any) => {
        // Map courses
        if (!studentCoursesMap.has(e.student_id)) {
          studentCoursesMap.set(e.student_id, []);
        }
        if (e.courses) {
          studentCoursesMap.get(e.student_id)?.push({
            id: e.courses.id,
            title: e.courses.title,
          });
        }

        // Map roles (use first encountered for simplicity if multiple)
        if (!studentRolesMap.has(e.student_id) && e.role_type) {
          studentRolesMap.set(e.student_id, e.role_type);
        }
      });
    }

    // 4. Process Data (InMemory)

    const overallStats = {
      totalMastery: 0,
      count: 0,
      criticalMasteredCount: 0,
      criticalTotalCount: 0,
      totalDays: 0,
      daysCount: 0,
    };

    const competencyMap = new Map();
    const heatmapData: any[] = [];

    // New structures
    const trendMap = new Map<
      string,
      { [key: string]: { sum: number; count: number } }
    >();
    const roleMap = new Map<
      string,
      { [key: string]: { sum: number; count: number } }
    >();
    const distributionMap = {
      mastery: 0,
      proficient: 0,
      needsAttention: 0,
    };

    (rawCompetenciesData || []).forEach((item: any) => {
      const comp = item.competencies;
      const studentId = item.student_id;

      let studentCourses = studentCoursesMap.get(studentId) || [];

      // Filter check
      if (courses.length > 0 && studentCourses.length === 0) {
        return;
      }

      const mastery = item.mastery_level || 0;

      // --- Overall Stats ---
      overallStats.totalMastery += mastery;
      overallStats.count++;

      if (comp.is_critical) {
        overallStats.criticalTotalCount++;
        if (mastery >= 80) overallStats.criticalMasteredCount++;
      }

      if (item.days_to_master) {
        overallStats.totalDays += item.days_to_master;
        overallStats.daysCount++;
      }

      // --- Per Competency Stats ---
      if (!competencyMap.has(comp.id)) {
        competencyMap.set(comp.id, {
          id: comp.id,
          name: comp.name,
          category: comp.category,
          isCritical: comp.is_critical,
          totalMastery: 0,
          count: 0,
          masteryCount: 0,
          daysSum: 0,
          daysCount: 0,
        });
      }

      const cStats = competencyMap.get(comp.id);
      cStats.totalMastery += mastery;
      cStats.count++;
      if (mastery >= 80) cStats.masteryCount++;
      if (item.days_to_master) {
        cStats.daysSum += item.days_to_master;
        cStats.daysCount++;
      }

      // --- Heatmap Data ---
      if (studentCourses.length > 0) {
        studentCourses.forEach((course) => {
          heatmapData.push({
            competency: comp.name,
            course: course.title,
            masteryRate: mastery,
          });
        });
      }

      // --- Trend Data (Bucketed by Month) ---
      const date = new Date(item.last_assessed_at);
      const monthKey = date.toLocaleString("default", { month: "short" }); // "Jan", "Feb"

      if (!trendMap.has(monthKey)) {
        trendMap.set(monthKey, {});
      }
      const monthBucket = trendMap.get(monthKey)!;

      // Competency specific
      if (!monthBucket[comp.name])
        monthBucket[comp.name] = { sum: 0, count: 0 };
      monthBucket[comp.name].sum += mastery;
      monthBucket[comp.name].count++;

      // Average
      if (!monthBucket["Average Mastery"])
        monthBucket["Average Mastery"] = { sum: 0, count: 0 };
      monthBucket["Average Mastery"].sum += mastery;
      monthBucket["Average Mastery"].count++;

      // --- Role Data ---
      const role = studentRolesMap.get(studentId);
      if (role) {
        // Format role: fb_service -> F&B Service
        const formattedRole = role
          .split("_")
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" ");

        if (!roleMap.has(comp.name)) {
          roleMap.set(comp.name, {});
        }
        const compRoleBucket = roleMap.get(comp.name)!;

        if (!compRoleBucket[formattedRole])
          compRoleBucket[formattedRole] = { sum: 0, count: 0 };
        compRoleBucket[formattedRole].sum += mastery;
        compRoleBucket[formattedRole].count++;
      }

      // --- Distribution Data ---
      if (mastery >= 80) distributionMap.mastery++;
      else if (mastery >= 60) distributionMap.proficient++;
      else distributionMap.needsAttention++;
    });

    // Format competencies list
    const competencies = Array.from(competencyMap.values()).map((c) => ({
      id: c.id,
      name: c.name,
      category: c.category,
      isCritical: c.isCritical,
      masteryPercentage: c.count > 0 ? (c.masteryCount / c.count) * 100 : 0,
      averageDaysToMastery: c.daysCount > 0 ? c.daysSum / c.daysCount : 0,
      studentsAttempted: c.count,
      studentsMastered: c.masteryCount,
      trend: "stable",
      colorCode:
        (c.masteryCount / c.count) * 100 >= 80
          ? "green"
          : (c.masteryCount / c.count) * 100 >= 60
            ? "yellow"
            : "red",
    }));

    // Aggregate heatmap
    const heatmapAgg = new Map();
    heatmapData.forEach((p) => {
      const key = `${p.competency}|${p.course}`;
      if (!heatmapAgg.has(key)) {
        heatmapAgg.set(key, { sum: 0, count: 0 });
      }
      const agg = heatmapAgg.get(key);
      agg.sum += p.masteryRate;
      agg.count++;
    });

    const finalHeatmapData = Array.from(heatmapAgg.entries()).map(
      ([key, val]) => {
        const [competency, course] = key.split("|");
        return {
          competency,
          course,
          masteryRate: val.sum / val.count,
        };
      },
    );

    // Process Trend Data
    const monthOrder = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const trendData = Array.from(trendMap.entries())
      .sort((a, b) => monthOrder.indexOf(a[0]) - monthOrder.indexOf(b[0]))
      .map(([month, data]) => {
        const row: any = { month };
        Object.keys(data).forEach((key) => {
          row[key] = Math.round(data[key].sum / data[key].count);
        });
        return row;
      });

    // Process Role Comparison Data
    const roleComparisonData = Array.from(roleMap.entries()).map(
      ([competency, roles]) => {
        const row: any = { competency };
        Object.keys(roles).forEach((role) => {
          row[role] = Math.round(roles[role].sum / roles[role].count);
        });
        return row;
      },
    );

    // Process Mastery Distribution
    const totalD =
      distributionMap.mastery +
      distributionMap.proficient +
      distributionMap.needsAttention;
    const masteryDistribution = [
      {
        level: "Mastery",
        studentCount: distributionMap.mastery,
        percentage: totalD
          ? Math.round((distributionMap.mastery / totalD) * 100)
          : 0,
        color: "#10b981",
      }, // green
      {
        level: "Proficient",
        studentCount: distributionMap.proficient,
        percentage: totalD
          ? Math.round((distributionMap.proficient / totalD) * 100)
          : 0,
        color: "#f59e0b",
      }, // yellow
      {
        level: "Needs Attention",
        studentCount: distributionMap.needsAttention,
        percentage: totalD
          ? Math.round((distributionMap.needsAttention / totalD) * 100)
          : 0,
        color: "#ef4444",
      }, // red
    ];

    const responseData: CompetencyData = {
      competencies,
      overallMasteryRate:
        overallStats.count > 0
          ? overallStats.totalMastery / overallStats.count
          : 0,
      criticalCompetenciesMastered:
        overallStats.criticalTotalCount > 0
          ? (overallStats.criticalMasteredCount /
              overallStats.criticalTotalCount) *
            100
          : 0,
      averageDaysToMastery:
        overallStats.daysCount > 0
          ? overallStats.totalDays / overallStats.daysCount
          : 0,
      heatmapData: finalHeatmapData,
      // New Data
      trendData,
      roleComparisonData,
      masteryDistribution,
    };

    return NextResponse.json({
      data: responseData,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error("Competency API Error:", error);
    return NextResponse.json({
      data: {
        competencies: [],
        overallMasteryRate: 0,
        criticalCompetenciesMastered: 0,
        averageDaysToMastery: 0,
        heatmapData: [],
        trendData: [],
        roleComparisonData: [],
        masteryDistribution: [],
      },
      timestamp: new Date(),
    });
  }
}

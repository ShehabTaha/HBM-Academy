/**
 * KPI Cards Component
 * 9 Executive summary metric cards
 */

"use client";

import {
  Users,
  UserCheck,
  GraduationCap,
  ClipboardCheck,
  Award,
  Calendar,
  Star,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnalyticsOverview } from "@/lib/analytics/types";
import {
  formatMetric,
  formatPercentage,
  formatRating,
  getTrendColorClass,
} from "@/lib/analytics/utils/analytics-utils";

interface KPICardsProps {
  data: AnalyticsOverview | null;
  isLoading?: boolean;
}

export function KPICards({ data, isLoading = false }: KPICardsProps) {
  if (isLoading || !data) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 9 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 w-24 bg-muted rounded" />
              <div className="h-4 w-4 bg-muted rounded" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-20 bg-muted rounded mb-2" />
              <div className="h-3 w-32 bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const kpis = [
    {
      label: "Total Students",
      value: formatMetric(data.totalStudents.value, 0),
      icon: Users,
      metric: data.totalStudents,
    },
    {
      label: "Active Users (7d)",
      value: formatMetric(data.activeUsers7d.value, 0),
      icon: UserCheck,
      metric: data.activeUsers7d,
    },
    {
      label: "Course Completion",
      value: formatPercentage(data.courseCompletionRate.value),
      icon: GraduationCap,
      metric: data.courseCompletionRate,
    },
    {
      label: "Assessment Pass Rate",
      value: formatPercentage(data.assessmentPassRate.value),
      icon: ClipboardCheck,
      metric: data.assessmentPassRate,
    },
    // Removed Soft Skills Average and Job Placement Rate as requested
    {
      label: "Certifications Issued",
      value: formatMetric(data.certificationsIssued.value, 0),
      icon: Award,
      metric: data.certificationsIssued,
    },
    {
      label: "Attendance Rate",
      value: formatPercentage(data.attendanceRate.value),
      icon: Calendar,
      metric: data.attendanceRate,
    },
    {
      label: "Student Satisfaction",
      value: formatRating(data.studentSatisfaction.value),
      icon: Star,
      metric: data.studentSatisfaction,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {kpis.map((kpi, index) => {
        const Icon = kpi.icon;
        const trend = kpi.metric.trend;
        const percentToTarget = kpi.metric.percentToTarget;
        const onTarget = percentToTarget >= 100;

        return (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {kpi.label}
              </CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpi.value}</div>

              {/* Progress to target */}
              <div className="flex items-center gap-2 mt-2">
                <div className="flex-1">
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        onTarget
                          ? "bg-green-500"
                          : percentToTarget >= 80
                            ? "bg-yellow-500"
                            : "bg-red-500"
                      }`}
                      style={{ width: `${Math.min(100, percentToTarget)}%` }}
                    />
                  </div>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {formatPercentage(percentToTarget, 0)}
                </span>
              </div>

              {/* Trend */}
              <p
                className={`text-xs mt-2 flex items-center gap-1 ${getTrendColorClass(trend.direction)}`}
              >
                {trend.percentChange > 0 ? "+" : ""}
                {trend.percentChange}% vs {trend.comparisonPeriod}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

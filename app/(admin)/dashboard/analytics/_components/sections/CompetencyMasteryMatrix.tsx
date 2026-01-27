/**
 * Competency Mastery Matrix Component
 * ⭐ MOST IMPORTANT SECTION
 * Heatmap showing mastery rates across all competencies
 */

"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CompetencyData } from "@/lib/analytics/types";
import {
  getPerformanceBgClass,
  getTrendColorClass,
  formatPercentage,
} from "@/lib/analytics/utils/analytics-utils";
import { AlertTriangle, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface CompetencyMasteryMatrixProps {
  data: CompetencyData | null;
  isLoading?: boolean;
}

export function CompetencyMasteryMatrix({
  data,
  isLoading = false,
}: CompetencyMasteryMatrixProps) {
  if (isLoading || !data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Competency Mastery Matrix</CardTitle>
          <CardDescription>Loading competency data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-12 bg-muted rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const {
    competencies,
    overallMasteryRate,
    criticalCompetenciesMastered,
    averageDaysToMastery,
  } = data;

  // Sort: critical first, then by mastery percentage (lowest first to highlight gaps)
  const sortedCompetencies = [...competencies].sort((a, b) => {
    if (a.isCritical !== b.isCritical) {
      return a.isCritical ? -1 : 1;
    }
    return a.masteryPercentage - b.masteryPercentage;
  });

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "improving":
        return <TrendingUp className="h-3 w-3" />;
      case "declining":
        return <TrendingDown className="h-3 w-3" />;
      default:
        return <Minus className="h-3 w-3" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>Competency Mastery Matrix ⭐</CardTitle>
            <CardDescription>
              Industry-standard competency tracking across all students
            </CardDescription>
          </div>
          <div className="text-right space-y-1">
            <div className="text-sm font-medium">
              Overall Mastery: {formatPercentage(overallMasteryRate)}
            </div>
            <div className="text-xs text-muted-foreground">
              Critical: {formatPercentage(criticalCompetenciesMastered)}
            </div>
            <div className="text-xs text-muted-foreground">
              Avg Days: {Math.round(averageDaysToMastery)}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Legend */}
        <div className="flex items-center gap-4 mb-4 text-xs">
          <span className="font-medium">Color Scale:</span>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-green-500 rounded" />
            <span>80%+ (Mastery)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-yellow-500 rounded" />
            <span>60-79% (Proficient)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-red-500 rounded" />
            <span>&lt;60% (Needs Attention)</span>
          </div>
        </div>

        {/* Competency List */}
        <div className="space-y-2 max-h-[600px] overflow-y-auto">
          {sortedCompetencies.map((comp) => (
            <div
              key={comp.id}
              className={`p-4 rounded-lg border-l-4 transition-all hover:shadow-md ${getPerformanceBgClass(
                comp.masteryPercentage,
              )}`}
            >
              <div className="flex items-start justify-between gap-4">
                {/* Competency Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-sm truncate">
                      {comp.name}
                    </h4>
                    {comp.isCritical && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                        <AlertTriangle className="h-3 w-3" />
                        Critical
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {comp.category}
                  </p>
                </div>

                {/* Metrics */}
                <div className="flex items-center gap-6 shrink-0">
                  {/* Mastery Rate */}
                  <div className="text-right">
                    <div className="text-2xl font-bold">
                      {formatPercentage(comp.masteryPercentage, 0)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {comp.studentsMastered}/{comp.studentsAttempted} students
                    </div>
                  </div>

                  {/* Days to Mastery */}
                  <div className="text-right min-w-[60px]">
                    <div className="text-sm font-medium">
                      {Math.round(comp.averageDaysToMastery)}d
                    </div>
                    <div className="text-xs text-muted-foreground">
                      to master
                    </div>
                  </div>

                  {/* Trend */}
                  <div
                    className={`text-right min-w-[80px] ${getTrendColorClass(comp.trend)}`}
                  >
                    <div className="flex items-center justify-end gap-1">
                      {getTrendIcon(comp.trend)}
                      <span className="text-xs capitalize">{comp.trend}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-3">
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      comp.colorCode === "green"
                        ? "bg-green-500"
                        : comp.colorCode === "yellow"
                          ? "bg-yellow-500"
                          : "bg-red-500"
                    }`}
                    style={{ width: `${comp.masteryPercentage}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary Stats */}
        <div className="mt-6 pt-6 border-t grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {competencies.filter((c) => c.masteryPercentage >= 80).length}
            </div>
            <div className="text-xs text-muted-foreground">
              Competencies at Mastery
            </div>
          </div>
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {
                competencies.filter(
                  (c) => c.masteryPercentage >= 60 && c.masteryPercentage < 80,
                ).length
              }
            </div>
            <div className="text-xs text-muted-foreground">
              Proficient Level
            </div>
          </div>
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {competencies.filter((c) => c.masteryPercentage < 60).length}
            </div>
            <div className="text-xs text-muted-foreground">Need Attention</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

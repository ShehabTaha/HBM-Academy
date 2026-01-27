/**
 * Analytics Dashboard Client Component
 * Handles all interactive features, filters, and data fetching
 */

"use client";

import { useState, useEffect } from "react";
import { AnalyticsHeader } from "./sections/AnalyticsHeader";
import { KPICards } from "./sections/KPICards";
import { CompetencyMasteryMatrix } from "./sections/CompetencyMasteryMatrix";
import { FilterPanel, CourseOption } from "./shared/FilterPanel";
import { DataExportModal } from "../_components/shared/DataExportModal";

import {
  useAnalyticsFilters,
  useAnalytics,
  useCompetencies,
} from "@/lib/analytics/hooks";
import { Separator } from "@/components/ui/separator";

// NEW CHARTS
import { CompetencyMasteryTrend } from "./sections/charts/CompetencyMasteryTrend";
import { CompetencyDistributionChart } from "./sections/charts/CompetencyDistributionChart";
import { RoleCompetencyComparison } from "./sections/charts/RoleCompetencyComparison";
import { MasteryLevelDistribution } from "./sections/charts/MasteryLevelDistribution";
import { CompetencyPerformanceTable } from "./sections/charts/CompetencyPerformanceTable";

export function AnalyticsDashboardClient() {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [courses, setCourseOptions] = useState<CourseOption[]>([]);

  // Filter state management
  const {
    filters,
    dateRange,
    setDateRange,
    setCustomDateRange,
    setCourses,
    setCohorts,
    resetFilters,
    hasActiveFilters,
  } = useAnalyticsFilters();

  // Data fetching
  const {
    data: analyticsData,
    isLoading: analyticsLoading,
    refetch: refetchAnalytics,
  } = useAnalytics(filters);
  const {
    data: competencyData,
    isLoading: competencyLoading,
    refetch: refetchCompetencies,
  } = useCompetencies(filters);

  // Fetch courses for filter
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await fetch("/api/courses?limit=100");
        if (res.ok) {
          const data = await res.json();
          setCourseOptions(
            (data.courses || []).map((c: any) => ({
              id: c.id,
              title: c.title,
            })),
          );
        }
      } catch (error) {
        console.error("Failed to fetch courses for filter", error);
      }
    };
    fetchCourses();
  }, []);

  // Refresh all data
  const handleRefresh = async () => {
    await Promise.all([refetchAnalytics(), refetchCompetencies()]);
  };

  return (
    <>
      {/* Header */}
      <AnalyticsHeader
        dateRange={dateRange}
        onRefresh={handleRefresh}
        onToggleFilters={() => setFiltersOpen(!filtersOpen)}
        onExport={() => setExportOpen(true)}
        isLoading={analyticsLoading}
        filtersOpen={filtersOpen}
      />

      {/* Filter Panel */}
      {filtersOpen && (
        <FilterPanel
          filters={filters}
          courses={courses}
          onDateRangeChange={setDateRange}
          onCustomDateRangeChange={setCustomDateRange}
          onCoursesChange={setCourses}
          onCohortsChange={setCohorts}
          onReset={resetFilters}
          hasActiveFilters={hasActiveFilters}
        />
      )}

      <Separator />

      {/* Section 1: Executive Summary KPIs */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Executive Summary</h2>
        <KPICards data={analyticsData} isLoading={analyticsLoading} />
      </section>

      <Separator />

      {/* Section 3: Competency Mastery Matrix */}
      <section>
        <CompetencyMasteryMatrix
          data={competencyData}
          isLoading={competencyLoading}
        />
      </section>

      {/* NEW: Advanced Analytics Charts */}
      <section className="space-y-6">
        <h2 className="text-xl font-semibold">Competency Insights</h2>

        {/* Row 1: Trend Line Chart */}
        <CompetencyMasteryTrend
          data={competencyData}
          isLoading={competencyLoading}
        />

        {/* Row 2: Distribution + Donut */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CompetencyDistributionChart
            data={competencyData}
            isLoading={competencyLoading}
          />
          <MasteryLevelDistribution
            data={competencyData}
            isLoading={competencyLoading}
          />
        </div>

        {/* Row 3: Role Comparison */}
        <RoleCompetencyComparison
          data={competencyData}
          isLoading={competencyLoading}
        />

        {/* Row 4: Detailed Table */}
        <CompetencyPerformanceTable
          data={competencyData}
          isLoading={competencyLoading}
        />
      </section>

      <Separator />

      {/* Export Modal */}
      <DataExportModal
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        analyticsData={analyticsData}
        competencyData={competencyData}
      />
    </>
  );
}

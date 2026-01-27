/**
 * Export barrel file for all analytics hooks
 * Simplifies imports throughout the application
 */

export { useAnalyticsFilters } from "./useAnalyticsFilters";
export { useAnalytics } from "./useAnalytics";
export { useCompetencies } from "./useCompetencies";

export type { UseAnalyticsFiltersReturn } from "./useAnalyticsFilters";
export type { UseAnalyticsReturn } from "./useAnalytics";
export type { UseCompetenciesReturn } from "./useCompetencies";

// NOTE: Additional hooks follow same pattern:
// - useSoftSkills.ts
// - useRolePerformance.ts
// - useAssessments.ts
// - useEmployment.ts
// - useCertifications.ts
// - useCohortAnalysis.ts
// - useRiskStudents.ts
// - useEngagementData.ts
// - useTrendAnalysis.ts
// - useBenchmarks.ts
//
// Each follows the same structure as useAnalytics and useCompetencies:
// 1. Accept AnalyticsFilters parameter
// 2. Build query params from filters
// 3. Fetch from corresponding API endpoint
// 4. Return {data, isLoading, error, refetch}
// 5. Use useEffect to fetch on filter changes

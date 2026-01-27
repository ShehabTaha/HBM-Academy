/**
 * Analytics Filters Hook
 * Manages filter state for analytics dashboard
 */

"use client";

import { useState, useCallback, useMemo } from "react";
import { AnalyticsFilters, DateRange } from "../types";
import { getDateRange } from "../utils/analytics-utils";

export interface UseAnalyticsFiltersReturn {
  filters: AnalyticsFilters;
  dateRange: { start: Date; end: Date };
  setDateRange: (range: DateRange) => void;
  setCustomDateRange: (start: Date, end: Date) => void;
  setCourses: (courses: string[]) => void;
  setCohorts: (cohorts: string[]) => void;
  resetFilters: () => void;
  hasActiveFilters: boolean;
}

const DEFAULT_FILTERS: AnalyticsFilters = {
  dateRange: DateRange.LAST_30_DAYS,
  courses: [],
  cohorts: [],
};

/**
 * Hook for managing analytics filter state
 */
export function useAnalyticsFilters(
  initialFilters: Partial<AnalyticsFilters> = {},
): UseAnalyticsFiltersReturn {
  const [filters, setFilters] = useState<AnalyticsFilters>({
    ...DEFAULT_FILTERS,
    ...initialFilters,
  });

  // Calculate actual date range based on filter
  const dateRange = useMemo(() => {
    if (
      filters.dateRange === DateRange.CUSTOM &&
      filters.customStartDate &&
      filters.customEndDate
    ) {
      return {
        start: filters.customStartDate,
        end: filters.customEndDate,
      };
    }
    return getDateRange(filters.dateRange);
  }, [filters.dateRange, filters.customStartDate, filters.customEndDate]);

  // Set predefined date range
  const setDateRange = useCallback((range: DateRange) => {
    setFilters((prev) => ({
      ...prev,
      dateRange: range,
      customStartDate: undefined,
      customEndDate: undefined,
    }));
  }, []);

  // Set custom date range
  const setCustomDateRange = useCallback((start: Date, end: Date) => {
    setFilters((prev) => ({
      ...prev,
      dateRange: DateRange.CUSTOM,
      customStartDate: start,
      customEndDate: end,
      // Reset custom range if switching back to preset (not handled here but good practice)
    }));
  }, []);

  // Set courses filter
  const setCourses = useCallback((courses: string[]) => {
    setFilters((prev) => ({ ...prev, courses }));
  }, []);

  // Set cohorts filter
  const setCohorts = useCallback((cohorts: string[]) => {
    setFilters((prev) => ({ ...prev, cohorts }));
  }, []);

  // Reset all filters to default
  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  // Check if any non-default filters are active
  const hasActiveFilters = useMemo(() => {
    return (
      filters.dateRange !== DEFAULT_FILTERS.dateRange ||
      (filters.courses?.length ?? 0) > 0 ||
      (filters.cohorts?.length ?? 0) > 0
    );
  }, [filters]);

  return {
    filters,
    dateRange,
    setDateRange,
    setCustomDateRange,
    setCourses,
    setCohorts,
    resetFilters,
    hasActiveFilters,
  };
}

/**
 * Analytics Overview Hook
 * Fetches executive summary KPIs and overall analytics data
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { AnalyticsOverview, AnalyticsFilters } from "../types";

export interface UseAnalyticsReturn {
  data: AnalyticsOverview | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Hook for fetching analytics overview data
 */
export function useAnalytics(filters: AnalyticsFilters): UseAnalyticsReturn {
  const [data, setData] = useState<AnalyticsOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();

      // Add date range
      if (filters.customStartDate && filters.customEndDate) {
        params.append("startDate", filters.customStartDate.toISOString());
        params.append("endDate", filters.customEndDate.toISOString());
      } else {
        params.append("dateRange", filters.dateRange);
      }

      // Add optional filters
      if (filters.programs && filters.programs.length > 0) {
        params.append("programs", filters.programs.join(","));
      }
      if (filters.roles && filters.roles.length > 0) {
        params.append("roles", filters.roles.join(","));
      }
      if (filters.cohorts && filters.cohorts.length > 0) {
        params.append("cohorts", filters.cohorts.join(","));
      }

      const response = await fetch(
        `/api/admin/analytics/overview?${params.toString()}`,
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch analytics: ${response.statusText}`);
      }

      const result = await response.json();
      setData(result.data);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("Unknown error occurred"),
      );
      console.error("Error fetching analytics:", err);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchData,
  };
}

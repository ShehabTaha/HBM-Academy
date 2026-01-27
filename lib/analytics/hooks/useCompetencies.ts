/**
 * Competency Data Hook
 * Fetches competency mastery metrics and heatmap data
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { CompetencyData, AnalyticsFilters } from "../types";

export interface UseCompetenciesReturn {
  data: CompetencyData | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Hook for fetching competency mastery data
 */
export function useCompetencies(
  filters: AnalyticsFilters,
): UseCompetenciesReturn {
  const [data, setData] = useState<CompetencyData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();

      if (filters.customStartDate && filters.customEndDate) {
        params.append("startDate", filters.customStartDate.toISOString());
        params.append("endDate", filters.customEndDate.toISOString());
      } else {
        params.append("dateRange", filters.dateRange);
      }

      if (filters.roles && filters.roles.length > 0) {
        params.append("roles", filters.roles.join(","));
      }

      const response = await fetch(
        `/api/admin/analytics/competencies?${params.toString()}`,
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch competencies: ${response.statusText}`);
      }

      const result = await response.json();
      setData(result.data);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("Unknown error occurred"),
      );
      console.error("Error fetching competencies:", err);
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

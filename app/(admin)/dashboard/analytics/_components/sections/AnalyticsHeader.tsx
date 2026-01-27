/**
 * Analytics Header Component
 * Page title, filters toggle, refresh, and export controls
 */

"use client";

import { RefreshCw, Download, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDateRange } from "@/lib/analytics/utils/analytics-utils";

interface AnalyticsHeaderProps {
  dateRange: { start: Date; end: Date };
  onRefresh: () => void;
  onToggleFilters: () => void;
  onExport: () => void;
  isLoading?: boolean;
  filtersOpen?: boolean;
}

export function AnalyticsHeader({
  dateRange,
  onRefresh,
  onToggleFilters,
  onExport,
  isLoading = false,
  filtersOpen = false,
}: AnalyticsHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      {/* Title and description */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Analytics Dashboard
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Comprehensive insights across all hospitality programs
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {formatDateRange(dateRange.start, dateRange.end)}
        </p>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2">
        {/* Filter Toggle */}
        <Button
          variant={filtersOpen ? "default" : "outline"}
          size="sm"
          onClick={onToggleFilters}
          className="gap-2"
        >
          <Filter className="h-4 w-4" />
          <span className="hidden sm:inline">Filters</span>
        </Button>

        {/* Refresh */}
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={isLoading}
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          <span className="hidden sm:inline">Refresh</span>
        </Button>

        {/* Export */}
        <Button
          variant="outline"
          size="sm"
          onClick={onExport}
          className="gap-2"
        >
          <Download className="h-4 w-4" />
          <span className="hidden sm:inline">Export</span>
        </Button>
      </div>
    </div>
  );
}

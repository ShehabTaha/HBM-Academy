/**
 * Core Analytics Utility Functions
 * Common calculations, formatting, and data processing for analytics
 */

import { TrendDirection } from "../types";

// ============================================================================
// PERCENTAGE & RATIO CALCULATIONS
// ============================================================================

/**
 * Calculate percentage with safe division (returns 0 if denominator is 0)
 */
export function calculatePercentage(
  numerator: number,
  denominator: number,
  decimals: number = 2,
): number {
  if (denominator === 0) return 0;
  return Number(((numerator / denominator) * 100).toFixed(decimals));
}

/**
 * Calculate how close current value is to target (as percentage)
 */
export function calculatePercentToTarget(
  current: number,
  target: number,
): number {
  if (target === 0) return 0;
  return Number(((current / target) * 100).toFixed(2));
}

// ============================================================================
// TREND CALCULATIONS
// ============================================================================

/**
 * Compare current value to previous period and determine trend
 */
export function calculateTrend(
  currentValue: number,
  previousValue: number,
): {
  direction: TrendDirection;
  percentChange: number;
} {
  if (previousValue === 0) {
    return {
      direction: TrendDirection.STABLE,
      percentChange: 0,
    };
  }

  const percentChange = Number(
    (((currentValue - previousValue) / previousValue) * 100).toFixed(2),
  );

  let direction: TrendDirection;
  if (Math.abs(percentChange) < 2) {
    direction = TrendDirection.STABLE;
  } else if (percentChange > 0) {
    direction = TrendDirection.IMPROVING;
  } else {
    direction = TrendDirection.DECLINING;
  }

  return { direction, percentChange };
}

/**
 * Get trend icon based on direction
 */
export function getTrendIcon(direction: TrendDirection): string {
  switch (direction) {
    case TrendDirection.IMPROVING:
      return "trending-up";
    case TrendDirection.DECLINING:
      return "trending-down";
    case TrendDirection.STABLE:
      return "minus";
  }
}

/**
 * Get trend color class for Tailwind
 */
export function getTrendColorClass(direction: TrendDirection): string {
  switch (direction) {
    case TrendDirection.IMPROVING:
      return "text-green-600 dark:text-green-400";
    case TrendDirection.DECLINING:
      return "text-red-600 dark:text-red-400";
    case TrendDirection.STABLE:
      return "text-gray-600 dark:text-gray-400";
  }
}

// ============================================================================
// FORMATTING
// ============================================================================

/**
 * Format large numbers with K, M notation
 */
export function formatMetric(value: number, decimals: number = 1): string {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(decimals)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(decimals)}K`;
  }
  return value.toFixed(decimals);
}

/**
 * Format percentage with % symbol
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format rating (1-5 scale)
 */
export function formatRating(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}/5`;
}

/**
 * Format currency (Philippine Peso)
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Format date range for display
 */
export function formatDateRange(startDate: Date, endDate: Date): string {
  const options: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
    year: "numeric",
  };

  const start = startDate.toLocaleDateString("en-US", options);
  const end = endDate.toLocaleDateString("en-US", options);

  return `${start} - ${end}`;
}

// ============================================================================
// RATE CALCULATIONS
// ============================================================================

/**
 * Calculate course completion rate
 */
export function calculateCompletionRate(
  completedCount: number,
  totalEnrolled: number,
): number {
  return calculatePercentage(completedCount, totalEnrolled);
}

/**
 * Calculate assessment pass rate
 */
export function calculatePassRate(
  passedCount: number,
  totalAttempts: number,
): number {
  return calculatePercentage(passedCount, totalAttempts);
}

/**
 * Calculate job placement rate
 */
export function calculatePlacementRate(
  employedCount: number,
  eligibleGraduates: number,
): number {
  return calculatePercentage(employedCount, eligibleGraduates);
}

/**
 * Calculate attendance rate
 */
export function calculateAttendanceRate(
  attendedSessions: number,
  totalSessions: number,
): number {
  return calculatePercentage(attendedSessions, totalSessions);
}

// ============================================================================
// TIME SERIES GROUPING
// ============================================================================

export type GroupByPeriod = "day" | "week" | "month" | "quarter" | "year";

/**
 * Group data by time period
 */
export function groupByPeriod<T extends { date: Date }>(
  data: T[],
  period: GroupByPeriod,
  aggregator: (items: T[]) => number,
): Array<{ date: string; value: number }> {
  const groups = new Map<string, T[]>();

  data.forEach((item) => {
    const key = getPeriodKey(item.date, period);
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push(item);
  });

  return Array.from(groups.entries())
    .map(([date, items]) => ({
      date,
      value: aggregator(items),
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Get period key for grouping
 */
function getPeriodKey(date: Date, period: GroupByPeriod): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  switch (period) {
    case "day":
      return `${year}-${month}-${day}`;
    case "week":
      const weekNumber = getWeekNumber(date);
      return `${year}-W${String(weekNumber).padStart(2, "0")}`;
    case "month":
      return `${year}-${month}`;
    case "quarter":
      const quarter = Math.floor(date.getMonth() / 3) + 1;
      return `${year}-Q${quarter}`;
    case "year":
      return `${year}`;
  }
}

/**
 * Get ISO week number
 */
function getWeekNumber(date: Date): number {
  const d = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
  );
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

// ============================================================================
// COLOR CODING
// ============================================================================

/**
 * Get color based on performance threshold
 */
export function getPerformanceColor(
  value: number,
  greenThreshold: number = 80,
  yellowThreshold: number = 60,
): "green" | "yellow" | "red" {
  if (value >= greenThreshold) return "green";
  if (value >= yellowThreshold) return "yellow";
  return "red";
}

/**
 * Get Tailwind background color class based on performance
 */
export function getPerformanceBgClass(
  value: number,
  greenThreshold: number = 80,
  yellowThreshold: number = 60,
): string {
  const color = getPerformanceColor(value, greenThreshold, yellowThreshold);

  switch (color) {
    case "green":
      return "bg-green-100 dark:bg-green-900/30 border-green-500";
    case "yellow":
      return "bg-yellow-100 dark:bg-yellow-900/30 border-yellow-500";
    case "red":
      return "bg-red-100 dark:bg-red-900/30 border-red-500";
  }
}

/**
 * Get Tailwind text color class based on performance
 */
export function getPerformanceTextClass(
  value: number,
  greenThreshold: number = 80,
  yellowThreshold: number = 60,
): string {
  const color = getPerformanceColor(value, greenThreshold, yellowThreshold);

  switch (color) {
    case "green":
      return "text-green-700 dark:text-green-300";
    case "yellow":
      return "text-yellow-700 dark:text-yellow-300";
    case "red":
      return "text-red-700 dark:text-red-300";
  }
}

// ============================================================================
// STATISTICAL FUNCTIONS
// ============================================================================

/**
 * Calculate average of an array
 */
export function calculateAverage(values: number[]): number {
  if (values.length === 0) return 0;
  const sum = values.reduce((acc, val) => acc + val, 0);
  return sum / values.length;
}

/**
 * Calculate median of an array
 */
export function calculateMedian(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2;
  }
  return sorted[mid];
}

/**
 * Calculate standard deviation
 */
export function calculateStandardDeviation(values: number[]): number {
  if (values.length === 0) return 0;
  const avg = calculateAverage(values);
  const squaredDiffs = values.map((value) => Math.pow(value - avg, 2));
  const avgSquaredDiff = calculateAverage(squaredDiffs);
  return Math.sqrt(avgSquaredDiff);
}

/**
 * Calculate percentile
 */
export function calculatePercentile(
  values: number[],
  percentile: number,
): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const index = (percentile / 100) * (sorted.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  const weight = index % 1;

  if (lower === upper) {
    return sorted[lower];
  }

  return sorted[lower] * (1 - weight) + sorted[upper] * weight;
}

// ============================================================================
// DATA AGGREGATION
// ============================================================================

/**
 * Group data by key and aggregate
 */
export function groupBy<T, K extends keyof T>(
  data: T[],
  key: K,
): Map<T[K], T[]> {
  return data.reduce((map, item) => {
    const keyValue = item[key];
    if (!map.has(keyValue)) {
      map.set(keyValue, []);
    }
    map.get(keyValue)!.push(item);
    return map;
  }, new Map<T[K], T[]>());
}

/**
 * Calculate distribution percentages
 */
export function calculateDistribution<T>(
  data: T[],
  categorizer: (item: T) => string,
): Record<string, number> {
  const total = data.length;
  if (total === 0) return {};

  const counts: Record<string, number> = {};

  data.forEach((item) => {
    const category = categorizer(item);
    counts[category] = (counts[category] || 0) + 1;
  });

  const distribution: Record<string, number> = {};
  Object.keys(counts).forEach((category) => {
    distribution[category] = calculatePercentage(counts[category], total);
  });

  return distribution;
}

// ============================================================================
// DATE UTILITIES
// ============================================================================

/**
 * Get date range based on predefined period
 */
export function getDateRange(period: string): { start: Date; end: Date } {
  const end = new Date();
  const start = new Date();

  switch (period) {
    case "7d":
      start.setDate(end.getDate() - 7);
      break;
    case "30d":
      start.setDate(end.getDate() - 30);
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

  return { start, end };
}

/**
 * Check if date is within range
 */
export function isWithinDateRange(date: Date, start: Date, end: Date): boolean {
  return date >= start && date <= end;
}

/**
 * Calculate days between two dates
 */
export function daysBetween(start: Date, end: Date): number {
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.round((end.getTime() - start.getTime()) / msPerDay);
}

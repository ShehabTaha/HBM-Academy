/**
 * Data Validation Utilities
 * Validation functions and type guards for analytics data
 */

import { z } from "zod";
import {
  HospitalityRole,
  AssessmentType,
  SoftSkillType,
  DateRange,
} from "../types";

// ============================================================================
// ZOD SCHEMAS
// ============================================================================

/**
 * Analytics filter validation schema
 */
export const analyticsFiltersSchema = z.object({
  dateRange: z.nativeEnum(DateRange),
  customStartDate: z.date().optional(),
  customEndDate: z.date().optional(),
  programs: z.array(z.string()).optional(),
  roles: z.array(z.nativeEnum(HospitalityRole)).optional(),
  cohorts: z.array(z.string()).optional(),
});

/**
 * Query parameters validation schema
 */
export const queryParamsSchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  programId: z.string().uuid().optional(),
  role: z.nativeEnum(HospitalityRole).optional(),
  cohortId: z.string().optional(),
  limit: z.number().int().positive().max(1000).default(100),
  offset: z.number().int().min(0).default(0),
});

// ============================================================================
// DATA VALIDATION
// ============================================================================

/**
 * Validate percentage value (0-100)
 */
export function isValidPercentage(value: number): boolean {
  return (
    typeof value === "number" && value >= 0 && value <= 100 && !isNaN(value)
  );
}

/**
 * Validate score value (0-100)
 */
export function isValidScore(value: number): boolean {
  return (
    typeof value === "number" && value >= 0 && value <= 100 && !isNaN(value)
  );
}

/**
 * Validate rating (1-5)
 */
export function isValidRating(value: number): boolean {
  return typeof value === "number" && value >= 1 && value <= 5 && !isNaN(value);
}

/**
 * Validate NPS score (-100 to 100)
 */
export function isValidNPS(value: number): boolean {
  return (
    typeof value === "number" && value >= -100 && value <= 100 && !isNaN(value)
  );
}

/**
 * Validate date string (ISO format)
 */
export function isValidDateString(value: string): boolean {
  const date = new Date(value);
  return date instanceof Date && !isNaN(date.getTime());
}

/**
 * Validate date range
 */
export function isValidDateRange(start: Date, end: Date): boolean {
  return start instanceof Date && end instanceof Date && start <= end;
}

// ============================================================================
// DATA INTEGRITY CHECKS
// ============================================================================

/**
 * Check for missing or null values in required fields
 */
export function hasMissingValues<T extends Record<string, unknown>>(
  obj: T,
  requiredFields: (keyof T)[],
): { valid: boolean; missingFields: string[] } {
  const missingFields: string[] = [];

  requiredFields.forEach((field) => {
    if (obj[field] === null || obj[field] === undefined) {
      missingFields.push(String(field));
    }
  });

  return {
    valid: missingFields.length === 0,
    missingFields,
  };
}

/**
 * Detect outliers using IQR method
 */
export function detectOutliers(values: number[]): {
  outliers: number[];
  indices: number[];
} {
  if (values.length < 4) {
    return { outliers: [], indices: [] };
  }

  const sorted = [...values].sort((a, b) => a - b);
  const q1Index = Math.floor(sorted.length * 0.25);
  const q3Index = Math.floor(sorted.length * 0.75);

  const q1 = sorted[q1Index];
  const q3 = sorted[q3Index];
  const iqr = q3 - q1;

  const lowerBound = q1 - 1.5 * iqr;
  const upperBound = q3 + 1.5 * iqr;

  const outliers: number[] = [];
  const indices: number[] = [];

  values.forEach((value, index) => {
    if (value < lowerBound || value > upperBound) {
      outliers.push(value);
      indices.push(index);
    }
  });

  return { outliers, indices };
}

/**
 * Check data consistency (e.g., parts sum to whole)
 */
export function checkSum(
  parts: number[],
  expected: number,
  tolerance: number = 0.01,
): boolean {
  const actual = parts.reduce((sum, part) => sum + part, 0);
  return Math.abs(actual - expected) <= tolerance;
}

// ============================================================================
// TYPE GUARDS
// ============================================================================

/**
 * Type guard for HospitalityRole
 */
export function isHospitalityRole(value: unknown): value is HospitalityRole {
  return Object.values(HospitalityRole).includes(value as HospitalityRole);
}

/**
 * Type guard for AssessmentType
 */
export function isAssessmentType(value: unknown): value is AssessmentType {
  return Object.values(AssessmentType).includes(value as AssessmentType);
}

/**
 * Type guard for SoftSkillType
 */
export function isSoftSkillType(value: unknown): value is SoftSkillType {
  return Object.values(SoftSkillType).includes(value as SoftSkillType);
}

/**
 * Type guard for array of strings
 */
export function isStringArray(value: unknown): value is string[] {
  return (
    Array.isArray(value) && value.every((item) => typeof item === "string")
  );
}

/**
 * Type guard for array of numbers
 */
export function isNumberArray(value: unknown): value is number[] {
  return (
    Array.isArray(value) && value.every((item) => typeof item === "number")
  );
}

// ============================================================================
// SANITIZATION
// ============================================================================

/**
 * Sanitize user input (prevent XSS)
 */
export function sanitizeString(input: string): string {
  return input
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}

/**
 * Sanitize SQL input (prevent injection)
 * Note: Use parameterized queries instead when possible
 */
export function sanitizeSQLString(input: string): string {
  return input.replace(/'/g, "''").replace(/;/g, "");
}

/**
 * Remove invalid characters from filename
 */
export function sanitizeFilename(filename: string): string {
  return filename.replace(/[^a-z0-9_\-\.]/gi, "_").substring(0, 255);
}

// ============================================================================
// DATA CLEANING
// ============================================================================

/**
 * Remove null/undefined values from array
 */
export function removeNullValues<T>(array: (T | null | undefined)[]): T[] {
  return array.filter((item): item is T => item !== null && item !== undefined);
}

/**
 * Clamp value to range
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Round to specified decimal places
 */
export function roundTo(value: number, decimals: number): number {
  const multiplier = Math.pow(10, decimals);
  return Math.round(value * multiplier) / multiplier;
}

/**
 * Normalize array values to 0-100 scale
 */
export function normalizeToScale(
  values: number[],
  targetMin: number = 0,
  targetMax: number = 100,
): number[] {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min;

  if (range === 0) {
    return values.map(() => (targetMin + targetMax) / 2);
  }

  return values.map((value) => {
    const normalized = (value - min) / range;
    return targetMin + normalized * (targetMax - targetMin);
  });
}

// ============================================================================
// BUSINESS LOGIC VALIDATION
// ============================================================================

/**
 * Validate KPI target is achievable
 */
export function isTargetAchievable(
  current: number,
  target: number,
  maxReasonableIncrease: number = 50, // 50% increase max
): {
  achievable: boolean;
  reason?: string;
} {
  if (current >= target) {
    return { achievable: true };
  }

  const increaseRequired = ((target - current) / current) * 100;

  if (increaseRequired > maxReasonableIncrease) {
    return {
      achievable: false,
      reason: `Requires ${increaseRequired.toFixed(1)}% increase, exceeds reasonable threshold`,
    };
  }

  return { achievable: true };
}

/**
 * Validate date is not in future
 */
export function isNotFutureDate(date: Date): boolean {
  return date <= new Date();
}

/**
 * Validate student count consistency
 */
export function validateStudentCounts(data: {
  totalStudents: number;
  activeStudents: number;
  completedStudents: number;
  droppedStudents: number;
}): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (data.activeStudents > data.totalStudents) {
    errors.push("Active students cannot exceed total students");
  }

  if (data.completedStudents > data.totalStudents) {
    errors.push("Completed students cannot exceed total students");
  }

  const accountedFor =
    data.activeStudents + data.completedStudents + data.droppedStudents;
  if (accountedFor > data.totalStudents) {
    errors.push("Sum of student categories exceeds total students");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// ============================================================================
// ERROR MESSAGES
// ============================================================================

export const VALIDATION_ERRORS = {
  INVALID_PERCENTAGE: "Value must be between 0 and 100",
  INVALID_SCORE: "Score must be between 0 and 100",
  INVALID_RATING: "Rating must be between 1 and 5",
  INVALID_NPS: "NPS must be between -100 and 100",
  INVALID_DATE: "Invalid date format",
  INVALID_DATE_RANGE: "End date must be after start date",
  MISSING_REQUIRED_FIELD: "Required field is missing",
  INVALID_ENUM: "Invalid enum value",
  NEGATIVE_VALUE: "Value cannot be negative",
  OUTLIER_DETECTED: "Potential outlier detected",
} as const;

/**
 * Get user-friendly validation error message
 */
export function getValidationError(
  field: string,
  errorType: keyof typeof VALIDATION_ERRORS,
): string {
  return `${field}: ${VALIDATION_ERRORS[errorType]}`;
}

// ============================================================================
// COMPREHENSIVE VALIDATION
// ============================================================================

/**
 * Validate entire analytics dataset
 */
export function validateAnalyticsData(data: {
  totalStudents: number;
  completionRate: number;
  passRate: number;
  softSkillsAverage: number;
  placementRate: number;
  satisfaction: number;
}): {
  valid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check percentages
  if (!isValidPercentage(data.completionRate)) {
    errors.push(getValidationError("completionRate", "INVALID_PERCENTAGE"));
  }
  if (!isValidPercentage(data.passRate)) {
    errors.push(getValidationError("passRate", "INVALID_PERCENTAGE"));
  }
  if (!isValidPercentage(data.softSkillsAverage)) {
    errors.push(getValidationError("softSkillsAverage", "INVALID_PERCENTAGE"));
  }
  if (!isValidPercentage(data.placementRate)) {
    errors.push(getValidationError("placementRate", "INVALID_PERCENTAGE"));
  }

  // Check rating
  if (!isValidRating(data.satisfaction)) {
    errors.push(getValidationError("satisfaction", "INVALID_RATING"));
  }

  // Check for negative values
  if (data.totalStudents < 0) {
    errors.push(getValidationError("totalStudents", "NEGATIVE_VALUE"));
  }

  // Warnings for unusual values
  if (data.completionRate > 95) {
    warnings.push("Completion rate exceptionally high (>95%) - verify data");
  }
  if (data.passRate > 95) {
    warnings.push("Pass rate exceptionally high (>95%) - verify data");
  }
  if (data.placementRate > 95) {
    warnings.push("Placement rate exceptionally high (>95%) - verify data");
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

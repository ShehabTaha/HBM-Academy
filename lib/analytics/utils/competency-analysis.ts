/**
 * Competency Analysis Utilities
 * Functions for analyzing competency mastery and identifying gaps
 */

import { CompetencyMetric, HospitalityRole, TrendDirection } from "../types";
import { calculatePercentage, getPerformanceColor } from "./analytics-utils";

// ============================================================================
// COMPETENCY THRESHOLDS
// ============================================================================

const MASTERY_THRESHOLD = 80; // 80%+ is considered mastery
const PROFICIENT_THRESHOLD = 60; // 60-79% is proficient
const DEVELOPING_THRESHOLD = 40; // 40-59% is developing

// ============================================================================
// CRITICAL COMPETENCIES BY ROLE
// ============================================================================

const CRITICAL_COMPETENCIES: Record<HospitalityRole, string[]> = {
  [HospitalityRole.FB_SERVICE]: [
    "Guest Service Excellence",
    "Food Safety & Hygiene",
    "Order Taking & Service",
    "Beverage Knowledge",
  ],
  [HospitalityRole.HOUSEKEEPING]: [
    "Room Preparation Standards",
    "Cleaning & Sanitation",
    "Bed Making Excellence",
    "Guest Privacy & Security",
  ],
  [HospitalityRole.FRONT_OFFICE]: [
    "PMS Operations",
    "Check-in/Check-out Procedures",
    "Guest Relations",
    "Reservation Management",
  ],
  [HospitalityRole.MANAGEMENT]: [
    "Leadership & Team Management",
    "Financial Management",
    "Operational Planning",
    "Conflict Resolution",
  ],
  [HospitalityRole.CULINARY]: [
    "Food Safety & HACCP",
    "Knife Skills",
    "Recipe Execution",
    "Kitchen Operations",
  ],
};

// ============================================================================
// MASTERY CALCULATIONS
// ============================================================================

/**
 * Calculate competency mastery percentage
 */
export function calculateMasteryPercentage(
  studentsMastered: number,
  studentsAttempted: number,
): number {
  return calculatePercentage(studentsMastered, studentsAttempted);
}

/**
 * Determine if competency is at mastery level
 */
export function isMasteryLevel(masteryPercentage: number): boolean {
  return masteryPercentage >= MASTERY_THRESHOLD;
}

/**
 * Get competency proficiency level
 */
export function getProficiencyLevel(
  masteryPercentage: number,
): "master" | "proficient" | "developing" | "beginning" {
  if (masteryPercentage >= MASTERY_THRESHOLD) return "master";
  if (masteryPercentage >= PROFICIENT_THRESHOLD) return "proficient";
  if (masteryPercentage >= DEVELOPING_THRESHOLD) return "developing";
  return "beginning";
}

/**
 * Calculate overall competency mastery rate
 */
export function calculateOverallMasteryRate(
  competencies: CompetencyMetric[],
): number {
  if (competencies.length === 0) return 0;

  const totalMastery = competencies.reduce(
    (sum, comp) => sum + comp.masteryPercentage,
    0,
  );

  return totalMastery / competencies.length;
}

// ============================================================================
// GAP ANALYSIS
// ============================================================================

/**
 * Identify competency gaps (below mastery threshold)
 */
export function identifyCompetencyGaps(
  competencies: CompetencyMetric[],
): CompetencyMetric[] {
  return competencies
    .filter((comp) => comp.masteryPercentage < MASTERY_THRESHOLD)
    .sort((a, b) => a.masteryPercentage - b.masteryPercentage);
}

/**
 * Identify critical competency gaps
 */
export function identifyCriticalGaps(
  competencies: CompetencyMetric[],
  role?: HospitalityRole,
): CompetencyMetric[] {
  let criticalComps = competencies.filter((comp) => comp.isCritical);

  // If role specified, filter to role-specific critical competencies
  if (role && CRITICAL_COMPETENCIES[role]) {
    criticalComps = criticalComps.filter((comp) =>
      CRITICAL_COMPETENCIES[role].includes(comp.name),
    );
  }

  return criticalComps.filter(
    (comp) => comp.masteryPercentage < MASTERY_THRESHOLD,
  );
}

/**
 * Calculate competency gap severity score
 */
export function calculateGapSeverity(competency: CompetencyMetric): {
  score: number;
  severity: "critical" | "high" | "medium" | "low";
} {
  const gap = MASTERY_THRESHOLD - competency.masteryPercentage;
  let severityScore = gap;

  // Increase severity for critical competencies
  if (competency.isCritical) {
    severityScore *= 1.5;
  }

  // Increase severity for declining trends
  if (competency.trend === TrendDirection.DECLINING) {
    severityScore *= 1.3;
  }

  let severity: "critical" | "high" | "medium" | "low";
  if (severityScore >= 40) severity = "critical";
  else if (severityScore >= 25) severity = "high";
  else if (severityScore >= 15) severity = "medium";
  else severity = "low";

  return { score: severityScore, severity };
}

// ============================================================================
// MASTERY TIME ANALYSIS
// ============================================================================

/**
 * Calculate average days to mastery across competencies
 */
export function calculateAverageDaysToMastery(
  competencies: CompetencyMetric[],
): number {
  const masteredCompetencies = competencies.filter((comp) =>
    isMasteryLevel(comp.masteryPercentage),
  );

  if (masteredCompetencies.length === 0) return 0;

  const totalDays = masteredCompetencies.reduce(
    (sum, comp) => sum + comp.averageDaysToMastery,
    0,
  );

  return totalDays / masteredCompetencies.length;
}

/**
 * Identify competencies taking longest to master
 */
export function identifySlowestCompetencies(
  competencies: CompetencyMetric[],
  topN: number = 5,
): CompetencyMetric[] {
  return competencies
    .filter((comp) => comp.averageDaysToMastery > 0)
    .sort((a, b) => b.averageDaysToMastery - a.averageDaysToMastery)
    .slice(0, topN);
}

/**
 * Identify competencies mastered fastest
 */
export function identifyFastestCompetencies(
  competencies: CompetencyMetric[],
  topN: number = 5,
): CompetencyMetric[] {
  return competencies
    .filter((comp) => comp.averageDaysToMastery > 0)
    .sort((a, b) => a.averageDaysToMastery - b.averageDaysToMastery)
    .slice(0, topN);
}

// ============================================================================
// TREND ANALYSIS
// ============================================================================

/**
 * Identify improving competencies
 */
export function identifyImprovingCompetencies(
  competencies: CompetencyMetric[],
): CompetencyMetric[] {
  return competencies.filter((comp) => comp.trend === TrendDirection.IMPROVING);
}

/**
 * Identify declining competencies (requires attention)
 */
export function identifyDecliningCompetencies(
  competencies: CompetencyMetric[],
): CompetencyMetric[] {
  return competencies.filter((comp) => comp.trend === TrendDirection.DECLINING);
}

/**
 * Calculate competency health score (0-100)
 */
export function calculateCompetencyHealth(competencies: CompetencyMetric[]): {
  score: number;
  status: "excellent" | "good" | "needs_improvement" | "critical";
} {
  if (competencies.length === 0) {
    return { score: 0, status: "critical" };
  }

  // Calculate weighted score
  const criticalComps = competencies.filter((c) => c.isCritical);
  const nonCriticalComps = competencies.filter((c) => !c.isCritical);

  const criticalWeight = 0.7;
  const nonCriticalWeight = 0.3;

  const criticalScore =
    criticalComps.length > 0
      ? criticalComps.reduce((sum, c) => sum + c.masteryPercentage, 0) /
        criticalComps.length
      : 0;

  const nonCriticalScore =
    nonCriticalComps.length > 0
      ? nonCriticalComps.reduce((sum, c) => sum + c.masteryPercentage, 0) /
        nonCriticalComps.length
      : 0;

  const score =
    criticalScore * criticalWeight + nonCriticalScore * nonCriticalWeight;

  let status: "excellent" | "good" | "needs_improvement" | "critical";
  if (score >= 85) status = "excellent";
  else if (score >= 75) status = "good";
  else if (score >= 60) status = "needs_improvement";
  else status = "critical";

  return { score, status };
}

// ============================================================================
// HEATMAP GENERATION
// ============================================================================

/**
 * Generate heatmap data for competency x role matrix
 */
export function generateCompetencyHeatmap(
  competencies: CompetencyMetric[],
  roleData: Record<HospitalityRole, Record<string, number>>,
): Array<{
  competency: string;
  role: HospitalityRole;
  masteryRate: number;
  color: "green" | "yellow" | "red";
}> {
  const heatmapData: Array<{
    competency: string;
    role: HospitalityRole;
    masteryRate: number;
    color: "green" | "yellow" | "red";
  }> = [];

  competencies.forEach((comp) => {
    Object.values(HospitalityRole).forEach((role) => {
      const masteryRate = roleData[role]?.[comp.name] || 0;

      heatmapData.push({
        competency: comp.name,
        role,
        masteryRate,
        color: getPerformanceColor(masteryRate),
      });
    });
  });

  return heatmapData;
}

// ============================================================================
// RECOMMENDATIONS
// ============================================================================

/**
 * Generate competency improvement recommendations
 */
export function generateCompetencyRecommendations(
  competencies: CompetencyMetric[],
): Array<{
  competency: string;
  issue: string;
  recommendation: string;
  priority: "high" | "medium" | "low";
}> {
  const recommendations: Array<{
    competency: string;
    issue: string;
    recommendation: string;
    priority: "high" | "medium" | "low";
  }> = [];

  // Identify critical gaps
  const criticalGaps = identifyCriticalGaps(competencies);
  criticalGaps.forEach((comp) => {
    recommendations.push({
      competency: comp.name,
      issue: `Only ${comp.masteryPercentage}% of students achieving mastery (critical competency)`,
      recommendation:
        "Increase hands-on practice time, add supplementary materials, consider instructor training",
      priority: "high",
    });
  });

  // Identify declining competencies
  const declining = identifyDecliningCompetencies(competencies);
  declining.forEach((comp) => {
    if (!criticalGaps.find((c) => c.id === comp.id)) {
      recommendations.push({
        competency: comp.name,
        issue: "Mastery rate declining over time",
        recommendation:
          "Review recent changes to curriculum or instruction methods",
        priority: comp.isCritical ? "high" : "medium",
      });
    }
  });

  // Identify slow mastery
  const slowest = identifySlowestCompetencies(competencies, 3);
  slowest.forEach((comp) => {
    if (!criticalGaps.find((c) => c.id === comp.id)) {
      recommendations.push({
        competency: comp.name,
        issue: `Taking ${Math.round(comp.averageDaysToMastery)} days to master (above average)`,
        recommendation:
          "Break into smaller learning units, add intermediate checkpoints",
        priority: "medium",
      });
    }
  });

  return recommendations;
}

/**
 * Calculate percentage of critical competencies mastered
 */
export function calculateCriticalCompetenciesMastered(
  competencies: CompetencyMetric[],
): number {
  const criticalComps = competencies.filter((c) => c.isCritical);
  if (criticalComps.length === 0) return 100;

  const masteredCritical = criticalComps.filter((c) =>
    isMasteryLevel(c.masteryPercentage),
  );

  return calculatePercentage(masteredCritical.length, criticalComps.length);
}

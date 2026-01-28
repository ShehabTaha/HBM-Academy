/**
 * Soft Skills Analysis Utilities
 * Functions for analyzing soft skills development and improvement
 */

import { SoftSkillType, SoftSkillMetric } from "../types";
import { calculatePercentage } from "./analytics-utils";

// ============================================================================
// SOFT SKILL WEIGHTS FOR HOSPITALITY
// ============================================================================

const SKILL_WEIGHTS = {
  [SoftSkillType.CUSTOMER_SERVICE]: 0.3, // Most critical in hospitality
  [SoftSkillType.COMMUNICATION]: 0.25,
  [SoftSkillType.PROFESSIONALISM]: 0.2,
  [SoftSkillType.TEAMWORK]: 0.15,
  [SoftSkillType.EMOTIONAL_INTELLIGENCE]: 0.1,
};

// ============================================================================
// PROFICIENCY LEVEL THRESHOLDS
// ============================================================================

const PROFICIENCY_THRESHOLDS = {
  master: 90, // 90-100
  expert: 80, // 80-89
  advanced: 70, // 70-79
  intermediate: 60, // 60-69
  beginner: 0, // 0-59
};

// ============================================================================
// SOFT SKILLS MAPPING
// ============================================================================

const SKILL_NAMES: Record<SoftSkillType, string> = {
  [SoftSkillType.CUSTOMER_SERVICE]: "Customer Service Excellence",
  [SoftSkillType.COMMUNICATION]: "Communication Skills",
  [SoftSkillType.TEAMWORK]: "Teamwork & Collaboration",
  [SoftSkillType.EMOTIONAL_INTELLIGENCE]: "Emotional Intelligence",
  [SoftSkillType.PROFESSIONALISM]: "Professionalism & Work Ethic",
};

export function getSkillName(skillType: SoftSkillType): string {
  return SKILL_NAMES[skillType];
}

// ============================================================================
// IMPROVEMENT CALCULATIONS
// ============================================================================

/**
 * Calculate improvement from pre to post score
 */
export function calculateImprovement(
  preScore: number,
  postScore: number,
): {
  absolute: number;
  percentage: number;
} {
  const absolute = postScore - preScore;
  const percentage = preScore > 0 ? (absolute / preScore) * 100 : 0;

  return {
    absolute: Number(absolute.toFixed(2)),
    percentage: Number(percentage.toFixed(2)),
  };
}

/**
 * Calculate overall soft skills improvement
 */
export function calculateOverallImprovement(skills: SoftSkillMetric[]): number {
  if (skills.length === 0) return 0;

  // Weighted average of improvements
  let weightedImprovement = 0;
  let totalWeight = 0;

  skills.forEach((skill) => {
    const weight = SKILL_WEIGHTS[skill.skillType] || 1 / skills.length;
    weightedImprovement += skill.improvementPercentage * weight;
    totalWeight += weight;
  });

  return Number((weightedImprovement / totalWeight).toFixed(2));
}

/**
 * Calculate weighted soft skills score
 */
export function calculateWeightedScore(
  skills: SoftSkillMetric[],
  usePostScore: boolean = true,
): number {
  if (skills.length === 0) return 0;

  let weightedScore = 0;
  let totalWeight = 0;

  skills.forEach((skill) => {
    const weight = SKILL_WEIGHTS[skill.skillType] || 1 / skills.length;
    const score = usePostScore ? skill.postScore : skill.preScore;
    weightedScore += score * weight;
    totalWeight += weight;
  });

  return Number((weightedScore / totalWeight).toFixed(2));
}

// ============================================================================
// PROFICIENCY DISTRIBUTION
// ============================================================================

/**
 * Get proficiency level based on score
 */
export function getProficiencyLevel(
  score: number,
): "master" | "expert" | "advanced" | "intermediate" | "beginner" {
  if (score >= PROFICIENCY_THRESHOLDS.master) return "master";
  if (score >= PROFICIENCY_THRESHOLDS.expert) return "expert";
  if (score >= PROFICIENCY_THRESHOLDS.advanced) return "advanced";
  if (score >= PROFICIENCY_THRESHOLDS.intermediate) return "intermediate";
  return "beginner";
}

/**
 * Calculate distribution across proficiency levels
 */
export function calculateDistribution(scores: number[]): {
  beginner: number;
  intermediate: number;
  advanced: number;
  expert: number;
  master: number;
} {
  const total = scores.length;
  if (total === 0) {
    return { beginner: 0, intermediate: 0, advanced: 0, expert: 0, master: 0 };
  }

  const distribution = {
    beginner: 0,
    intermediate: 0,
    advanced: 0,
    expert: 0,
    master: 0,
  };

  scores.forEach((score) => {
    const level = getProficiencyLevel(score);
    distribution[level]++;
  });

  // Convert to percentages
  return {
    beginner: calculatePercentage(distribution.beginner, total),
    intermediate: calculatePercentage(distribution.intermediate, total),
    advanced: calculatePercentage(distribution.advanced, total),
    expert: calculatePercentage(distribution.expert, total),
    master: calculatePercentage(distribution.master, total),
  };
}

// ============================================================================
// RADAR CHART DATA
// ============================================================================

/**
 * Generate radar chart data for soft skills
 */
export function generateRadarChartData(skills: SoftSkillMetric[]): Array<{
  skill: string;
  preScore: number;
  postScore: number;
  target: number;
}> {
  return skills.map((skill) => ({
    skill: getSkillName(skill.skillType),
    preScore: skill.preScore,
    postScore: skill.postScore,
    target: 85, // Industry target
  }));
}

// ============================================================================
// GAP ANALYSIS
// ============================================================================

/**
 * Identify soft skills below target
 */
export function identifySkillGaps(
  skills: SoftSkillMetric[],
  targetScore: number = 85,
): SoftSkillMetric[] {
  return skills
    .filter((skill) => skill.postScore < targetScore)
    .sort((a, b) => a.postScore - b.postScore);
}

/**
 * Identify skills showing minimal improvement
 */
export function identifyLowImprovementSkills(
  skills: SoftSkillMetric[],
  minimumImprovement: number = 10,
): SoftSkillMetric[] {
  return skills
    .filter((skill) => skill.improvement < minimumImprovement)
    .sort((a, b) => a.improvement - b.improvement);
}

/**
 * Identify strongest soft skills
 */
export function identifyStrongestSkills(
  skills: SoftSkillMetric[],
  topN: number = 3,
): SoftSkillMetric[] {
  return skills.sort((a, b) => b.postScore - a.postScore).slice(0, topN);
}

/**
 * Identify skills needing most improvement
 */
export function identifyWeakestSkills(
  skills: SoftSkillMetric[],
  topN: number = 3,
): SoftSkillMetric[] {
  return skills.sort((a, b) => a.postScore - b.postScore).slice(0, topN);
}

// ============================================================================
// CORRELATION ANALYSIS
// ============================================================================

/**
 * Calculate correlation between soft skills and job placement
 */
export function calculateJobPlacementCorrelation(
  softSkillsScores: number[],
  placementOutcomes: boolean[],
): number {
  if (softSkillsScores.length !== placementOutcomes.length) {
    throw new Error("Arrays must have same length");
  }

  const n = softSkillsScores.length;
  if (n === 0) return 0;

  // Convert boolean to 0/1
  const placementNumeric = placementOutcomes.map((p) => (p ? 1 : 0));

  // Calculate means
  const meanSkills =
    softSkillsScores.reduce((a: number, b: number) => a + b, 0) / n;
  const meanPlacement =
    placementNumeric.reduce((a: number, b: number) => a + b, 0) / n;

  // Calculate correlation coefficient
  let numerator = 0;
  let denomSkills = 0;
  let denomPlacement = 0;

  for (let i = 0; i < n; i++) {
    const skillDiff = softSkillsScores[i] - meanSkills;
    const placementDiff = placementNumeric[i] - meanPlacement;

    numerator += skillDiff * placementDiff;
    denomSkills += skillDiff * skillDiff;
    denomPlacement += placementDiff * placementDiff;
  }

  if (denomSkills === 0 || denomPlacement === 0) return 0;

  const correlation = numerator / Math.sqrt(denomSkills * denomPlacement);
  return Number(correlation.toFixed(3));
}

// ============================================================================
// RECOMMENDATIONS
// ============================================================================

/**
 * Generate soft skills improvement recommendations
 */
export function generateSoftSkillRecommendations(
  skills: SoftSkillMetric[],
): Array<{
  skill: string;
  issue: string;
  recommendation: string;
  priority: "high" | "medium" | "low";
}> {
  const recommendations: Array<{
    skill: string;
    issue: string;
    recommendation: string;
    priority: "high" | "medium" | "low";
  }> = [];

  // Identify critical gaps (high-weight skills below target)
  skills.forEach((skill) => {
    const skillName = getSkillName(skill.skillType);
    const weight = SKILL_WEIGHTS[skill.skillType] || 0;
    const isHighPriority = weight >= 0.2;

    // Below target
    if (skill.postScore < 85) {
      recommendations.push({
        skill: skillName,
        issue: `Post-training score of ${skill.postScore}% below target (85%)`,
        recommendation: getSkillSpecificRecommendation(skill.skillType),
        priority: isHighPriority ? "high" : "medium",
      });
    }

    // Low improvement
    else if (skill.improvement < 10) {
      recommendations.push({
        skill: skillName,
        issue: `Only ${skill.improvement}% improvement from pre to post training`,
        recommendation: "Review training methods, add more practical exercises",
        priority: "medium",
      });
    }
  });

  return recommendations;
}

/**
 * Get skill-specific training recommendations
 */
function getSkillSpecificRecommendation(skillType: SoftSkillType): string {
  switch (skillType) {
    case SoftSkillType.CUSTOMER_SERVICE:
      return "Increase role-play scenarios with difficult guests, add real guest interaction opportunities";
    case SoftSkillType.COMMUNICATION:
      return "Add presentation exercises, practice active listening, implement peer feedback sessions";
    case SoftSkillType.TEAMWORK:
      return "Implement group projects, assign team roles in labs, add collaborative assessments";
    case SoftSkillType.EMOTIONAL_INTELLIGENCE:
      return "Add case studies on conflict resolution, practice empathy exercises, guest speaker sessions";
    case SoftSkillType.PROFESSIONALISM:
      return "Implement dress code enforcement, punctuality tracking with consequences, professional conduct scenarios";
    default:
      return "Review curriculum and add more hands-on practice opportunities";
  }
}

// ============================================================================
// BENCHMARKING
// ============================================================================

/**
 * Compare soft skills to industry benchmarks
 */
export function compareToIndustryBenchmarks(skills: SoftSkillMetric[]): Array<{
  skill: string;
  currentScore: number;
  industryAverage: number;
  gap: number;
  status: "above" | "at" | "below";
}> {
  // Industry benchmarks for hospitality (based on typical training programs)
  const benchmarks: Record<SoftSkillType, number> = {
    [SoftSkillType.CUSTOMER_SERVICE]: 82,
    [SoftSkillType.COMMUNICATION]: 78,
    [SoftSkillType.TEAMWORK]: 80,
    [SoftSkillType.EMOTIONAL_INTELLIGENCE]: 75,
    [SoftSkillType.PROFESSIONALISM]: 85,
  };

  return skills.map((skill) => {
    const benchmark = benchmarks[skill.skillType] || 80;
    const gap = skill.postScore - benchmark;

    let status: "above" | "at" | "below";
    if (gap > 3) status = "above";
    else if (gap >= -3) status = "at";
    else status = "below";

    return {
      skill: getSkillName(skill.skillType),
      currentScore: skill.postScore,
      industryAverage: benchmark,
      gap,
      status,
    };
  });
}

/**
 * Calculate soft skills readiness for employment
 */
export function calculateEmploymentReadiness(skills: SoftSkillMetric[]): {
  ready: boolean;
  score: number;
  deficientSkills: string[];
} {
  const weightedScore = calculateWeightedScore(skills, true);
  const ready = weightedScore >= 80;

  const deficientSkills = skills
    .filter((skill) => skill.postScore < 75)
    .map((skill) => getSkillName(skill.skillType));

  return {
    ready,
    score: weightedScore,
    deficientSkills,
  };
}

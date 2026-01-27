/**
 * Employment Analysis Utilities
 * Functions for analyzing job placement outcomes and employer feedback
 */

import { calculatePercentage } from "./analytics-utils";

// ============================================================================
// PLACEMENT RATE CALCULATIONS
// ============================================================================

/**
 * Calculate employment rate at specific timeframe
 */
export function calculateEmploymentRate(
  employedCount: number,
  eligibleGraduates: number,
): number {
  return calculatePercentage(employedCount, eligibleGraduates);
}

/**
 * Calculate placement rates at multiple timeframes
 */
export function calculatePlacementRates(employmentData: {
  totalGraduates: number;
  employedAt3Months: number;
  employedAt6Months: number;
  employedAt12Months: number;
}): {
  at3Months: number;
  at6Months: number;
  at12Months: number;
} {
  return {
    at3Months: calculateEmploymentRate(
      employmentData.employedAt3Months,
      employmentData.totalGraduates,
    ),
    at6Months: calculateEmploymentRate(
      employmentData.employedAt6Months,
      employmentData.totalGraduates,
    ),
    at12Months: calculateEmploymentRate(
      employmentData.employedAt12Months,
      employmentData.totalGraduates,
    ),
  };
}

// ============================================================================
// SALARY ANALYSIS
// ============================================================================

export interface SalaryData {
  amount: number;
  currency: string;
}

/**
 * Calculate average salary
 */
export function calculateAverageSalary(salaries: number[]): number {
  if (salaries.length === 0) return 0;
  const total = salaries.reduce((sum, salary) => sum + salary, 0);
  return Math.round(total / salaries.length);
}

/**
 * Calculate median salary
 */
export function calculateMedianSalary(salaries: number[]): number {
  if (salaries.length === 0) return 0;
  const sorted = [...salaries].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 0) {
    return Math.round((sorted[mid - 1] + sorted[mid]) / 2);
  }
  return sorted[mid];
}

/**
 * Calculate salary distribution
 */
export function calculateSalaryDistribution(salaries: number[]): Array<{
  range: string;
  count: number;
  percentage: number;
}> {
  if (salaries.length === 0) return [];

  // Define salary ranges for hospitality (PHP)
  const ranges = [
    { min: 0, max: 15000, label: "< ₱15,000" },
    { min: 15000, max: 20000, label: "₱15,000 - ₱20,000" },
    { min: 20000, max: 25000, label: "₱20,000 - ₱25,000" },
    { min: 25000, max: 30000, label: "₱25,000 - ₱30,000" },
    { min: 30000, max: 40000, label: "₱30,000 - ₱40,000" },
    { min: 40000, max: Infinity, label: "> ₱40,000" },
  ];

  const distribution = ranges.map((range) => {
    const count = salaries.filter(
      (s) => s >= range.min && s < range.max,
    ).length;

    return {
      range: range.label,
      count,
      percentage: calculatePercentage(count, salaries.length),
    };
  });

  return distribution.filter((d) => d.count > 0);
}

// ============================================================================
// JOB TITLE ANALYSIS
// ============================================================================

/**
 * Get top job titles by frequency
 */
export function getTopJobTitles(
  jobTitles: string[],
  topN: number = 10,
): Array<{ title: string; count: number; percentage: number }> {
  if (jobTitles.length === 0) return [];

  // Count occurrences
  const counts = new Map<string, number>();
  jobTitles.forEach((title) => {
    const normalized = title.trim().toLowerCase();
    counts.set(normalized, (counts.get(normalized) || 0) + 1);
  });

  // Convert to array and sort
  const titleCounts = Array.from(counts.entries())
    .map(([title, count]) => ({
      title: toTitleCase(title),
      count,
      percentage: calculatePercentage(count, jobTitles.length),
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, topN);

  return titleCounts;
}

function toTitleCase(str: string): string {
  return str.replace(/\b\w/g, (char) => char.toUpperCase());
}

/**
 * Categorize job titles by level
 */
export function categorizeJobByLevel(
  jobTitle: string,
): "entry" | "intermediate" | "senior" | "management" {
  const title = jobTitle.toLowerCase();

  if (
    title.includes("trainee") ||
    title.includes("intern") ||
    title.includes("assistant") ||
    title.includes("associate")
  ) {
    return "entry";
  }

  if (
    title.includes("senior") ||
    title.includes("lead") ||
    title.includes("specialist")
  ) {
    return "senior";
  }

  if (
    title.includes("manager") ||
    title.includes("director") ||
    title.includes("head") ||
    title.includes("supervisor")
  ) {
    return "management";
  }

  return "intermediate";
}

/**
 * Calculate distribution by job level
 */
export function calculateJobLevelDistribution(
  jobTitles: string[],
): Record<"entry" | "intermediate" | "senior" | "management", number> {
  const total = jobTitles.length;
  if (total === 0) {
    return { entry: 0, intermediate: 0, senior: 0, management: 0 };
  }

  const categories = {
    entry: 0,
    intermediate: 0,
    senior: 0,
    management: 0,
  };

  jobTitles.forEach((title) => {
    const level = categorizeJobByLevel(title);
    categories[level]++;
  });

  return {
    entry: calculatePercentage(categories.entry, total),
    intermediate: calculatePercentage(categories.intermediate, total),
    senior: calculatePercentage(categories.senior, total),
    management: calculatePercentage(categories.management, total),
  };
}

// ============================================================================
// EMPLOYER FEEDBACK (NPS)
// ============================================================================

/**
 * Calculate Net Promoter Score from employer ratings
 * Scale: -100 to 100
 */
export function calculateNPS(ratings: number[]): number {
  if (ratings.length === 0) return 0;

  const promoters = ratings.filter((r) => r >= 9).length;
  const passives = ratings.filter((r) => r >= 7 && r < 9).length;
  const detractors = ratings.filter((r) => r < 7).length;

  const promoterPercentage = (promoters / ratings.length) * 100;
  const detractorPercentage = (detractors / ratings.length) * 100;

  return Math.round(promoterPercentage - detractorPercentage);
}

/**
 * Interpret NPS score
 */
export function interpretNPS(nps: number): {
  category: "excellent" | "good" | "average" | "poor";
  description: string;
} {
  if (nps >= 70) {
    return {
      category: "excellent",
      description: "World-class employer satisfaction",
    };
  } else if (nps >= 50) {
    return {
      category: "good",
      description: "Strong employer satisfaction",
    };
  } else if (nps >= 0) {
    return {
      category: "average",
      description: "Room for improvement",
    };
  } else {
    return {
      category: "poor",
      description: "Needs immediate attention",
    };
  }
}

// ============================================================================
// SKILLS GAP ANALYSIS
// ============================================================================

export interface SkillGap {
  skill: string;
  mentionedByCount: number;
  severity: "critical" | "high" | "medium" | "low";
}

/**
 * Identify most common skills gaps from employer feedback
 */
export function identifySkillsGaps(
  feedbackComments: string[],
  totalEmployers: number,
): SkillGap[] {
  // Common hospitality skill keywords to look for
  const skillKeywords = [
    {
      skill: "Communication",
      keywords: ["communication", "speaking", "language"],
    },
    {
      skill: "Technical Skills",
      keywords: ["technical", "pms", "systems", "tools"],
    },
    {
      skill: "Initiative",
      keywords: ["initiative", "proactive", "self-starter"],
    },
    {
      skill: "Attention to Detail",
      keywords: ["detail", "thorough", "careful"],
    },
    { skill: "Time Management", keywords: ["time", "punctual", "deadline"] },
    { skill: "Problem Solving", keywords: ["problem", "solution", "resolve"] },
    { skill: "Teamwork", keywords: ["team", "collaboration", "cooperate"] },
    { skill: "Customer Service", keywords: ["customer", "guest", "service"] },
  ];

  const gaps: SkillGap[] = [];

  skillKeywords.forEach(({ skill, keywords }) => {
    let mentionedCount = 0;

    feedbackComments.forEach((comment) => {
      const lowerComment = comment.toLowerCase();
      const mentioned = keywords.some((keyword) =>
        lowerComment.includes(keyword),
      );
      if (mentioned) mentionedCount++;
    });

    if (mentionedCount > 0) {
      const percentage = (mentionedCount / totalEmployers) * 100;

      let severity: "critical" | "high" | "medium" | "low";
      if (percentage >= 40) severity = "critical";
      else if (percentage >= 25) severity = "high";
      else if (percentage >= 15) severity = "medium";
      else severity = "low";

      gaps.push({
        skill,
        mentionedByCount: mentionedCount,
        severity,
      });
    }
  });

  return gaps.sort((a, b) => b.mentionedByCount - a.mentionedByCount);
}

// ============================================================================
// RETENTION ANALYSIS
// ============================================================================

/**
 * Calculate job retention rate
 */
export function calculateRetentionRate(
  stillEmployed: number,
  initiallyEmployed: number,
): number {
  return calculatePercentage(stillEmployed, initiallyEmployed);
}

/**
 * Calculate average time to employment (in days)
 */
export function calculateAverageTimeToEmployment(
  daysToEmployment: number[],
): number {
  if (daysToEmployment.length === 0) return 0;
  const total = daysToEmployment.reduce((sum, days) => sum + days, 0);
  return Math.round(total / daysToEmployment.length);
}

// ============================================================================
// RECOMMENDATIONS
// ============================================================================

/**
 * Generate employment outcome recommendations
 */
export function generateEmploymentRecommendations(data: {
  placementRate3Months: number;
  placementRate6Months: number;
  averageSalary: number;
  nps: number;
  topSkillsGaps: SkillGap[];
}): Array<{
  area: string;
  issue: string;
  recommendation: string;
  priority: "high" | "medium" | "low";
}> {
  const recommendations: Array<{
    area: string;
    issue: string;
    recommendation: string;
    priority: "high" | "medium" | "low";
  }> = [];

  // Placement rate recommendations
  if (data.placementRate3Months < 75) {
    recommendations.push({
      area: "Job Placement",
      issue: `Only ${data.placementRate3Months}% placed within 3 months (target: 75%)`,
      recommendation:
        "Strengthen industry partnerships, add job placement support, implement career services",
      priority: "high",
    });
  }

  // NPS recommendations
  const npsInterpretation = interpretNPS(data.nps);
  if (
    npsInterpretation.category === "poor" ||
    npsInterpretation.category === "average"
  ) {
    recommendations.push({
      area: "Employer Satisfaction",
      issue: `NPS of ${data.nps} indicates ${npsInterpretation.description}`,
      recommendation:
        "Conduct employer roundtable, align curriculum with industry needs, add employer feedback loop",
      priority: "high",
    });
  }

  // Skills gap recommendations
  data.topSkillsGaps.slice(0, 3).forEach((gap) => {
    if (gap.severity === "critical" || gap.severity === "high") {
      recommendations.push({
        area: "Skills Development",
        issue: `${gap.skill} gap identified by ${gap.mentionedByCount} employers`,
        recommendation: `Add dedicated ${gap.skill.toLowerCase()} training module, increase practice opportunities`,
        priority: gap.severity === "critical" ? "high" : "medium",
      });
    }
  });

  // Salary recommendations
  if (data.averageSalary < 18000) {
    recommendations.push({
      area: "Graduate Compensation",
      issue: `Average starting salary below industry standard (₱${data.averageSalary})`,
      recommendation:
        "Add advanced certifications, implement internship program with premium employers",
      priority: "medium",
    });
  }

  return recommendations;
}

/**
 * Calculate placement success score (0-100)
 */
export function calculatePlacementSuccessScore(data: {
  placementRate3Months: number;
  placementRate6Months: number;
  averageSalary: number;
  industryAverageSalary: number;
  nps: number;
}): {
  score: number;
  rating: "excellent" | "good" | "fair" | "needs_improvement";
} {
  const weights = {
    placementRate: 0.4,
    salary: 0.3,
    nps: 0.3,
  };

  // Normalize placement rate (target 75%)
  const placementScore = Math.min(100, (data.placementRate3Months / 75) * 100);

  // Normalize salary (compare to industry average)
  const salaryScore = Math.min(
    100,
    (data.averageSalary / data.industryAverageSalary) * 100,
  );

  // Normalize NPS (-100 to 100 → 0 to 100)
  const npsScore = ((data.nps + 100) / 200) * 100;

  const score =
    placementScore * weights.placementRate +
    salaryScore * weights.salary +
    npsScore * weights.nps;

  let rating: "excellent" | "good" | "fair" | "needs_improvement";
  if (score >= 85) rating = "excellent";
  else if (score >= 70) rating = "good";
  else if (score >= 55) rating = "fair";
  else rating = "needs_improvement";

  return {
    score: Math.round(score),
    rating,
  };
}

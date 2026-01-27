/**
 * Benchmark Comparison Utilities
 * Compare HBM Academy metrics against industry standards
 */

import { BenchmarkMetric } from "../types";
import { calculatePercentage } from "./analytics-utils";

// ============================================================================
// INDUSTRY BENCHMARKS (Hospitality Training Programs)
// ============================================================================

export const INDUSTRY_BENCHMARKS = {
  // Completion & Retention
  courseCompletionRate: {
    average: 72,
    top10Percent: 85,
    top5Percent: 90,
  },
  assessmentPassRate: {
    average: 78,
    top10Percent: 88,
    top5Percent: 92,
  },
  studentRetention: {
    average: 80,
    top10Percent: 90,
    top5Percent: 95,
  },

  // Soft Skills
  softSkillsAverage: {
    average: 75,
    top10Percent: 85,
    top5Percent: 90,
  },
  customerServiceScore: {
    average: 78,
    top10Percent: 87,
    top5Percent: 92,
  },

  // Employment Outcomes
  jobPlacementRate3Months: {
    average: 65,
    top10Percent: 80,
    top5Percent: 88,
  },
  jobPlacementRate6Months: {
    average: 75,
    top10Percent: 88,
    top5Percent: 93,
  },
  employerSatisfactionNPS: {
    average: 35,
    top10Percent: 60,
    top5Percent: 75,
  },

  // Attendance & Engagement
  attendanceRate: {
    average: 88,
    top10Percent: 95,
    top5Percent: 97,
  },
  punctualityRate: {
    average: 85,
    top10Percent: 92,
    top5Percent: 95,
  },

  // Student Satisfaction
  studentSatisfaction: {
    average: 4.2,
    top10Percent: 4.6,
    top5Percent: 4.8,
  },

  // Certifications
  certificationPassRate: {
    average: 70,
    top10Percent: 85,
    top5Percent: 90,
  },
  firstAttemptPassRate: {
    average: 65,
    top10Percent: 80,
    top5Percent: 88,
  },
} as const;

// ============================================================================
// PERCENTILE CALCULATIONS
// ============================================================================

/**
 * Calculate percentile ranking compared to industry
 */
export function calculatePercentile(
  value: number,
  benchmark: {
    average: number;
    top10Percent: number;
    top5Percent: number;
  },
): number {
  // Simplified percentile calculation
  // Assumes normal distribution

  if (value >= benchmark.top5Percent) {
    return 95 + ((value - benchmark.top5Percent) / benchmark.top5Percent) * 5;
  } else if (value >= benchmark.top10Percent) {
    const range = benchmark.top5Percent - benchmark.top10Percent;
    const position = value - benchmark.top10Percent;
    return 90 + (position / range) * 5;
  } else if (value >= benchmark.average) {
    const range = benchmark.top10Percent - benchmark.average;
    const position = value - benchmark.average;
    return 50 + (position / range) * 40;
  } else {
    const range = benchmark.average;
    return Math.max(1, (value / range) * 50);
  }
}

/**
 * Calculate overall performance percentile across all metrics
 */
export function calculateOverallPercentile(metrics: BenchmarkMetric[]): number {
  if (metrics.length === 0) return 50;

  const totalPercentile = metrics.reduce(
    (sum, metric) => sum + metric.percentile,
    0,
  );

  return Math.round(totalPercentile / metrics.length);
}

// ============================================================================
// COMPARISON FUNCTIONS
// ============================================================================

/**
 * Compare single metric to benchmark
 */
export function compareMetric(
  metricName: string,
  value: number,
  benchmarkKey: keyof typeof INDUSTRY_BENCHMARKS,
): BenchmarkMetric {
  const benchmark = INDUSTRY_BENCHMARKS[benchmarkKey];

  const percentile = calculatePercentile(value, benchmark);
  const competitiveAdvantage = value >= benchmark.top10Percent;

  return {
    metricName,
    hbmValue: value,
    industryAverage: benchmark.average,
    top10Percent: benchmark.top10Percent,
    top5Percent: benchmark.top5Percent,
    percentile: Math.round(percentile),
    competitiveAdvantage,
  };
}

/**
 * Compare all metrics at once
 */
export function compareAllMetrics(metrics: {
  courseCompletionRate: number;
  assessmentPassRate: number;
  softSkillsAverage: number;
  jobPlacementRate3Months: number;
  attendanceRate: number;
  studentSatisfaction: number;
  certificationPassRate: number;
  employerNPS: number;
}): BenchmarkMetric[] {
  return [
    compareMetric(
      "Course Completion Rate",
      metrics.courseCompletionRate,
      "courseCompletionRate",
    ),
    compareMetric(
      "Assessment Pass Rate",
      metrics.assessmentPassRate,
      "assessmentPassRate",
    ),
    compareMetric(
      "Soft Skills Average",
      metrics.softSkillsAverage,
      "softSkillsAverage",
    ),
    compareMetric(
      "Job Placement Rate (3mo)",
      metrics.jobPlacementRate3Months,
      "jobPlacementRate3Months",
    ),
    compareMetric("Attendance Rate", metrics.attendanceRate, "attendanceRate"),
    compareMetric(
      "Student Satisfaction",
      metrics.studentSatisfaction,
      "studentSatisfaction",
    ),
    compareMetric(
      "Certification Pass Rate",
      metrics.certificationPassRate,
      "certificationPassRate",
    ),
    compareMetric(
      "Employer Satisfaction (NPS)",
      metrics.employerNPS,
      "employerSatisfactionNPS",
    ),
  ];
}

// ============================================================================
// RADAR CHART DATA
// ============================================================================

/**
 * Generate radar chart data for benchmark comparison
 */
export function generateBenchmarkRadarData(metrics: BenchmarkMetric[]): Array<{
  metric: string;
  hbm: number;
  industry: number;
}> {
  return metrics.map((metric) => ({
    metric: metric.metricName,
    hbm: metric.hbmValue,
    industry: metric.industryAverage,
  }));
}

// ============================================================================
// COMPETITIVE ADVANTAGES
// ============================================================================

/**
 * Identify areas where HBM Academy exceeds industry standards
 */
export function identifyCompetitiveAdvantages(
  metrics: BenchmarkMetric[],
): string[] {
  const advantages: string[] = [];

  metrics.forEach((metric) => {
    if (metric.percentile >= 95) {
      advantages.push(
        `${metric.metricName}: Top 5% performance (${metric.percentile}th percentile)`,
      );
    } else if (metric.percentile >= 90) {
      advantages.push(
        `${metric.metricName}: Top 10% performance (${metric.percentile}th percentile)`,
      );
    } else if (metric.competitiveAdvantage) {
      const difference = metric.hbmValue - metric.industryAverage;
      const percentAbove = (
        (difference / metric.industryAverage) *
        100
      ).toFixed(1);
      advantages.push(
        `${metric.metricName}: ${percentAbove}% above industry average`,
      );
    }
  });

  return advantages;
}

/**
 * Identify areas needing improvement
 */
export function identifyImprovementAreas(metrics: BenchmarkMetric[]): Array<{
  metric: string;
  gap: number;
  priority: "high" | "medium" | "low";
}> {
  const improvements: Array<{
    metric: string;
    gap: number;
    priority: "high" | "medium" | "low";
  }> = [];

  metrics.forEach((metric) => {
    if (metric.hbmValue < metric.industryAverage) {
      const gap = metric.industryAverage - metric.hbmValue;
      const percentBelow = (gap / metric.industryAverage) * 100;

      let priority: "high" | "medium" | "low";
      if (metric.percentile < 25) priority = "high";
      else if (metric.percentile < 40) priority = "medium";
      else priority = "low";

      improvements.push({
        metric: metric.metricName,
        gap: Number(gap.toFixed(2)),
        priority,
      });
    }
  });

  return improvements.sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });
}

// ============================================================================
// PERFORMANCE RATING
// ============================================================================

/**
 * Get overall performance rating
 */
export function getPerformanceRating(overallPercentile: number): {
  rating: "exceptional" | "excellent" | "good" | "average" | "below_average";
  description: string;
} {
  if (overallPercentile >= 95) {
    return {
      rating: "exceptional",
      description: "Top 5% - World-class performance",
    };
  } else if (overallPercentile >= 90) {
    return {
      rating: "excellent",
      description: "Top 10% - Industry leading",
    };
  } else if (overallPercentile >= 70) {
    return {
      rating: "good",
      description: "Above average - Strong performance",
    };
  } else if (overallPercentile >= 40) {
    return {
      rating: "average",
      description: "Industry average - Room for growth",
    };
  } else {
    return {
      rating: "below_average",
      description: "Below average - Improvement needed",
    };
  }
}

// ============================================================================
// GAP ANALYSIS
// ============================================================================

/**
 * Calculate gap to reach top tier
 */
export function calculateGapToTopTier(
  currentValue: number,
  benchmarkKey: keyof typeof INDUSTRY_BENCHMARKS,
  tier: "top10" | "top5" = "top10",
): {
  gap: number;
  percentageIncrease: number;
  achievable: boolean;
} {
  const benchmark = INDUSTRY_BENCHMARKS[benchmarkKey];
  const targetValue =
    tier === "top10" ? benchmark.top10Percent : benchmark.top5Percent;

  const gap = targetValue - currentValue;
  const percentageIncrease = currentValue > 0 ? (gap / currentValue) * 100 : 0;

  // Achievable if gap is less than 20% increase
  const achievable = percentageIncrease < 20;

  return {
    gap: Number(gap.toFixed(2)),
    percentageIncrease: Number(percentageIncrease.toFixed(2)),
    achievable,
  };
}

/**
 * Calculate time to reach benchmark (rough estimate)
 */
export function estimateTimeToReachBenchmark(
  currentValue: number,
  targetValue: number,
  historicalGrowthRate: number, // Annual growth rate as percentage
): {
  yearsRequired: number;
  feasible: boolean;
} {
  if (currentValue >= targetValue) {
    return { yearsRequired: 0, feasible: true };
  }

  if (historicalGrowthRate <= 0) {
    return { yearsRequired: Infinity, feasible: false };
  }

  // Calculate years using compound growth formula
  const growthMultiplier = 1 + historicalGrowthRate / 100;
  const yearsRequired =
    Math.log(targetValue / currentValue) / Math.log(growthMultiplier);

  // Feasible if achievable within 3 years
  const feasible = yearsRequired <= 3;

  return {
    yearsRequired: Number(yearsRequired.toFixed(1)),
    feasible,
  };
}

// ============================================================================
// RECOMMENDATIONS
// ============================================================================

/**
 * Generate benchmark-based recommendations
 */
export function generateBenchmarkRecommendations(
  metrics: BenchmarkMetric[],
): Array<{
  area: string;
  currentPercentile: number;
  recommendation: string;
  priority: "high" | "medium" | "low";
}> {
  const recommendations: Array<{
    area: string;
    currentPercentile: number;
    recommendation: string;
    priority: "high" | "medium" | "low";
  }> = [];

  metrics.forEach((metric) => {
    if (metric.percentile < 50) {
      const gap = metric.industryAverage - metric.hbmValue;

      recommendations.push({
        area: metric.metricName,
        currentPercentile: metric.percentile,
        recommendation: `Currently ${gap.toFixed(1)} points below industry average. Focus on curriculum improvements and student support.`,
        priority: metric.percentile < 25 ? "high" : "medium",
      });
    } else if (metric.percentile >= 90) {
      recommendations.push({
        area: metric.metricName,
        currentPercentile: metric.percentile,
        recommendation: `Top 10% performance - leverage as marketing advantage and case study for other areas.`,
        priority: "low",
      });
    }
  });

  return recommendations.sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });
}

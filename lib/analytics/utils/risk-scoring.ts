/**
 * Risk Scoring Algorithm for Student Assessment
 * Identifies at-risk students and recommends interventions
 */

import {
  RiskLevel,
  RiskStudent,
  InterventionRecommendation,
  HospitalityRole,
} from "../types";

// ============================================================================
// RISK SCORING WEIGHTS
// ============================================================================

const RISK_WEIGHTS = {
  attendance: 0.3, // 30%
  assessmentScores: 0.4, // 40%
  softSkills: 0.2, // 20%
  engagement: 0.1, // 10%
};

// ============================================================================
// RISK THRESHOLDS
// ============================================================================

const RISK_THRESHOLDS = {
  critical: 40,
  high: 60,
  medium: 75,
  low: 100,
};

// ============================================================================
// MAIN RISK SCORING FUNCTION
// ============================================================================

export interface RiskFactors {
  attendanceRate: number; // 0-100
  averageScore: number; // 0-100
  softSkillsScore: number; // 0-100
  engagementScore: number; // 0-100
  missedSessions: number;
  failedAssessments: number;
  consecutiveAbsences: number;
}

/**
 * Calculate comprehensive risk score (0-100, lower = higher risk)
 */
export function calculateRiskScore(factors: RiskFactors): number {
  const { attendanceRate, averageScore, softSkillsScore, engagementScore } =
    factors;

  // Weighted average of all factors
  const riskScore =
    attendanceRate * RISK_WEIGHTS.attendance +
    averageScore * RISK_WEIGHTS.assessmentScores +
    softSkillsScore * RISK_WEIGHTS.softSkills +
    engagementScore * RISK_WEIGHTS.engagement;

  // Apply penalties for critical issues
  let finalScore = riskScore;

  // Severe penalty for multiple consecutive absences
  if (factors.consecutiveAbsences >= 3) {
    finalScore -= 15;
  }

  // Penalty for multiple assessment failures
  if (factors.failedAssessments >= 3) {
    finalScore -= 10;
  }

  // Ensure score is between 0-100
  return Math.max(0, Math.min(100, finalScore));
}

/**
 * Determine risk level based on score
 */
export function getRiskLevel(score: number): RiskLevel {
  if (score <= RISK_THRESHOLDS.critical) {
    return RiskLevel.CRITICAL;
  } else if (score <= RISK_THRESHOLDS.high) {
    return RiskLevel.HIGH;
  } else if (score <= RISK_THRESHOLDS.medium) {
    return RiskLevel.MEDIUM;
  } else {
    return RiskLevel.LOW;
  }
}

/**
 * Identify specific risk factors for a student
 */
export function identifyRiskFactors(factors: RiskFactors): {
  lowScores: boolean;
  missedSessions: number;
  weakSoftSkills: boolean;
  poorAttendance: boolean;
  failedAssessments: number;
} {
  return {
    lowScores: factors.averageScore < 60,
    missedSessions: factors.missedSessions,
    weakSoftSkills: factors.softSkillsScore < 60,
    poorAttendance: factors.attendanceRate < 75,
    failedAssessments: factors.failedAssessments,
  };
}

/**
 * Get recommended interventions based on risk factors
 */
export function getRecommendedInterventions(
  riskLevel: RiskLevel,
  factors: RiskFactors,
  role: HospitalityRole,
): InterventionRecommendation[] {
  const recommendations: InterventionRecommendation[] = [];

  // Critical interventions for low attendance
  if (factors.attendanceRate < 75 || factors.consecutiveAbsences >= 3) {
    recommendations.push({
      type: "counseling",
      priority: "high",
      description:
        "Immediate counseling required to address attendance issues and identify barriers to participation.",
    });
  }

  // Academic support for low scores
  if (factors.averageScore < 60) {
    recommendations.push({
      type: "tutoring",
      priority: riskLevel === RiskLevel.CRITICAL ? "high" : "medium",
      description:
        "One-on-one tutoring sessions to improve understanding of core competencies.",
    });
  }

  // Practical skills support based on assessment failures
  if (factors.failedAssessments >= 2) {
    recommendations.push({
      type: "lab_time",
      priority: "high",
      description: `Additional ${getRoleSpecificPractice(role)} practice time to build hands-on proficiency.`,
    });
  }

  // Soft skills coaching
  if (factors.softSkillsScore < 60) {
    recommendations.push({
      type: "coaching",
      priority: "medium",
      description:
        "Soft skills coaching focusing on communication, teamwork, and professionalism.",
    });
  }

  // Engagement interventions
  if (factors.engagementScore < 50) {
    recommendations.push({
      type: "mentoring",
      priority: "medium",
      description:
        "Pair with peer mentor to increase engagement and motivation.",
    });
  }

  // If critical risk, add comprehensive support
  if (riskLevel === RiskLevel.CRITICAL && recommendations.length < 3) {
    recommendations.push({
      type: "mentoring",
      priority: "high",
      description:
        "Assign dedicated mentor for weekly check-ins and personalized support plan.",
    });
  }

  return recommendations;
}

/**
 * Get role-specific practice recommendations
 */
function getRoleSpecificPractice(role: HospitalityRole): string {
  switch (role) {
    case HospitalityRole.FB_SERVICE:
      return "food & beverage service";
    case HospitalityRole.HOUSEKEEPING:
      return "room preparation and housekeeping";
    case HospitalityRole.FRONT_OFFICE:
      return "front desk operations and PMS";
    case HospitalityRole.MANAGEMENT:
      return "leadership and management simulation";
    case HospitalityRole.CULINARY:
      return "kitchen operations and food preparation";
    default:
      return "practical";
  }
}

/**
 * Calculate engagement score from various metrics
 */
export function calculateEngagementScore(metrics: {
  sessionParticipation: number; // 0-100
  labParticipation: number; // 0-100
  assignmentTimeliness: number; // 0-100
  interactionFrequency: number; // 0-100
}): number {
  const weights = {
    sessionParticipation: 0.3,
    labParticipation: 0.4,
    assignmentTimeliness: 0.2,
    interactionFrequency: 0.1,
  };

  return (
    metrics.sessionParticipation * weights.sessionParticipation +
    metrics.labParticipation * weights.labParticipation +
    metrics.assignmentTimeliness * weights.assignmentTimeliness +
    metrics.interactionFrequency * weights.interactionFrequency
  );
}

/**
 * Predict dropout risk based on early indicators
 */
export function predictDropoutRisk(
  weekNumber: number,
  factors: RiskFactors,
): {
  dropoutProbability: number;
  confidenceLevel: "low" | "medium" | "high";
} {
  // Early weeks have less predictive power
  const confidence =
    weekNumber < 4 ? "low" : weekNumber < 8 ? "medium" : "high";

  // Calculate dropout probability based on risk factors
  let probability = 0;

  // Attendance is strongest predictor
  if (factors.attendanceRate < 60) probability += 0.4;
  else if (factors.attendanceRate < 75) probability += 0.2;
  else if (factors.attendanceRate < 85) probability += 0.1;

  // Multiple failures indicate struggle
  if (factors.failedAssessments >= 3) probability += 0.3;
  else if (factors.failedAssessments >= 2) probability += 0.15;

  // Low engagement compounds risk
  if (factors.engagementScore < 40) probability += 0.2;
  else if (factors.engagementScore < 60) probability += 0.1;

  // Consecutive absences are critical
  if (factors.consecutiveAbsences >= 5) probability += 0.3;
  else if (factors.consecutiveAbsences >= 3) probability += 0.15;

  return {
    dropoutProbability: Math.min(1, probability),
    confidenceLevel: confidence,
  };
}

/**
 * Identify students who have shown recent improvement
 */
export function identifyImprovingStudents(
  currentScore: number,
  previousScore: number,
  minimumImprovement: number = 10,
): boolean {
  const improvement = currentScore - previousScore;
  return improvement >= minimumImprovement;
}

/**
 * Calculate intervention effectiveness score
 */
export function calculateInterventionEffectiveness(
  scoreBeforeIntervention: number,
  scoreAfterIntervention: number,
  attendanceBeforeIntervention: number,
  attendanceAfterIntervention: number,
): {
  effective: boolean;
  improvementPercentage: number;
} {
  const scoreImprovement = scoreAfterIntervention - scoreBeforeIntervention;
  const attendanceImprovement =
    attendanceAfterIntervention - attendanceBeforeIntervention;

  // Intervention is effective if either score improved by 10+ or attendance by 15+
  const effective = scoreImprovement >= 10 || attendanceImprovement >= 15;

  // Calculate overall improvement percentage
  const improvementPercentage =
    scoreImprovement * 0.6 + attendanceImprovement * 0.4;

  return {
    effective,
    improvementPercentage,
  };
}

/**
 * Priority sort students by risk (highest risk first)
 */
export function sortByRiskPriority(students: RiskStudent[]): RiskStudent[] {
  const priority = {
    [RiskLevel.CRITICAL]: 4,
    [RiskLevel.HIGH]: 3,
    [RiskLevel.MEDIUM]: 2,
    [RiskLevel.LOW]: 1,
  };

  return students.sort((a, b) => {
    // First by risk level
    const levelDiff = priority[b.riskLevel] - priority[a.riskLevel];
    if (levelDiff !== 0) return levelDiff;

    // Then by risk score (lower is worse)
    return a.riskScore - b.riskScore;
  });
}

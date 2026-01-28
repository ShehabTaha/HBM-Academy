/**
 * Analytics Type Definitions for HBM Academy
 * Comprehensive TypeScript interfaces for the analytics dashboard
 */

// ============================================================================
// ENUMS
// ============================================================================

export enum HospitalityRole {
  FB_SERVICE = "fb_service",
  HOUSEKEEPING = "housekeeping",
  FRONT_OFFICE = "front_office",
  MANAGEMENT = "management",
  CULINARY = "culinary",
}

export enum AssessmentType {
  KNOWLEDGE_QUIZ = "knowledge_quiz",
  PRACTICAL_DEMO = "practical_demo",
  SIMULATION = "simulation",
  PORTFOLIO = "portfolio",
  ROLE_PLAY = "role_play",
}

export enum SoftSkillType {
  CUSTOMER_SERVICE = "customer_service",
  COMMUNICATION = "communication",
  TEAMWORK = "teamwork",
  EMOTIONAL_INTELLIGENCE = "emotional_intelligence",
  PROFESSIONALISM = "professionalism",
}

export enum CertificationType {
  TESDA_NC2_HOUSEKEEPING = "tesda_nc2_housekeeping",
  TESDA_NC2_FB = "tesda_nc2_fb",
  TESDA_NC2_FRONT_OFFICE = "tesda_nc2_front_office",
  TESDA_NC2_KITCHEN = "tesda_nc2_kitchen",
  TESDA_NC2_MANAGEMENT = "tesda_nc2_management",
  FOOD_SAFETY = "food_safety",
  FIRST_AID = "first_aid",
  CPR = "cpr",
}

export enum RiskLevel {
  CRITICAL = "critical",
  HIGH = "high",
  MEDIUM = "medium",
  LOW = "low",
}

export enum TrendDirection {
  IMPROVING = "improving",
  STABLE = "stable",
  DECLINING = "declining",
}

export enum DateRange {
  LAST_7_DAYS = "7d",
  LAST_30_DAYS = "30d",
  LAST_90_DAYS = "90d",
  LAST_6_MONTHS = "6m",
  LAST_YEAR = "1y",
  CUSTOM = "custom",
}

// ============================================================================
// FILTER TYPES
// ============================================================================

export interface AnalyticsFilters {
  dateRange: DateRange;
  customStartDate?: Date;
  customEndDate?: Date;
  courses?: string[];
  cohorts?: string[];
  programs?: string[];
  roles?: string[];
}

// ============================================================================
// KPI TYPES
// ============================================================================

export interface KPIMetric {
  value: number;
  target: number;
  percentToTarget: number;
  trend: {
    direction: TrendDirection;
    percentChange: number;
    comparisonPeriod: string;
  };
  label: string;
  icon: string;
  unit?: "count" | "percentage" | "rating" | "currency";
}

export interface AnalyticsOverview {
  totalStudents: KPIMetric;
  activeUsers7d: KPIMetric;
  courseCompletionRate: KPIMetric;
  assessmentPassRate: KPIMetric;
  softSkillsAverage: KPIMetric;
  jobPlacementRate: KPIMetric;
  certificationsIssued: KPIMetric;
  attendanceRate: KPIMetric;
  studentSatisfaction: KPIMetric;
  lastUpdated: Date;
}

// ============================================================================
// ROLE PERFORMANCE TYPES
// ============================================================================

export interface RolePerformanceMetrics {
  role: HospitalityRole;
  roleName: string;
  enrollment: number;
  completionRate: number;
  averageScore: number;
  softSkillsAverage: number;
  jobPlacementRate: number;
  certificationRate: number;
}

export interface RolePerformance {
  metrics: RolePerformanceMetrics[];
  bestPerforming: HospitalityRole;
  needsImprovement: HospitalityRole;
}

// ============================================================================
// COMPETENCY TYPES
// ============================================================================

export interface CompetencyMetric {
  id: string;
  name: string;
  category: string;
  isCritical: boolean;
  masteryPercentage: number;
  averageDaysToMastery: number;
  trend: TrendDirection;
  studentsAttempted: number;
  studentsMastered: number;
  colorCode: "green" | "yellow" | "red";
}

export interface CompetencyData {
  competencies: CompetencyMetric[];
  overallMasteryRate: number;
  criticalCompetenciesMastered: number;
  averageDaysToMastery: number;
  heatmapData: Array<{
    competency: string;
    course: string;
    masteryRate: number;
  }>;
  // New Analytics Data
  trendData: Array<{
    month: string;
    [key: string]: string | number; // Dynamic keys for competencies + "Average Mastery"
  }>;
  roleComparisonData: Array<{
    competency: string;
    [key: string]: string | number; // Dynamic keys for roles
  }>;
  masteryDistribution: Array<{
    level: "Mastery" | "Proficient" | "Needs Attention";
    studentCount: number;
    percentage: number;
    color: string;
  }>;
}

// ============================================================================
// SOFT SKILLS TYPES
// ============================================================================

export interface SoftSkillMetric {
  skillType: SoftSkillType;
  skillName: string;
  preScore: number;
  postScore: number;
  improvement: number;
  improvementPercentage: number;
  distribution: {
    beginner: number;
    intermediate: number;
    advanced: number;
    expert: number;
    master: number;
  };
}

export interface SoftSkillsData {
  skills: SoftSkillMetric[];
  overallImprovement: number;
  radarChartData: Array<{
    skill: string;
    preScore: number;
    postScore: number;
    target: number;
  }>;
}

// ============================================================================
// PRACTICAL VS THEORY TYPES
// ============================================================================

export interface PracticalTheoryComparison {
  studentId: string;
  studentName: string;
  role: HospitalityRole;
  theoryScore: number;
  practicalScore: number;
  simulationScore: number;
  gap: number;
  gapPercentage: number;
}

export interface PracticalVsTheoryData {
  comparisons: PracticalTheoryComparison[];
  correlationCoefficient: number;
  rolePatterns: Array<{
    role: HospitalityRole;
    averageTheory: number;
    averagePractical: number;
    averageGap: number;
  }>;
  competenciesWithLargestGaps: Array<{
    competency: string;
    gap: number;
  }>;
}

// ============================================================================
// ASSESSMENT TYPES
// ============================================================================

export interface AssessmentTypeMetrics {
  type: AssessmentType;
  typeName: string;
  totalAttempts: number;
  passRate: number;
  averageScore: number;
  retryRate: number;
  scoreDistribution: {
    below60: number;
    between60And70: number;
    between70And80: number;
    between80And90: number;
    above90: number;
  };
}

export interface AssessmentData {
  assessmentTypes: AssessmentTypeMetrics[];
  overallPassRate: number;
  overallAverageScore: number;
}

// ============================================================================
// EMPLOYMENT TYPES
// ============================================================================

export interface EmploymentMetrics {
  employedAt3Months: number;
  employedAt6Months: number;
  employedAt12Months: number;
  averageSalary: number;
  salaryDistribution: {
    range: string;
    count: number;
    percentage: number;
  }[];
  topJobTitles: {
    title: string;
    count: number;
  }[];
  employerNPS: number;
  skillsGaps: {
    skill: string;
    gapPercentage: number;
    mentionedBy: number;
  }[];
  topEmployers: {
    name: string;
    hiresCount: number;
  }[];
}

export interface GraduateTestimonial {
  id: string;
  studentName: string;
  jobTitle: string;
  employer: string;
  testimonial: string;
  rating: number;
  graduatedAt: Date;
}

export interface EmploymentData {
  metrics: EmploymentMetrics;
  testimonials: GraduateTestimonial[];
}

// ============================================================================
// CERTIFICATION TYPES
// ============================================================================

export interface CertificationMetrics {
  type: CertificationType;
  typeName: string;
  eligible: number;
  attempted: number;
  passed: number;
  passRate: number;
  firstAttemptPassRate: number;
  averageAttempts: number;
  hardestUnits: string[];
  averageDaysToCertification: number;
  impactOnPlacement: number;
}

export interface CertificationData {
  certifications: CertificationMetrics[];
  overallCertificationRate: number;
  certificationAsRequirement: number;
}

// ============================================================================
// COHORT TYPES
// ============================================================================

export interface CohortMetrics {
  cohortId: string;
  cohortName: string;
  enrollmentPeriod: string;
  studentCount: number;
  completionRate: number;
  averageScore: number;
  softSkillsAverage: number;
  jobPlacementRate: number;
  retentionAt12Months: number;
}

export interface CohortData {
  cohorts: CohortMetrics[];
  bestCohort: string;
  worstCohort: string;
  improvementTrend: TrendDirection;
  retentionCurveData: Array<{
    cohort: string;
    month: number;
    retentionRate: number;
  }>;
}

// ============================================================================
// AT-RISK & OPPORTUNITIES TYPES
// ============================================================================

export interface InterventionRecommendation {
  type: "mentoring" | "lab_time" | "coaching" | "counseling" | "tutoring";
  priority: "high" | "medium" | "low";
  description: string;
}

export interface RiskStudent {
  studentId: string;
  studentName: string;
  email: string;
  role: HospitalityRole;
  riskScore: number;
  riskLevel: RiskLevel;
  riskFactors: {
    lowScores: boolean;
    missedSessions: number;
    weakSoftSkills: boolean;
    poorAttendance: boolean;
    failedAssessments: number;
  };
  recommendations: InterventionRecommendation[];
}

export interface OpportunityStudent {
  studentId: string;
  studentName: string;
  email: string;
  role: HospitalityRole;
  performanceScore: number;
  opportunities: {
    advancedTrack: boolean;
    internshipReady: boolean;
    certificationReady: boolean;
    peerMentor: boolean;
  };
}

export interface AtRiskOpportunitiesData {
  atRiskStudents: RiskStudent[];
  highPerformers: OpportunityStudent[];
  totalAtRisk: number;
  totalOpportunities: number;
}

// ============================================================================
// ENGAGEMENT TYPES
// ============================================================================

export interface EngagementMetrics {
  overallAttendance: number;
  punctuality: number;
  sessionParticipation: number;
  labParticipation: number;
  assignmentTimeliness: number;
  chronicAbsenceCount: number;
  engagementConsistency: number;
}

export interface ChronicAbsenceStudent {
  studentId: string;
  studentName: string;
  role: HospitalityRole;
  absenceRate: number;
  consecutiveAbsences: number;
}

export interface EngagementData {
  metrics: EngagementMetrics;
  chronicAbsenceStudents: ChronicAbsenceStudent[];
  attendanceTrend: Array<{
    date: string;
    attendanceRate: number;
  }>;
}

// ============================================================================
// TREND ANALYSIS TYPES
// ============================================================================

export interface TrendDataPoint {
  date: string;
  value: number;
  isForecast: boolean;
}

export interface TrendMetric {
  metricName: string;
  historical: TrendDataPoint[];
  forecast: TrendDataPoint[];
  confidenceInterval: {
    lower: TrendDataPoint[];
    upper: TrendDataPoint[];
  };
  rSquared: number;
  slope: number;
}

export interface TrendAnalysisData {
  completionRate: TrendMetric;
  passRate: TrendMetric;
  jobPlacement: TrendMetric;
  softSkills: TrendMetric;
  driversOfChange: {
    driver: string;
    impact: string;
    correlation: number;
  }[];
  forecastRisks: string[];
}

// ============================================================================
// BENCHMARK TYPES
// ============================================================================

export interface BenchmarkMetric {
  metricName: string;
  hbmValue: number;
  industryAverage: number;
  top10Percent: number;
  top5Percent: number;
  percentile: number;
  competitiveAdvantage: boolean;
}

export interface BenchmarkData {
  metrics: BenchmarkMetric[];
  overallPercentile: number;
  radarData: Array<{
    metric: string;
    hbm: number;
    industry: number;
  }>;
  competitiveAdvantages: string[];
}

// ============================================================================
// SUMMARY TABLE TYPES
// ============================================================================

export enum MetricCategory {
  ENROLLMENT = "enrollment",
  PERFORMANCE = "performance",
  COMPETENCIES = "competencies",
  SOFT_SKILLS = "soft_skills",
  EMPLOYMENT = "employment",
  CERTIFICATIONS = "certifications",
  ENGAGEMENT = "engagement",
}

export enum MetricStatus {
  ON_TARGET = "on_target",
  NEEDS_ATTENTION = "needs_attention",
  CRITICAL = "critical",
}

export interface SummaryMetricRow {
  category: MetricCategory;
  metricName: string;
  currentValue: number;
  target: number;
  trend: TrendDirection;
  vsBenchmark: number;
  status: MetricStatus;
  unit: string;
}

export interface MetricsSummaryData {
  metrics: SummaryMetricRow[];
  exportTimestamp: Date;
}

// ============================================================================
// EXPORT TYPES
// ============================================================================

export interface ExportOptions {
  format: "csv" | "pdf";
  sections: string[];
  dateRange: {
    start: Date;
    end: Date;
  };
  includeCharts: boolean;
  fileName: string;
}

export interface ExportProgress {
  currentSection: string;
  progress: number;
  isComplete: boolean;
  error?: string;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  timestamp: Date;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    hasMore: boolean;
  };
}

// ============================================================================
// CHART DATA TYPES
// ============================================================================

export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

export interface HeatmapCell {
  x: string;
  y: string;
  value: number;
  color: string;
}

export interface RadarChartPoint {
  axis: string;
  value: number;
  fullMark: number;
}

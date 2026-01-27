export type PracticalStatus = "pending" | "approved" | "needs_revision";
export type MasteryLevel = "mastery" | "proficient" | "needs_work";

export interface RubricCriteria {
  id: string;
  name: string;
  maxScore: number; // usually 5
  description?: string;
}

// Fixed scales for now as per prompt
export const DEFAULT_RUBRIC: RubricCriteria[] = [
  { id: "communication", name: "Presentation & Communication", maxScore: 5 },
  { id: "technical", name: "Technical Skills", maxScore: 5 },
  { id: "safety", name: "Safety & Hygiene", maxScore: 5 },
  { id: "efficiency", name: "Speed & Efficiency", maxScore: 5 },
  { id: "service", name: "Customer Service", maxScore: 5 },
];

export interface PracticalAssessment {
  id: string;
  studentId: string;
  studentName: string; // Joined
  studentEmail: string; // Joined

  competencyId?: string;
  competencyName: string;
  role:
    | "F&B Service"
    | "Housekeeping"
    | "Front Office"
    | "Management"
    | "Culinary"
    | string;

  submittedAt: string; // ISO
  evidenceUrl?: string; // Video/Photo
  status: PracticalStatus;

  rubricScores: Record<string, number>; // { 'communication': 4 }
  overallScore: number; // Average

  adminFeedback: {
    strengths: string;
    improvements: string;
    recommendations: string;
  };
  // Stored as JSONB in DB "admin_feedback"

  masteryLevel?: MasteryLevel;
  reviewedBy?: string;
  reviewedAt?: string;
}

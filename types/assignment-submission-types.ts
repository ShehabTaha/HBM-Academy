export type SubmissionStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "needs_revision";

export interface SubmissionAttempt {
  attemptNumber: number;
  submittedAt: string; // ISO Date
  fileUrl?: string;
  fileName?: string;
  content?: string;
  status: "pending" | "approved" | "rejected";
}

export interface AssignmentSubmission {
  id: string;
  assignmentId: string;
  assignmentTitle: string; // Joined from lessons
  studentId: string;
  studentName: string; // Joined from users
  studentEmail: string; // Joined from users
  courseId: string;
  courseTitle: string; // Joined from courses

  submittedFileUrl?: string;
  fileName?: string;
  submittedContent?: string;

  submittedAt: string; // ISO Date
  status: SubmissionStatus;
  attemptNumber: number;
  maxAttempts?: number;

  adminFeedback?: string;
  adminId?: string;
  reviewedAt?: string; // ISO Date

  submissionHistory: SubmissionAttempt[];
}

export interface SubmissionFilters {
  status?: SubmissionStatus | "all";
  courseId?: string;
  dateRange?: { from: Date; to: Date };
  search?: string;
}

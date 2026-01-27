export type QuizStatus = "in_progress" | "submitted" | "graded";

export interface QuizResponse {
  questionId: string;
  questionText: string;
  questionType: "multiple_choice" | "short_answer" | "essay" | "true_false";
  studentAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  pointsEarned: number;
  maxPoints: number;
  timeSpent?: number; // seconds
  explanation?: string;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  quizName: string; // Joined
  studentId: string;
  studentName: string; // Joined
  studentEmail: string; // Joined
  courseId: string;
  courseTitle?: string;

  startedAt: string; // ISO Date
  completedAt?: string; // ISO Date
  duration: number; // seconds

  totalPoints: number;
  earnedPoints: number;
  percentage: number;

  status: QuizStatus;
  passingPercentage: number;
  isPassing: boolean;

  responses: QuizResponse[];
}

export interface QuizFilters {
  status?: QuizStatus | "all";
  courseId?: string;
  search?: string;
  minScore?: number;
  maxScore?: number;
}

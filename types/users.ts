export interface User {
  id: string;
  email: string;
  name: string;
  avatar: string | null;
  bio: string | null;
  role: "student" | "admin";
  is_email_verified: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  // Computed / Joined properties
  last_active?: string;
  status: "active" | "inactive" | "suspended";
  courses_enrolled: number;
  courses_completed: number;
}

export interface Enrollment {
  id: string;
  student_id: string;
  course_id: string;
  course_title: string;
  enrolled_at: string;
  completed_at: string | null;
  progress_percentage: number;
  status: "active" | "completed" | "dropped";
}

export interface Certificate {
  id: string;
  enrollment_id: string;
  certificate_number: string;
  issued_at: string;
  course_title: string;
  certificate_url: string | null;
}

export interface UserStats {
  total_users: number; // Renamed from total_students
  active_users: number;
  inactive_users: number;
  total_enrollments: number;
  avg_progress: number;
  verified_percentage: number;
}

export interface UserAnalytics {
  user_growth: { date: string; count: number; new_users: number }[]; // Renamed fields
  enrollment_status: { status: string; count: number }[];
  verification_status: { verified: number; unverified: number };
  course_distribution: { course_title: string; count: number }[];
}

export interface UsersResponse {
  users: User[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
  stats: UserStats;
}

export interface UserDetailResponse {
  user: User;
  enrollments: Enrollment[];
  certificates: Certificate[];
  login_history: { timestamp: string; ip_address: string }[];
}

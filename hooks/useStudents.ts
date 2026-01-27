import useSWR from "swr";
import {
  StudentsResponse,
  StudentDetailResponse,
  StudentAnalytics,
} from "@/types/students";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useStudents(
  page: number,
  limit: number,
  search: string,
  status?: string,
  verified?: boolean,
  sortBy?: string,
  sortOrder?: "asc" | "desc",
) {
  const query = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    search,
  });
  if (status) query.append("status", status);
  if (verified !== undefined) query.append("verified", verified.toString());
  if (sortBy) query.append("sortBy", sortBy);
  if (sortOrder) query.append("sortOrder", sortOrder);

  const { data, error, isLoading, mutate } = useSWR<StudentsResponse>(
    `/api/admin/students?${query.toString()}`,
    fetcher,
  );

  return {
    students: data?.students || [],
    pagination: data?.pagination,
    stats: data?.stats,
    isLoading,
    isError: error,
    mutate,
  };
}

export function useStudentDetails(studentId: string | null) {
  const { data, error, isLoading, mutate } = useSWR<StudentDetailResponse>(
    studentId ? `/api/admin/students/${studentId}` : null,
    fetcher,
  );

  return {
    student: data?.student,
    enrollments: data?.enrollments || [],
    certificates: data?.certificates || [],
    loginHistory: data?.login_history || [],
    isLoading,
    isError: error,
    mutate,
  };
}

export function useStudentAnalytics() {
  const { data, error, isLoading } = useSWR<StudentAnalytics>(
    "/api/admin/students/analytics",
    fetcher,
  );

  return {
    data,
    isLoading,
    isError: error,
  };
}

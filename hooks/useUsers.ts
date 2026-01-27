import useSWR from "swr";
import {
  UsersResponse,
  UserDetailResponse,
  UserAnalytics,
} from "@/types/users";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useUsers(
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

  const { data, error, isLoading, mutate } = useSWR<UsersResponse>(
    `/api/admin/users?${query.toString()}`,
    fetcher,
    {
      revalidateOnFocus: false,
      shouldRetryOnError: false,
    },
  );

  return {
    users: data?.users || [],
    pagination: data?.pagination,
    stats: data?.stats,
    isLoading,
    isError: error,
    mutate,
  };
}

export function useUserDetails(userId: string | null) {
  const { data, error, isLoading, mutate } = useSWR<UserDetailResponse>(
    userId ? `/api/admin/users/${userId}` : null,
    fetcher,
  );

  return {
    user: data?.user,
    enrollments: data?.enrollments || [],
    certificates: data?.certificates || [],
    loginHistory: data?.login_history || [],
    isLoading,
    isError: error,
    mutate,
  };
}

export function useUserAnalytics() {
  const { data, error, isLoading } = useSWR<UserAnalytics>(
    "/api/admin/users/analytics",
    fetcher,
    {
      revalidateOnFocus: false,
      shouldRetryOnError: false,
    },
  );

  return {
    data,
    isLoading,
    isError: error,
  };
}

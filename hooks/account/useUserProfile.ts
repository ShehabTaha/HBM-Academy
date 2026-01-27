import { useState, useEffect, useCallback } from "react";
import { User, UserProfile } from "@/types/account";
import { useSession } from "next-auth/react";

export function useUserProfile() {
  const { data: session } = useSession();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!session?.user?.id) return;

    try {
      setLoading(true);
      setError(null);

      // Fetch from API route which uses service role key
      const response = await fetch("/api/user/profile");

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setUser(data.user as User);
      setProfile(data.profile as UserProfile);
    } catch (err: any) {
      console.error("Error fetching profile:", err);
      setError(err.message || "Failed to fetch profile");
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id]);

  useEffect(() => {
    if (session?.user?.id) {
      fetchProfile();
    } else if (session === null) {
      setLoading(false);
    }
  }, [session, fetchProfile]);

  return {
    user,
    profile,
    loading,
    error,
    refresh: fetchProfile,
  };
}

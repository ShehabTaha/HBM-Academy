import { useState, useEffect } from "react";
import { StorageStats } from "@/types/video-library";
export type { StorageStats };

export const useVideoStorage = () => {
  const [stats, setStats] = useState<StorageStats>({
    used: 0,
    limit: 53687091200, // 50 GB default
    percentage: 0,
  });
  const [loading, setLoading] = useState(false);

  const fetchStorageStats = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/video-library/storage-usage");
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Failed to fetch storage stats", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStorageStats();
  }, []);

  return { stats, loading, refetch: fetchStorageStats };
};

import { useState, useMemo } from "react";
import { Video } from "@/types/video-library";

interface Filters {
  duration: string;
  dateRange: string;
  sortBy: string;
}

export const useVideoFilters = (videos: Video[]) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<Filters>({
    duration: "all",
    dateRange: "all",
    sortBy: "newest",
  });
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const filteredVideos = useMemo(() => {
    let result = [...videos];

    // Search filter
    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      result = result.filter(
        (v) =>
          v.title.toLowerCase().includes(lowerTerm) ||
          v.description?.toLowerCase().includes(lowerTerm) ||
          v.tags.some((tag) => tag.toLowerCase().includes(lowerTerm)),
      );
    }

    // Duration filter
    if (filters.duration !== "all") {
      result = result.filter((v) => {
        const durMin = v.duration / 60;
        switch (filters.duration) {
          case "<5":
            return durMin < 5;
          case "5-10":
            return durMin >= 5 && durMin < 10;
          case "10-30":
            return durMin >= 10 && durMin < 30;
          case ">30":
            return durMin >= 30;
          default:
            return true;
        }
      });
    }

    // Date range filter
    if (filters.dateRange !== "all") {
      const now = new Date();
      result = result.filter((v) => {
        const uploadDate = new Date(v.upload_date);
        const diffDays =
          (now.getTime() - uploadDate.getTime()) / (1000 * 3600 * 24);
        switch (filters.dateRange) {
          case "week":
            return diffDays <= 7;
          case "month":
            return diffDays <= 30;
          case "year":
            return diffDays <= 365;
          default:
            return true;
        }
      });
    }

    // Sort
    result.sort((a, b) => {
      switch (filters.sortBy) {
        case "newest":
          return (
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
        case "oldest":
          return (
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          );
        case "most-used":
          return (b.usage_count || 0) - (a.usage_count || 0);
        case "name":
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

    return result;
  }, [videos, searchTerm, filters]);

  return {
    searchTerm,
    setSearchTerm,
    filters,
    setFilters,
    filteredVideos,
    viewMode,
    setViewMode,
  };
};

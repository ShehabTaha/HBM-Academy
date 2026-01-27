import React from "react";
import { Progress } from "@/components/ui/progress";
import { formatFileSize } from "@/utils/video-helpers";
import { StorageStats } from "@/hooks/useVideoStorage";

interface StorageIndicatorProps {
  stats: StorageStats;
}

const StorageIndicator: React.FC<StorageIndicatorProps> = ({ stats }) => {
  // Ensure minimum visible width of 2% when there's any usage
  const displayPercentage = stats.used > 0 ? Math.max(stats.percentage, 2) : 0;

  // Show decimal precision when percentage is very small
  const remainingPercentage = 100 - stats.percentage;
  const remainingText =
    remainingPercentage >= 99
      ? remainingPercentage.toFixed(2)
      : Math.round(remainingPercentage);

  return (
    <div className="mb-6 p-4 rounded-lg border bg-card text-card-foreground shadow-sm">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium">Storage Used</span>
        <span className="text-sm text-muted-foreground">
          {formatFileSize(stats.used)} / {formatFileSize(stats.limit)}
        </span>
      </div>
      <Progress value={displayPercentage} className="h-2 mb-2" />
      <div className="flex justify-between items-center text-xs text-muted-foreground">
        <span>{remainingText}% remaining</span>
      </div>
    </div>
  );
};

export default StorageIndicator;

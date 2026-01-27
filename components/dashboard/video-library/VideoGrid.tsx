import React from "react";
import { Video } from "@/types/video-library";
import VideoCard from "./VideoCard";

interface VideoGridProps {
  videos: Video[];
  selectedIds: string[];
  onSelect: (id: string, checked: boolean) => void;
  onPreview: (video: Video) => void;
  onEdit: (video: Video) => void;
  onDelete: (video: Video) => void;
  onDuplicate: (id: string) => void;
  onAnalytics: (video: Video) => void;
}

const VideoGrid: React.FC<VideoGridProps> = ({
  videos,
  selectedIds,
  onSelect,
  onPreview,
  onEdit,
  onDelete,
  onDuplicate,
  onAnalytics,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {videos.map((video) => (
        <VideoCard
          key={video.id}
          video={video}
          selected={selectedIds.includes(video.id)}
          onSelect={(c) => onSelect(video.id, c)}
          onPreview={() => onPreview(video)}
          onEdit={() => onEdit(video)}
          onDelete={() => onDelete(video)}
          onDuplicate={() => onDuplicate(video.id)}
          onAnalytics={() => onAnalytics(video)}
        />
      ))}
    </div>
  );
};

export default VideoGrid;

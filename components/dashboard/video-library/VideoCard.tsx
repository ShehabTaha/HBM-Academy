import React from "react";
import Image from "next/image";
import { Play } from "lucide-react";
import { Video } from "@/types/video-library";
import { formatDuration, formatFileSize } from "@/utils/video-helpers";
import { Checkbox } from "@/components/ui/checkbox";
import ContextMenu from "./ContextMenu";

interface VideoCardProps {
  video: Video;
  selected: boolean;
  onSelect: (checked: boolean) => void;
  onPreview: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onAnalytics: () => void;
}

const VideoCard: React.FC<VideoCardProps> = ({
  video,
  selected,
  onSelect,
  onPreview,
  onEdit,
  onDelete,
  onDuplicate,
  onAnalytics,
}) => {
  return (
    <div
      className={`group relative rounded-lg border bg-card shadow-sm transition-all hover:shadow-md ${selected ? "ring-2 ring-primary" : ""}`}
    >
      {/* Thumbnail Area */}
      <div className="relative aspect-video w-full overflow-hidden rounded-t-lg bg-muted">
        {video.thumbnail_url ? (
          <Image
            src={video.thumbnail_url}
            alt={video.title}
            fill
            className="object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gray-100 dark:bg-gray-800">
            <Play className="h-10 w-10 text-muted-foreground opacity-50" />
          </div>
        )}

        {/* Play Overlay */}
        <div
          className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-opacity group-hover:opacity-100 cursor-pointer"
          onClick={onPreview}
        >
          <div className="rounded-full bg-background/90 p-3 shadow-sm">
            <Play className="h-6 w-6 fill-foreground text-foreground pl-1" />
          </div>
        </div>

        {/* Checkbox (visible on hover or selected) */}
        <div
          className={`absolute left-2 top-2 z-10 ${selected ? "opacity-100" : "opacity-0 group-hover:opacity-100"} transition-opacity`}
        >
          <Checkbox
            checked={selected}
            onCheckedChange={(c) => onSelect(!!c)}
            className="bg-background/80 backdrop-blur-sm"
          />
        </div>

        {/* Duration Badge */}
        <div className="absolute bottom-2 right-2 rounded bg-black/70 px-1.5 py-0.5 text-xs font-medium text-white">
          {formatDuration(video.duration)}
        </div>
      </div>

      {/* Info Area */}
      <div className="p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1 space-y-1">
            <h3
              className="font-medium leading-none truncate cursor-pointer hover:underline"
              onClick={onPreview}
              title={video.title}
            >
              {video.title}
            </h3>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{formatFileSize(video.file_size)}</span>
              <span>•</span>
              <span>{video.usage_count} lessons</span>
            </div>
          </div>
          <ContextMenu
            onPreview={onPreview}
            onEdit={onEdit}
            onDuplicate={onDuplicate}
            onDelete={onDelete}
            onAnalytics={onAnalytics}
          />
        </div>
      </div>
    </div>
  );
};

export default VideoCard;

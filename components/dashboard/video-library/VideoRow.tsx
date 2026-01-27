import React from "react";
import { Video } from "@/types/video-library";
import { formatDuration, formatFileSize } from "@/utils/video-helpers";
import { Checkbox } from "@/components/ui/checkbox";
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import ContextMenu from "./ContextMenu";

interface VideoRowProps {
  video: Video;
  selected: boolean;
  onSelect: (checked: boolean) => void;
  onPreview: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onAnalytics: () => void;
}

const VideoRow: React.FC<VideoRowProps> = ({
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
    <TableRow className={selected ? "bg-muted/50" : ""}>
      <TableCell className="w-[50px]">
        <Checkbox checked={selected} onCheckedChange={(c) => onSelect(!!c)} />
      </TableCell>
      <TableCell className="font-medium">
        <div
          className="flex flex-col cursor-pointer hover:underline"
          onClick={onPreview}
        >
          <span className="truncate max-w-[200px] md:max-w-[300px]">
            {video.title}
          </span>
          {video.tags && video.tags.length > 0 && (
            <div className="flex gap-1 mt-1">
              {video.tags.slice(0, 2).map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="text-[10px] h-5 px-1"
                >
                  {tag}
                </Badge>
              ))}
              {video.tags.length > 2 && (
                <span className="text-[10px] text-muted-foreground">
                  +{video.tags.length - 2}
                </span>
              )}
            </div>
          )}
        </div>
      </TableCell>
      <TableCell>{formatDuration(video.duration)}</TableCell>
      <TableCell>{formatFileSize(video.file_size)}</TableCell>
      <TableCell>
        <Button
          variant="link"
          className="p-0 h-auto font-normal text-muted-foreground hover:text-primary"
        >
          {video.usage_count} lessons
        </Button>
      </TableCell>
      <TableCell className="text-muted-foreground text-sm">
        {new Date(video.upload_date).toLocaleDateString()}
      </TableCell>
      <TableCell className="text-right">
        <ContextMenu
          onPreview={onPreview}
          onEdit={onEdit}
          onDuplicate={onDuplicate}
          onDelete={onDelete}
          onAnalytics={onAnalytics}
        />
      </TableCell>
    </TableRow>
  );
};

// Import Button here to avoid circular dependencies if possible, or just require it
import { Button } from "@/components/ui/button";

export default VideoRow;

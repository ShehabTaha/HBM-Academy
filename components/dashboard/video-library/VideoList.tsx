import React from "react";
import { Video } from "@/types/video-library";
import VideoRow from "./VideoRow";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";

interface VideoListProps {
  videos: Video[];
  selectedIds: string[];
  onSelect: (id: string, checked: boolean) => void;
  onSelectAll: (checked: boolean) => void;
  onPreview: (video: Video) => void;
  onEdit: (video: Video) => void;
  onDelete: (video: Video) => void;
  onDuplicate: (id: string) => void;
  onAnalytics: (video: Video) => void;
}

const VideoList: React.FC<VideoListProps> = ({
  videos,
  selectedIds,
  onSelect,
  onSelectAll,
  onPreview,
  onEdit,
  onDelete,
  onDuplicate,
  onAnalytics,
}) => {
  const allSelected = videos.length > 0 && selectedIds.length === videos.length;

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">
              <Checkbox
                checked={allSelected}
                onCheckedChange={(c) => onSelectAll(!!c)}
              />
            </TableHead>
            <TableHead>Video Title</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead>Size</TableHead>
            <TableHead>Used In</TableHead>
            <TableHead>Uploaded</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {videos.map((video) => (
            <VideoRow
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
        </TableBody>
      </Table>
    </div>
  );
};

export default VideoList;

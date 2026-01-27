import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Video, VideoAnalytics } from "@/types/video-library";
import { formatDuration, formatFileSize } from "@/utils/video-helpers";
import { useVideoLibrary } from "@/hooks/useVideoLibrary";

interface VideoDetailsModalProps {
  video: Video | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (video: Video) => void;
  onDelete: (video: Video) => void;
}

const VideoDetailsModal: React.FC<VideoDetailsModalProps> = ({
  video,
  open,
  onOpenChange,
  onEdit,
  onDelete,
}) => {
  const [analytics, setAnalytics] = useState<VideoAnalytics | null>(null);
  const { getVideoAnalytics } = useVideoLibrary();

  useEffect(() => {
    if (video && open) {
      getVideoAnalytics(video.id).then(setAnalytics);
    } else {
      setAnalytics(null);
    }
  }, [video, open]);

  if (!video) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Video Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Video Player */}
          <div className="aspect-video w-full bg-black rounded-lg overflow-hidden">
            <video
              src={video.file_url}
              controls
              className="w-full h-full"
              poster={video.thumbnail_url || undefined}
            />
          </div>

          <div>
            <h2 className="text-xl font-bold mb-2">{video.title}</h2>
            <p className="text-muted-foreground">
              {video.description || "No description provided."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-3">Metadata</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex justify-between">
                  <span className="text-muted-foreground">Duration:</span>
                  <span>{formatDuration(video.duration)}</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-muted-foreground">File Size:</span>
                  <span>{formatFileSize(video.file_size)}</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-muted-foreground">Resolution:</span>
                  <span>{video.metadata?.resolution || "N/A"}</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-muted-foreground">Codec:</span>
                  <span>{video.metadata?.videoCodec || "N/A"}</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-muted-foreground">Uploaded:</span>
                  <span>{new Date(video.upload_date).toLocaleString()}</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-3">Usage</h3>
              {video.usage_count === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Not used in any lessons yet.
                </p>
              ) : (
                <div className="space-y-2 text-sm">
                  <p>{video.usage_count} lessons use this video.</p>
                  {analytics?.lessons && (
                    <ul className="list-disc list-inside text-muted-foreground max-h-[100px] overflow-y-auto">
                      {analytics.lessons.map((l, i) => (
                        <li key={i}>
                          {l.lesson_title}{" "}
                          <span className="text-xs opacity-75">
                            ({l.course_title})
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {video.tags && video.tags.length > 0 ? (
                video.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))
              ) : (
                <span className="text-sm text-muted-foreground">No tags</span>
              )}
            </div>
          </div>

          <Separator />

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onEdit(video)}>
              Edit Details
            </Button>
            <Button variant="outline">Download</Button>
            <Button variant="destructive" onClick={() => onDelete(video)}>
              Delete
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VideoDetailsModal;

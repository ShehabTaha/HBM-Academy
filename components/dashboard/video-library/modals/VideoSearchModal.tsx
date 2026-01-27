import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { Video } from "@/types/video-library";
import { useVideoLibrary } from "@/hooks/useVideoLibrary";
import { useVideoFilters } from "@/hooks/useVideoFilters";
import VideoGrid from "@/components/dashboard/video-library/VideoGrid";

interface VideoSearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (video: Video) => void;
}

const VideoSearchModal: React.FC<VideoSearchModalProps> = ({
  open,
  onOpenChange,
  onSelect,
}) => {
  const { videos, loading, fetchVideos } = useVideoLibrary();
  const { searchTerm, setSearchTerm, filteredVideos } = useVideoFilters(videos);

  // Fetch videos when modal opens if not already loaded
  useEffect(() => {
    if (open && videos.length === 0) {
      fetchVideos();
    }
  }, [open, videos.length, fetchVideos]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Select Video from Library</DialogTitle>
        </DialogHeader>

        <div className="relative mb-4">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search videos..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex-1 overflow-y-auto min-h-0 border rounded-md p-4 bg-muted/10">
          {loading ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              Loading...
            </div>
          ) : filteredVideos.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <p>No videos found</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {filteredVideos.map((video) => (
                <div
                  key={video.id}
                  className="group relative cursor-pointer border rounded-lg overflow-hidden bg-card hover:ring-2 hover:ring-primary transition-all pb-8"
                  onClick={() => {
                    onSelect(video);
                    onOpenChange(false);
                  }}
                >
                  {/* Simplified Card for Search Modal */}
                  <div className="aspect-video bg-muted relative">
                    {video.thumbnail_url && (
                      <img
                        src={video.thumbnail_url}
                        alt={video.title}
                        className="w-full h-full object-cover"
                      />
                    )}
                    <div className="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-1 rounded">
                      {Math.floor(video.duration / 60)}:
                      {String(video.duration % 60).padStart(2, "0")}
                    </div>
                  </div>
                  <div className="p-2">
                    <p className="font-medium text-sm truncate">
                      {video.title}
                    </p>
                  </div>
                  <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button size="sm">Select</Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VideoSearchModal;

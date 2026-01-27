"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Play, Loader2, CheckCircle2 } from "lucide-react";
import { Video } from "@/types/video-library";
import { useVideoLibrary } from "@/hooks/useVideoLibrary";
import { useVideoFilters } from "@/hooks/useVideoFilters";
import Image from "next/image";
import { formatDuration } from "@/utils/video-helpers";

interface VideoSelectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (video: Video) => void;
}

const VideoSelectionModal: React.FC<VideoSelectionModalProps> = ({
  open,
  onOpenChange,
  onSelect,
}) => {
  const { videos, loading, refetch } = useVideoLibrary();
  const [localSearch, setLocalSearch] = useState("");
  const { setSearchTerm, filteredVideos } = useVideoFilters(videos);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(localSearch);
    }, 300);
    return () => clearTimeout(timer);
  }, [localSearch, setSearchTerm]);

  useEffect(() => {
    if (open) {
      refetch();
    }
  }, [open, refetch]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[85vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle>Select Video from Library</DialogTitle>
        </DialogHeader>

        {/* Search Bar */}
        <div className="px-6 pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search videos by title or tags..."
              className="pl-9"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              autoFocus
            />
          </div>
        </div>

        {/* Video Grid */}
        <div className="flex-1 overflow-y-auto px-6 pb-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">
                Loading library...
              </p>
            </div>
          ) : filteredVideos.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground">No videos found.</p>
              {localSearch && (
                <Button
                  variant="link"
                  onClick={() => setLocalSearch("")}
                  className="mt-2"
                >
                  Clear search
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {filteredVideos.map((video) => (
                <div
                  key={video.id}
                  className="group relative rounded-lg border bg-card overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary transition-all"
                  onClick={() => onSelect(video)}
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-video bg-muted">
                    {video.thumbnail_url ? (
                      <Image
                        src={video.thumbnail_url}
                        alt={video.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Play className="h-8 w-8 text-muted-foreground opacity-30" />
                      </div>
                    )}
                    <div className="absolute bottom-1 right-1 rounded bg-black/70 px-1 py-0.5 text-[10px] text-white font-medium">
                      {formatDuration(video.duration)}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-2">
                    <h4 className="text-xs font-medium line-clamp-2 leading-tight">
                      {video.title}
                    </h4>
                  </div>

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <CheckCircle2 className="h-8 w-8 text-primary fill-white" />
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

export default VideoSelectionModal;

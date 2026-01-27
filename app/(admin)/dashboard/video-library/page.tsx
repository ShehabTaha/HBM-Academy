"use client";
import React, { useState, useEffect } from "react";
import Header from "@/components/dashboard/video-library/Header";
import SearchFilterBar from "@/components/dashboard/video-library/SearchFilterBar";
import StorageIndicator from "@/components/dashboard/video-library/StorageIndicator";
import VideoGrid from "@/components/dashboard/video-library/VideoGrid";
import VideoList from "@/components/dashboard/video-library/VideoList";
import UploadVideoModal from "@/components/dashboard/video-library/modals/UploadVideoModal";
import VideoDetailsModal from "@/components/dashboard/video-library/modals/VideoDetailsModal";
import EditVideoModal from "@/components/dashboard/video-library/modals/EditVideoModal";
import DeleteConfirmModal from "@/components/dashboard/video-library/modals/DeleteConfirmModal";
import SettingsModal from "@/components/dashboard/video-library/modals/SettingsModal";
import { useVideoLibrary } from "@/hooks/useVideoLibrary";
import { useVideoFilters } from "@/hooks/useVideoFilters";
import { useVideoStorage } from "@/hooks/useVideoStorage";
import { Video } from "@/types/video-library";
import { Button } from "@/components/ui/button";
import { Image as ImageIcon } from "lucide-react";

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

const VideoLibraryPage = () => {
  // Hooks
  const {
    videos,
    loading,
    refetch,
    duplicateVideo,
    getVideoAnalytics,
    deleteVideo,
  } = useVideoLibrary();
  const {
    searchTerm,
    setSearchTerm,
    filters,
    setFilters,
    filteredVideos,
    viewMode,
    setViewMode,
  } = useVideoFilters(videos);
  const { stats, refetch: refetchStorage } = useVideoStorage();

  // Modal State
  const [uploadOpen, setUploadOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Selection State
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  // Handlers
  const handleUploadSuccess = () => {
    refetch();
    refetchStorage();
  };

  const handleSelect = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds([...selectedIds, id]);
    } else {
      setSelectedIds(selectedIds.filter((idx) => idx !== id));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(filteredVideos.map((v) => v.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handlePreview = (video: Video) => {
    setSelectedVideo(video);
    setDetailsOpen(true);
  };

  const handleEdit = (video: Video) => {
    setSelectedVideo(video);
    setEditOpen(true);
  };

  const handleDelete = (video: Video) => {
    setSelectedVideo(video);
    setDeleteOpen(true);
  };

  const handleDeleteSuccess = () => {
    refetch();
    refetchStorage();
    setDetailsOpen(false); // Close details if open
    setSelectedVideo(null);
  };

  const handleSettingsClick = () => {
    setSettingsOpen(true);
  };

  // Render Empty State
  if (!loading && videos.length === 0) {
    return (
      <div className="p-6 h-full flex flex-col">
        <Header
          onUploadClick={() => setUploadOpen(true)}
          onSettingsClick={handleSettingsClick}
        />
        <div className="flex-1 flex items-center justify-center">
          <Empty className="items-center">
            <EmptyHeader>
              <EmptyMedia>
                <div className="bg-muted rounded-full p-6 mb-4">
                  <ImageIcon className="h-10 w-10 text-muted-foreground" />
                </div>
              </EmptyMedia>
              <EmptyTitle>No videos yet</EmptyTitle>
              <EmptyDescription>
                Start building your video library by uploading your first
                lecture.
              </EmptyDescription>
            </EmptyHeader>
            <Button onClick={() => setUploadOpen(true)} className="mt-4">
              + Upload Your First Video
            </Button>
          </Empty>
        </div>
        <UploadVideoModal
          open={uploadOpen}
          onOpenChange={setUploadOpen}
          onSuccess={handleUploadSuccess}
        />
      </div>
    );
  }

  return (
    <div className="p-6 h-full overflow-y-auto">
      {/* Header */}
      <Header
        onUploadClick={() => setUploadOpen(true)}
        onSettingsClick={handleSettingsClick}
      />

      {/* Storage Indicator */}
      <StorageIndicator stats={stats} />

      {/* Search & Filter */}
      <SearchFilterBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        filters={filters}
        onFilterChange={(k, v) => setFilters((prev) => ({ ...prev, [k]: v }))}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {/* Content */}
      {loading ? (
        <div className="py-20 text-center text-muted-foreground">
          Loading videos...
        </div>
      ) : filteredVideos.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-lg font-medium">No videos found</p>
          <p className="text-muted-foreground">
            Try adjusting your search or filters
          </p>
          <Button
            variant="link"
            onClick={() => {
              setSearchTerm("");
              setFilters({
                duration: "all",
                dateRange: "all",
                sortBy: "newest",
              });
            }}
          >
            Clear Filters
          </Button>
        </div>
      ) : (
        <>
          {/* Bulk Actions Bar (Optional / Future) */}
          {selectedIds.length > 0 && (
            <div className="mb-4 p-2 bg-muted rounded-md flex items-center justify-between animate-in fade-in slide-in-from-top-2">
              <span className="text-sm font-medium ml-2">
                {selectedIds.length} video{selectedIds.length !== 1 && "s"}{" "}
                selected
              </span>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={async () => {
                    if (
                      window.confirm(
                        `Are you sure you want to delete ${selectedIds.length} videos?`,
                      )
                    ) {
                      for (const id of selectedIds) {
                        await deleteVideo(id);
                      }
                      setSelectedIds([]);
                      refetch();
                      refetchStorage();
                    }
                  }}
                >
                  Delete Selected
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setSelectedIds([])}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {viewMode === "grid" ? (
            <VideoGrid
              videos={filteredVideos}
              selectedIds={selectedIds}
              onSelect={handleSelect}
              onPreview={handlePreview}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onDuplicate={duplicateVideo}
              onAnalytics={handlePreview} // Re-use preview/details modal for analytics access
            />
          ) : (
            <VideoList
              videos={filteredVideos}
              selectedIds={selectedIds}
              onSelect={handleSelect}
              onSelectAll={handleSelectAll}
              onPreview={handlePreview}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onDuplicate={duplicateVideo}
              onAnalytics={handlePreview}
            />
          )}
        </>
      )}

      {/* Modals */}
      <UploadVideoModal
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        onSuccess={handleUploadSuccess}
      />

      <VideoDetailsModal
        video={selectedVideo}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        onEdit={(v) => {
          setDetailsOpen(false);
          setEditOpen(true);
        }}
        onDelete={(v) => {
          setDetailsOpen(false);
          setDeleteOpen(true);
        }}
      />

      <EditVideoModal
        video={selectedVideo}
        open={editOpen}
        onOpenChange={setEditOpen}
        onSuccess={() => {
          refetch();
          setSelectedVideo(null);
        }}
      />

      <DeleteConfirmModal
        video={selectedVideo}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onSuccess={handleDeleteSuccess}
      />

      <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />
    </div>
  );
};

export default VideoLibraryPage;

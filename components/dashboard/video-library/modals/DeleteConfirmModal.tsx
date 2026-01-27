import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Video } from "@/types/video-library";
import { useVideoLibrary } from "@/hooks/useVideoLibrary";

interface DeleteConfirmModalProps {
  video: Video | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  video,
  open,
  onOpenChange,
  onSuccess,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const { deleteVideo } = useVideoLibrary();

  const handleConfirm = async () => {
    if (!video) return;
    setIsDeleting(true);
    try {
      const success = await deleteVideo(video.id);
      if (success) {
        onSuccess();
        onOpenChange(false);
      }
    } finally {
      setIsDeleting(false);
    }
  };

  if (!video) return null;

  return (
    <Dialog open={open} onOpenChange={isDeleting ? () => {} : onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <div className="flex items-center gap-2 text-destructive mb-2">
            <AlertCircle className="h-6 w-6" />
            <DialogTitle>Delete Video?</DialogTitle>
          </div>
          <DialogDescription>
            Are you sure you want to delete <strong>{video.title}</strong>? This
            action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        {video.usage_count > 0 && (
          <Alert variant="destructive" className="mt-2">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Warning</AlertTitle>
            <AlertDescription>
              This video is currently used in {video.usage_count} lessons.
              Deleting it will remove it from all lessons immediately.
            </AlertDescription>
          </Alert>
        )}

        <DialogFooter className="mt-6">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete Video"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteConfirmModal;

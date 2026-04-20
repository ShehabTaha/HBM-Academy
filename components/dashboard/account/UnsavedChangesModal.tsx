"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface UnsavedChangesModalProps {
  open: boolean;
  onStay: () => void;
  onLeave: () => void;
}

export function UnsavedChangesModal({
  open,
  onStay,
  onLeave,
}: UnsavedChangesModalProps) {
  return (
    <Dialog
      open={open}
      // Prevent closing by clicking outside or pressing ESC
      onOpenChange={(isOpen) => {
        if (!isOpen) onStay();
      }}
    >
      <DialogContent
        className="sm:max-w-md"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
            </div>
            <DialogTitle className="text-lg font-semibold">
              Unsaved Changes
            </DialogTitle>
          </div>
          <DialogDescription className="text-sm text-gray-600 leading-relaxed">
            You have unsaved changes. Are you sure you want to leave? Your
            changes will be lost.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex gap-3 pt-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={onStay}
          >
            Stay
          </Button>
          <Button
            variant="destructive"
            className="flex-1"
            onClick={onLeave}
          >
            Leave
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { Button } from "@/components/ui/button";
import { Trash, Ban, Download } from "lucide-react";

interface BulkActionsBarProps {
  selectedCount: number;
  onSuspend: () => void;
  onDelete: () => void;
  onExport: () => void;
}

export function BulkActionsBar({
  selectedCount,
  onSuspend,
  onDelete,
  onExport,
}: BulkActionsBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 transform">
      <div className="flex items-center gap-2 rounded-lg border bg-black p-2 text-white shadow-lg animate-in fade-in slide-in-from-bottom-4">
        <div className="px-3 border-r border-white/20 font-medium">
          {selectedCount} selected
        </div>

        <Button
          size="sm"
          variant="ghost"
          className="text-white hover:bg-white/20 hover:text-white"
          onClick={onSuspend}
        >
          <Ban className="mr-2 h-4 w-4" /> Suspend
        </Button>

        <Button
          size="sm"
          variant="ghost"
          className="text-white hover:bg-white/20 hover:text-white"
          onClick={onExport}
        >
          <Download className="mr-2 h-4 w-4" /> Export
        </Button>

        <Button
          size="sm"
          variant="ghost"
          className="text-red-300 hover:bg-red-500/20 hover:text-red-200"
          onClick={onDelete}
        >
          <Trash className="mr-2 h-4 w-4" /> Delete
        </Button>
      </div>
    </div>
  );
}

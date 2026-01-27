"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Save, Undo, ExternalLink } from "lucide-react";

interface SaveActionsProps {
  isDirty: boolean;
  onSave: () => Promise<void>;
  onDiscard: () => void;
  loading: boolean;
}

export default function SaveActions({
  isDirty,
  onSave,
  onDiscard,
  loading,
}: SaveActionsProps) {
  if (!isDirty && !loading) return null;

  return (
    <div className="fixed bottom-6 left-1/2 z-50 flex w-full max-w-lg -translate-x-1/2 items-center justify-between rounded-full border border-blue-100 bg-white/95 p-2 pr-4 shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom-8 duration-300 xl:left-[35%]">
      <div className="flex items-center gap-3 px-4">
        <div className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
        <span className="text-xs font-semibold text-gray-600">
          Unsaved Changes
        </span>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onDiscard}
          className="h-9 rounded-full text-xs font-medium text-gray-500 hover:bg-gray-100"
          disabled={loading}
        >
          <Undo size={14} className="mr-1.5" /> Discard
        </Button>
        <Button
          onClick={onSave}
          disabled={loading}
          className="h-9 rounded-full bg-primary-blue px-6 text-xs font-bold text-white shadow-lg shadow-blue-200 hover:bg-blue-700"
        >
          {loading ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Save size={14} className="mr-1.5" />
          )}
          Save Changes
        </Button>
      </div>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { useLandingPageEditor } from "@/hooks/useLandingPageEditor";
import EditorPanel from "./EditorPanel";
import PreviewPanel from "./PreviewPanel";
import { Loader2 } from "lucide-react";

interface LandingPageEditorProps {
  courseId: string;
}

export default function LandingPageEditor({
  courseId,
}: LandingPageEditorProps) {
  const {
    settings,
    updateSettings,
    isDirty,
    loading,
    error,
    save,
    discard,
    uploadHeroImage,
    deleteHeroImage,
  } = useLandingPageEditor(courseId);

  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");
  const [viewport, setViewport] = useState<"desktop" | "tablet" | "mobile">(
    "desktop",
  );

  if (loading && !settings) {
    return (
      <div className="flex h-[400px] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-blue" />
      </div>
    );
  }

  if (error && !settings) {
    return (
      <div className="flex h-[400px] w-full flex-col items-center justify-center gap-4">
        <p className="text-red-500">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="rounded-md bg-primary-blue px-4 py-2 text-white"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-gray-50">
      {/* Mobile/Tablet Tab Switcher */}
      <div className="flex border-b bg-white lg:hidden">
        <button
          onClick={() => setActiveTab("edit")}
          className={`flex-1 py-3 text-sm font-medium ${
            activeTab === "edit"
              ? "border-b-2 border-primary-blue text-primary-blue"
              : "text-gray-500"
          }`}
        >
          Editor
        </button>
        <button
          onClick={() => setActiveTab("preview")}
          className={`flex-1 py-3 text-sm font-medium ${
            activeTab === "preview"
              ? "border-b-2 border-primary-blue text-primary-blue"
              : "text-gray-500"
          }`}
        >
          Preview
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Editor Panel - Left side on desktop, full width on mobile/tablet when active */}
        <div
          className={`flex-1 overflow-y-auto border-r bg-white p-6 lg:flex-[0_0_55%] xl:flex-[0_0_50%] ${
            activeTab === "edit" ? "block" : "hidden lg:block"
          }`}
        >
          <EditorPanel
            settings={settings}
            updateSettings={updateSettings}
            uploadHeroImage={uploadHeroImage}
            deleteHeroImage={deleteHeroImage}
            isDirty={isDirty}
            save={save}
            discard={discard}
            loading={loading}
          />
        </div>

        {/* Preview Panel - Right side on desktop, full width on mobile/tablet when active */}
        <div
          className={`flex-1 overflow-hidden bg-gray-100 p-4 lg:block ${
            activeTab === "preview" ? "block" : "hidden lg:block"
          }`}
        >
          <PreviewPanel
            settings={settings}
            viewport={viewport}
            setViewport={setViewport}
          />
        </div>
      </div>
    </div>
  );
}

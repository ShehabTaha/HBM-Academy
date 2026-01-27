"use client";

import React from "react";
import ViewportToggle from "./ViewportToggle";
import LandingPagePreview from "./LandingPagePreview";
import { LandingPageSettings } from "@/lib/validations/landingPage";

interface PreviewPanelProps {
  settings: LandingPageSettings;
  viewport: "desktop" | "tablet" | "mobile";
  setViewport: (v: "desktop" | "tablet" | "mobile") => void;
}

export default function PreviewPanel({
  settings,
  viewport,
  setViewport,
}: PreviewPanelProps) {
  const getViewportWidth = () => {
    switch (viewport) {
      case "mobile":
        return "375px";
      case "tablet":
        return "768px";
      case "desktop":
        return "100%";
      default:
        return "100%";
    }
  };

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex items-center justify-between rounded-lg bg-white p-2 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="flex h-2 w-2 rounded-full bg-green-500" />
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Live Preview
          </span>
        </div>
        <ViewportToggle viewport={viewport} setViewport={setViewport} />
        <div className="text-[10px] font-mono text-gray-400">
          Width: {getViewportWidth()}
        </div>
      </div>

      <div className="flex-1 overflow-auto rounded-xl border bg-white shadow-inner scrollbar-hide">
        <div
          className="mx-auto h-full transition-all duration-300 ease-in-out"
          style={{ width: getViewportWidth() }}
        >
          <LandingPagePreview settings={settings} viewport={viewport} />
        </div>
      </div>
    </div>
  );
}

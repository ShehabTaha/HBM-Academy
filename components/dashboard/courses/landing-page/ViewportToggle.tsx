"use client";

import React from "react";
import { Monitor, Tablet, Smartphone } from "lucide-react";

interface ViewportToggleProps {
  viewport: "desktop" | "tablet" | "mobile";
  setViewport: (v: "desktop" | "tablet" | "mobile") => void;
}

export default function ViewportToggle({
  viewport,
  setViewport,
}: ViewportToggleProps) {
  return (
    <div className="flex items-center gap-1 rounded-lg border bg-gray-50 p-1">
      <button
        onClick={() => setViewport("desktop")}
        className={`rounded p-1.5 transition-all ${
          viewport === "desktop"
            ? "bg-white text-primary-blue shadow-sm"
            : "text-gray-400 hover:text-gray-600"
        }`}
        title="Desktop View"
      >
        <Monitor size={16} />
      </button>
      <button
        onClick={() => setViewport("tablet")}
        className={`rounded p-1.5 transition-all ${
          viewport === "tablet"
            ? "bg-white text-primary-blue shadow-sm"
            : "text-gray-400 hover:text-gray-600"
        }`}
        title="Tablet View"
      >
        <Tablet size={16} />
      </button>
      <button
        onClick={() => setViewport("mobile")}
        className={`rounded p-1.5 transition-all ${
          viewport === "mobile"
            ? "bg-white text-primary-blue shadow-sm"
            : "text-gray-400 hover:text-gray-600"
        }`}
        title="Mobile View"
      >
        <Smartphone size={16} />
      </button>
    </div>
  );
}

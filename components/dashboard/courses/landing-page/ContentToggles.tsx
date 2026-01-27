"use client";

import React from "react";
import { LandingPageSettings } from "@/lib/validations/landingPage";

interface ContentTogglesProps {
  settings: LandingPageSettings;
  updateSettings: (updates: Partial<LandingPageSettings>) => void;
}

export default function ContentToggles({
  settings,
  updateSettings,
}: ContentTogglesProps) {
  const toggles = [
    {
      id: "show_overview",
      label: "Course Overview",
      description:
        "Display course stats (lessons, duration) and detailed description.",
    },
    {
      id: "show_learning_outcomes",
      label: "What You'll Learn",
      description: "Highlight key benefits and skills students will gain.",
    },
    {
      id: "show_curriculum",
      label: "Curriculum Preview",
      description:
        "Show list of sections and lessons. Great for building trust.",
    },
    {
      id: "show_instructor",
      label: "Instructor Profile",
      description: "Show instructor's bio, rating, and expertise.",
    },
    {
      id: "show_reviews",
      label: "Student Reviews",
      description: "Display social proof and star ratings.",
    },
    {
      id: "show_faqs",
      label: "FAQs Section",
      description: "Answer common questions about the course.",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {toggles.map((item) => (
        <div
          key={item.id}
          className={`flex items-start gap-3 rounded-lg border p-4 transition-all ${
            (settings as any)[item.id]
              ? "border-blue-100 bg-blue-50/50"
              : "border-gray-200 bg-white"
          }`}
        >
          <div className="flex-1 select-none">
            <h3 className="text-sm font-semibold text-gray-900">
              {item.label}
            </h3>
            <p className="text-[11px] text-gray-500 leading-tight mt-0.5">
              {item.description}
            </p>
          </div>
          <label className="relative inline-flex cursor-pointer items-center">
            <input
              type="checkbox"
              className="peer sr-only"
              checked={(settings as any)[item.id]}
              onChange={(e) => updateSettings({ [item.id]: e.target.checked })}
            />
            <div className="peer h-5 w-9 rounded-full bg-gray-200 after:absolute after:top-[2px] after:left-[2px] after:h-4 after:w-4 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary-blue peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none" />
          </label>
        </div>
      ))}
    </div>
  );
}

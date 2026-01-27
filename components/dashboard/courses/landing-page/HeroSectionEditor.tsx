"use client";

import React, { useState } from "react";
import { LandingPageSettings } from "@/lib/validations/landingPage";
import { Input } from "@/components/ui/input";
import {
  Loader2,
  Upload,
  Trash,
  Image as ImageIcon,
  Palette,
  Layout,
} from "lucide-react";

interface HeroSectionEditorProps {
  settings: LandingPageSettings;
  updateSettings: (updates: Partial<LandingPageSettings>) => void;
  uploadHeroImage: (file: File) => Promise<{ url: string; path: string }>;
  deleteHeroImage: (path: string) => Promise<boolean>;
}

interface Adjustment {
  brightness: number;
  contrast: number;
  overlayOpacity: number;
  overlayColor: string;
}

export default function HeroSectionEditor({
  settings,
  updateSettings,
  uploadHeroImage,
  deleteHeroImage,
}: HeroSectionEditorProps) {
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const result = await uploadHeroImage(file);
      updateSettings({
        hero_background_image_url: result.url,
        hero_background_type: "image",
      });
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const removeImage = async () => {
    if (settings.hero_background_image_url) {
      // In a real app, you might want to extract the path from URL
      // For now, just clear the field
      updateSettings({ hero_background_image_url: "" });
    }
  };

  const adjustment: Adjustment = settings.hero_image_adjustments || {
    brightness: 100,
    contrast: 100,
    overlayOpacity: 30,
    overlayColor: "#000000",
  };

  const updateAdjustment = (key: keyof Adjustment, value: string | number) => {
    updateSettings({
      hero_image_adjustments: {
        ...adjustment,
        [key]: value,
      },
    });
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Background Type Selection */}
      <div className="flex gap-2">
        {(["image", "color", "gradient"] as const).map((type) => (
          <button
            key={type}
            onClick={() => updateSettings({ hero_background_type: type })}
            className={`flex flex-1 flex-col items-center gap-2 rounded-lg border p-3 text-sm font-medium transition-all ${
              settings.hero_background_type === type
                ? "border-primary-blue bg-blue-50 text-primary-blue shadow-sm"
                : "border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {type === "image" && <ImageIcon size={20} />}
            {type === "color" && <Palette size={20} />}
            {type === "gradient" && <Layout size={20} />}
            <span className="capitalize">{type}</span>
          </button>
        ))}
      </div>

      {/* Background Content */}
      <div className="rounded-lg border bg-gray-50 p-4">
        {settings.hero_background_type === "image" && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                Hero Image
              </label>
              {settings.hero_background_image_url && (
                <button
                  onClick={removeImage}
                  className="text-xs text-red-500 hover:underline flex items-center gap-1"
                >
                  <Trash size={12} /> Remove
                </button>
              )}
            </div>

            {settings.hero_background_image_url ? (
              <div className="relative aspect-[16/6] w-full overflow-hidden rounded-md border bg-white shadow-sm">
                <img
                  src={settings.hero_background_image_url || undefined}
                  alt="Hero Preview"
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity hover:opacity-100">
                  <label className="cursor-pointer rounded-md bg-white px-3 py-1.5 text-xs font-medium text-gray-900 shadow-sm transition-transform hover:scale-105">
                    Replace Image
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                  </label>
                </div>
              </div>
            ) : (
              <label className="flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed border-gray-300 bg-white transition-colors hover:border-primary-blue hover:bg-blue-50">
                {uploading ? (
                  <Loader2 className="h-8 w-8 animate-spin text-primary-blue" />
                ) : (
                  <>
                    <Upload className="mb-2 h-8 w-8 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      Click to upload hero image
                    </span>
                    <span className="text-xs text-gray-400 mt-1">
                      1920x600px recommended
                    </span>
                  </>
                )}
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </label>
            )}

            {/* Adjustments */}
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-gray-600">
                  Brightness ({adjustment.brightness}%)
                </label>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={adjustment.brightness}
                  onChange={(e) =>
                    updateAdjustment("brightness", parseInt(e.target.value))
                  }
                  className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 accent-primary-blue"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-gray-600">
                  Contrast ({adjustment.contrast}%)
                </label>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={adjustment.contrast}
                  onChange={(e) =>
                    updateAdjustment("contrast", parseInt(e.target.value))
                  }
                  className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 accent-primary-blue"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-gray-600">
                  Overlay Opacity ({adjustment.overlayOpacity}%)
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={adjustment.overlayOpacity}
                  onChange={(e) =>
                    updateAdjustment("overlayOpacity", parseInt(e.target.value))
                  }
                  className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 accent-primary-blue"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-gray-600">
                  Overlay Color
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={adjustment.overlayColor}
                    onChange={(e) =>
                      updateAdjustment("overlayColor", e.target.value)
                    }
                    className="h-8 w-8 cursor-pointer rounded border-none bg-transparent"
                  />
                  <Input
                    value={adjustment.overlayColor}
                    onChange={(e) =>
                      updateAdjustment("overlayColor", e.target.value)
                    }
                    className="h-8 text-xs font-mono"
                    spellCheck={false}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {settings.hero_background_type === "color" && (
          <div className="flex flex-col gap-4">
            <label className="text-sm font-medium text-gray-700">
              Solid Color
            </label>
            <div className="flex gap-4 items-center">
              <input
                type="color"
                value={settings.hero_background_color || "#3b82f6"}
                onChange={(e) =>
                  updateSettings({ hero_background_color: e.target.value })
                }
                className="h-12 w-12 cursor-pointer rounded-lg border-2 border-white shadow-sm"
              />
              <Input
                value={settings.hero_background_color || "#3b82f6"}
                onChange={(e) =>
                  updateSettings({ hero_background_color: e.target.value })
                }
                className="max-w-[150px] font-mono text-sm"
                spellCheck={false}
              />
              <div className="flex flex-wrap gap-2">
                {[
                  "#3b82f6",
                  "#10b981",
                  "#ef4444",
                  "#f59e0b",
                  "#6366f1",
                  "#000000",
                ].map((c) => (
                  <button
                    key={c}
                    onClick={() => updateSettings({ hero_background_color: c })}
                    className="h-6 w-6 rounded-full border border-gray-200 shadow-sm transition-transform hover:scale-110"
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {settings.hero_background_type === "gradient" && (
          <div className="flex flex-col gap-4">
            <label className="text-sm font-medium text-gray-700">
              Gradient Colors
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={settings.hero_gradient?.color1 || "#3b82f6"}
                  onChange={(e) =>
                    updateSettings({
                      hero_gradient: {
                        ...settings.hero_gradient,
                        color1: e.target.value,
                        color2: settings.hero_gradient?.color2 || "#2563eb",
                        direction: "to right",
                      },
                    })
                  }
                  className="h-8 w-8 cursor-pointer rounded"
                />
                <span className="text-xs text-gray-500 font-mono">
                  {settings.hero_gradient?.color1 || "#3b82f6"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={settings.hero_gradient?.color2 || "#2563eb"}
                  onChange={(e) =>
                    updateSettings({
                      hero_gradient: {
                        ...settings.hero_gradient,
                        color2: e.target.value,
                        color1: settings.hero_gradient?.color1 || "#3b82f6",
                        direction: "to right",
                      },
                    })
                  }
                  className="h-8 w-8 cursor-pointer rounded"
                />
                <span className="text-xs text-gray-500 font-mono">
                  {settings.hero_gradient?.color2 || "#2563eb"}
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-medium text-gray-600">
                Direction
              </label>
              <select
                value={settings.hero_gradient?.direction || "to right"}
                onChange={(e) =>
                  updateSettings({
                    hero_gradient: {
                      ...settings.hero_gradient!,
                      direction: e.target.value,
                    },
                  })
                }
                className="rounded-md border border-gray-300 bg-white px-2 py-1.5 text-xs shadow-sm focus:border-primary-blue outline-none"
              >
                <option value="to right">To Right →</option>
                <option value="to left">← To Left</option>
                <option value="to bottom">To Bottom ↓</option>
                <option value="to top">↑ To Top</option>
                <option value="to bottom right">Diagonal ↘</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Hero Text */}
      <div className="grid grid-cols-1 gap-6">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">
              Hero Subtitle
            </label>
            <span className="text-[10px] text-gray-400">
              {(settings.hero_subtitle || "").length}/150
            </span>
          </div>
          <Input
            placeholder="What students will learn in this course..."
            value={settings.hero_subtitle || ""}
            onChange={(e) =>
              updateSettings({ hero_subtitle: e.target.value.slice(0, 150) })
            }
            className="text-sm"
          />
          <p className="text-[11px] text-gray-400">
            Appears directly under the course title.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700">
            Button Text (CTA)
          </label>
          <Input
            placeholder="Enroll Now"
            value={settings.hero_cta_text || ""}
            onChange={(e) => updateSettings({ hero_cta_text: e.target.value })}
            className="text-sm"
          />
        </div>

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="show_instructor_in_hero"
            checked={settings.show_instructor_in_hero}
            onChange={(e) =>
              updateSettings({ show_instructor_in_hero: e.target.checked })
            }
            className="h-4 w-4 rounded border-gray-300 text-primary-blue focus:ring-primary-blue"
          />
          <label
            htmlFor="show_instructor_in_hero"
            className="text-sm text-gray-700 font-medium"
          >
            Show instructor name & avatar in hero
          </label>
        </div>
      </div>
    </div>
  );
}

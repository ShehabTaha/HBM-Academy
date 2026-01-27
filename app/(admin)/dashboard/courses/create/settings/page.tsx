"use client";

import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useCourse } from "@/contexts/CourseContext";
import Image from "next/image";

export default function SettingsPage() {
  const { metadata, updateMetadata } = useCourse();

  // Load state from context
  const {
    title: courseName,
    image: courseImage,
    description,
    settings: courseSettings,
  } = metadata;

  // Local state for file (since we can't persist File object easily in context if reloading)
  // But for wizard it's fine. We'll rely on context for values.
  const [courseImageFile, setCourseImageFile] = useState<File | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCourseImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        updateMetadata({ image: reader.result as string });
      };
      reader.readAsDataURL(file);

      // Also upload usage logic could go here if we wanted immediate upload,
      // but we'll probably save it on "Save" or "Publish".
      // For now, let's keep it as data URL in context for preview.
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  // We auto-save to context on change, so handleSaveChanges might just be a notification or persistent save if we had draft API
  const handleSaveChanges = () => {
    // In wizard flow, "Save" usually just means "keep in context",
    // but user might expect persistent save.
    // For now, context is updated on change, so we can just show success.
    console.log("Settings saved to context", metadata);
    // You might want to trigger a toast here
  };

  const handleDiscardChanges = () => {
    // Reset to defaults
    updateMetadata({
      title: "",
      description: "",
      image: null,
      settings: {
        isPublic: true,
        isHidden: false,
        tradeFileSource: false,
        enableRatings: false,
        enableDiscussions: false,
        enableCertificates: false,
        certificateValidityDays: null,
      },
    });
    setCourseImageFile(null);
  };

  return (
    <div className="w-full py-8">
      <h2 className="text-2xl font-semibold text-gray-900 mb-8">Settings</h2>

      <div className="space-y-8 pb-10">
        {/* Basic Settings Section */}
        <div className="space-y-6">
          {/* Course Name */}
          <div>
            <label
              htmlFor="courseName"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Course name
            </label>
            <Input
              id="courseName"
              placeholder="Enter course name"
              value={courseName}
              onChange={(e) => updateMetadata({ title: e.target.value })}
              className="w-full"
            />
          </div>
        </div>

        {/* Image and Description Section */}
        <div className="space-y-6 pt-6 border-t border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Image and description
          </h3>

          {/* Course Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Course Image
            </label>
            <p className="text-xs text-gray-500 mb-3">
              This image will be displayed on your course card and on the top
              page. Suggested dimensions are 1920 x 1080 (16:9 ratio).
            </p>

            <div className="flex gap-4 items-start">
              {/* Image Preview */}
              <div className="w-48 h-28 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50 overflow-hidden relative">
                {courseImage ? (
                  <Image
                    src={courseImage}
                    alt="Course preview"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="text-center p-4">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                )}
              </div>

              {/* Upload Button */}
              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBrowseClick}
                  className="text-sm"
                >
                  Upload image
                </Button>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Description
            </label>
            <textarea
              id="description"
              placeholder="Enter course description"
              value={description}
              onChange={(e) => updateMetadata({ description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm resize-none"
            />
          </div>
        </div>

        {/* Access Section */}
        <div className="space-y-6 pt-6 border-t border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Access</h3>

          {/* Public/Private Course */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Course visibility
            </label>
            <div className="space-y-2">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="accessType"
                  value="public"
                  checked={courseSettings.isPublic}
                  onChange={(e) =>
                    updateMetadata({
                      settings: { ...courseSettings, isPublic: true },
                    })
                  }
                  className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <div>
                  <span className="text-sm font-medium text-gray-900">
                    Public course
                  </span>
                  <p className="text-xs text-gray-500">
                    Anyone can find and enroll in this course
                  </p>
                </div>
              </label>

              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="accessType"
                  value="private"
                  checked={!courseSettings.isPublic}
                  onChange={(e) =>
                    updateMetadata({
                      settings: { ...courseSettings, isPublic: false },
                    })
                  }
                  className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <div>
                  <span className="text-sm font-medium text-gray-900">
                    Private course
                  </span>
                  <p className="text-xs text-gray-500">
                    Only invited users can access this course
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Hidden Course */}
          <div className="flex items-start space-x-3">
            <input
              type="checkbox"
              id="isHidden"
              checked={courseSettings.isHidden}
              onChange={(e) =>
                updateMetadata({
                  settings: { ...courseSettings, isHidden: e.target.checked },
                })
              }
              className="h-4 w-4 mt-0.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="isHidden" className="cursor-pointer">
              <span className="text-sm font-medium text-gray-900 block">
                Hidden course
              </span>
              <p className="text-xs text-gray-500">
                Hide this course from the course catalog
              </p>
            </label>
          </div>
        </div>

        {/* Course Features Section */}
        <div className="space-y-6 pt-6 border-t border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Course Features</h3>

          {/* Course Level */}
          <div className="space-y-2">
            <Label>Course Level</Label>
            <Select
              value={metadata.level}
              onValueChange={(val) => updateMetadata({ level: val })}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Enable Course Ratings */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable Course Ratings</Label>
              <p className="text-sm text-muted-foreground">
                Allow students to rate this course.
              </p>
            </div>
            <Switch
              checked={courseSettings.enableRatings}
              onCheckedChange={(val) =>
                updateMetadata({
                  settings: { ...courseSettings, enableRatings: val },
                })
              }
            />
          </div>

          <Separator />

          {/* Enable Discussions */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable Discussions</Label>
              <p className="text-sm text-muted-foreground">
                Allow students to discuss in lessons.
              </p>
            </div>
            <Switch
              checked={courseSettings.enableDiscussions}
              onCheckedChange={(val) =>
                updateMetadata({
                  settings: { ...courseSettings, enableDiscussions: val },
                })
              }
            />
          </div>

          <Separator />

          {/* Enable Certificates */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enable Certificates</Label>
                <p className="text-sm text-muted-foreground">
                  Issue certificates upon completion.
                </p>
              </div>
              <Switch
                checked={courseSettings.enableCertificates}
                onCheckedChange={(val) =>
                  updateMetadata({
                    settings: { ...courseSettings, enableCertificates: val },
                  })
                }
              />
            </div>

            {courseSettings.enableCertificates && (
              <div className="ml-2 pl-4 border-l-2 space-y-2">
                <Label>Certificate Validity (Days)</Label>
                <Input
                  type="number"
                  className="w-[200px]"
                  value={courseSettings.certificateValidityDays ?? ""}
                  onChange={(e) =>
                    updateMetadata({
                      settings: {
                        ...courseSettings,
                        certificateValidityDays: e.target.value
                          ? parseInt(e.target.value)
                          : null,
                      },
                    })
                  }
                  placeholder="0 = Forever"
                />
                <p className="text-xs text-muted-foreground">
                  Set to 0 or leave empty for no expiration.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Security Section */}
        <div className="space-y-6 pt-6 border-t border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Security</h3>

          {/* Trade File Source */}
          <div className="flex items-start space-x-3">
            <input
              type="checkbox"
              id="tradeFileSource"
              checked={courseSettings.tradeFileSource}
              onChange={(e) =>
                updateMetadata({
                  settings: {
                    ...courseSettings,
                    tradeFileSource: e.target.checked,
                  },
                })
              }
              className="h-4 w-4 mt-0.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="tradeFileSource" className="cursor-pointer">
              <span className="text-sm font-medium text-gray-900 block">
                Trade file source
              </span>
              <p className="text-xs text-gray-500">
                Prevent users from downloading or accessing the source files
              </p>
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-6 border-t border-gray-200">
          <Button
            onClick={handleSaveChanges}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Save changes
          </Button>
          <Button
            variant="outline"
            onClick={handleDiscardChanges}
            className="text-gray-700 hover:bg-gray-50"
          >
            Discard changes
          </Button>
        </div>
      </div>
    </div>
  );
}

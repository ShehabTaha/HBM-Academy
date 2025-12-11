"use client";

import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCourse } from "@/contexts/CourseContext";
import Image from "next/image";

export default function SettingsPage() {
  const { chapters } = useCourse();

  // Form state
  const [courseName, setCourseName] = useState("");
  const [courseImage, setCourseImage] = useState<string | null>(null);
  const [courseImageFile, setCourseImageFile] = useState<File | null>(null);
  const [description, setDescription] = useState("");
  const [courseOverview, setCourseOverview] = useState("");
  const [accessType, setAccessType] = useState<"public" | "private">("public");
  const [isHidden, setIsHidden] = useState(false);
  const [tradeFileSource, setTradeFileSource] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCourseImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCourseImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleSaveChanges = () => {
    // TODO: Implement save functionality
    console.log({
      courseName,
      courseImage: courseImageFile,
      description,
      courseOverview,
      accessType,
      isHidden,
      tradeFileSource,
      chapters,
    });
  };

  const handleDiscardChanges = () => {
    // Reset form to initial values
    setCourseName("");
    setCourseImage(null);
    setCourseImageFile(null);
    setDescription("");
    setCourseOverview("");
    setAccessType("public");
    setIsHidden(false);
    setTradeFileSource(false);
  };

  return (
    <div className="w-full max-w-3xl py-8">
      <h2 className="text-2xl font-semibold text-gray-900 mb-8">Settings</h2>

      <div className="space-y-8">
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
              onChange={(e) => setCourseName(e.target.value)}
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
              <div className="w-48 h-28 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50 overflow-hidden">
                {courseImage ? (
                  <div className="relative w-full h-full">
                    <Image
                      src={courseImage}
                      alt="Course preview"
                      fill
                      className="object-cover"
                    />
                  </div>
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
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm resize-none"
            />
          </div>

          {/* Course Overview */}
          <div>
            <label
              htmlFor="courseOverview"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Course overview
            </label>
            <p className="text-xs text-gray-500 mb-2">
              Provide an overview of what students will learn in this course
            </p>
            <textarea
              id="courseOverview"
              placeholder="Enter course overview"
              value={courseOverview}
              onChange={(e) => setCourseOverview(e.target.value)}
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
                  checked={accessType === "public"}
                  onChange={(e) =>
                    setAccessType(e.target.value as "public" | "private")
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
                  checked={accessType === "private"}
                  onChange={(e) =>
                    setAccessType(e.target.value as "public" | "private")
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
              checked={isHidden}
              onChange={(e) => setIsHidden(e.target.checked)}
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

        {/* Security Section */}
        <div className="space-y-6 pt-6 border-t border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Security</h3>

          {/* Trade File Source */}
          <div className="flex items-start space-x-3">
            <input
              type="checkbox"
              id="tradeFileSource"
              checked={tradeFileSource}
              onChange={(e) => setTradeFileSource(e.target.checked)}
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

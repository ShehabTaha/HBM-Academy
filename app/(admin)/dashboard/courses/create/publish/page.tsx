"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useCourse } from "@/contexts/CourseContext";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle, AlertCircle, Eye, EyeOff } from "lucide-react";
import Image from "next/image";

// Import service dynamically locally to avoid SSR issues if any
// But actually services are fine to import if they just export classes.
// We'll import dynamically in handlePublish just to be safe with client/server boundary if needed.

export default function PublishPage() {
  const { metadata, chapters, updateMetadata, clearCache } = useCourse();
  const { toast } = useToast();
  const router = useRouter();

  const [isPublishing, setIsPublishing] = useState(false);

  // Validation checks
  const hasTitle = metadata.title.trim().length > 0;
  const hasDescription = metadata.description.trim().length > 0;
  // const hasImage = !!metadata.image; // Optional but recommended
  const hasChapters = chapters.length > 0;
  const hasLessons = chapters.some((ch) => ch.lessons.length > 0);

  const hasPrice =
    metadata.paymentType === "free" ||
    (metadata.paymentType === "subscription" &&
      (metadata.recurringPrice || 0) > 0) ||
    ((metadata.paymentType === "one-time" ||
      metadata.paymentType === "installment") &&
      (metadata.price || 0) > 0);

  const canPublish =
    hasTitle && hasDescription && hasChapters && hasLessons && hasPrice;

  const handlePublish = async () => {
    if (!canPublish) {
      toast({
        title: "Cannot publish",
        description: "Please complete all required fields before publishing.",
        variant: "destructive",
      });
      return;
    }

    setIsPublishing(true);

    try {
      // Import services
      const { CourseService } = await import("@/lib/services/courses.service");
      const { SectionService } =
        await import("@/lib/services/sections.service");
      const { LessonService } = await import("@/lib/services/lessons.service");
      const { uploadCourseThumbnail } =
        await import("@/lib/services/storage.service");

      // 1. Create Course
      const courseData = {
        title: metadata.title,
        description: metadata.description,
        // instructor_id is handled by API route from session
        category: metadata.category || undefined,
        level: metadata.level as any,
        price: metadata.price,
        payment_type: metadata.paymentType,
        recurring_interval: metadata.recurringInterval,
        recurring_price: metadata.recurringPrice,
        installment_count: metadata.installmentCount,
        image: metadata.image, // This might be data URL if new, need handling
        settings: metadata.settings,
      };

      // Get current user ID (mock for now, should use useSession)
      // In a real app, we'd use useSession() here.
      // For now, let's assume the API route handles instructor_id assignment if missing,
      // or we accept it might fail if we don't pass it.
      // Actually, typically we'd submit to our API route /api/courses which handles auth.

      // Let's call the API route instead of Service directly to handle Auth properly?
      // Or use Service if we can get user ID.
      // Given we are in 'use client', calling API route is safer for Auth.

      const response = await fetch("/api/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(courseData),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || "Failed to create course");
      }

      const { course } = responseData;
      const courseId = course.id;

      // 2. Upload Image if it's a data URL (newly selected)
      if (metadata.image && metadata.image.startsWith("data:")) {
        try {
          // Convert data URL to Blob
          const res = await fetch(metadata.image);
          const blob = await res.blob();

          // Use FormData for API upload
          const formData = new FormData();
          formData.append("file", blob, "course-thumbnail.jpg");
          formData.append("courseId", courseId);

          // Call our new API route which handles S3/Supabase upload securely
          const uploadResponse = await fetch("/api/courses/upload", {
            method: "POST",
            body: formData,
          });

          if (!uploadResponse.ok) {
            const errData = await uploadResponse.json();
            throw new Error(errData.error || "Upload failed");
          }

          const { url } = await uploadResponse.json();

          if (url) {
            // Update course with new image URL
            await CourseService.updateCourseThumbnail(courseId, url);
          }
        } catch (uploadError) {
          console.error("Image upload exception:", uploadError);
          // Don't block publish on image upload fail
          toast({
            title: "Thumbnail Warning",
            description:
              "Failed to process image upload. Course will be published without new image.",
            variant: "destructive",
          });
        }
      }

      // 3. Create Chapters (Sections) & Lessons
      // We need to loop through chapters
      for (let i = 0; i < chapters.length; i++) {
        const chapter = chapters[i];
        const { section } = await SectionService.createSection({
          course_id: courseId,
          title: chapter.title,
          order: i,
        });

        if (section) {
          // Create lessons for this section
          for (let j = 0; j < chapter.lessons.length; j++) {
            const lesson = chapter.lessons[j];
            await LessonService.createLesson({
              section_id: section.id,
              title: lesson.title,
              type: lesson.type as any,
              content: lesson.content, // This should be URL if uploaded
              description: lesson.description,
              order: j,
              duration: 0, // Should be calculated or passed
              is_free_preview: lesson.settings.isFreePreview,
              is_prerequisite: lesson.settings.isPrerequisite,
              enable_discussions: lesson.settings.enableDiscussions,
              is_downloadable: lesson.settings.isDownloadable,
            });
          }
        }
      }

      // 4. Publish Course
      await CourseService.publishCourse(courseId);

      // Clear draft after successful publish
      clearCache();

      toast({
        title: "Success!",
        description: "Course published successfully.",
      });

      // Redirect to course list
      router.push("/dashboard/courses");
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to publish course",
        variant: "destructive",
      });
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="w-full max-w-3xl py-8">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">
        Publish Course
      </h2>

      <div className="bg-white rounded-lg border p-6 space-y-6">
        <div>
          <h3 className="text-lg font-medium mb-4">Course Checklist</h3>
          <div className="space-y-3">
            <CheckItem label="Course Title" isComplete={hasTitle} />
            <CheckItem label="Course Description" isComplete={hasDescription} />
            <CheckItem label="Pricing" isComplete={hasPrice} />
            <CheckItem
              label="Curriculum (Chapters & Lessons)"
              isComplete={hasChapters && hasLessons}
            />
          </div>
        </div>

        <div className="pt-4 border-t">
          <p className="text-sm text-gray-500 mb-4">
            Once you publish your course, it will be visible to students based
            on your visibility settings.
          </p>

          <div className="flex gap-4">
            <Button
              onClick={handlePublish}
              disabled={!canPublish || isPublishing}
              className="bg-blue-600 hover:bg-blue-700 min-w-[120px]"
            >
              {isPublishing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Publishing...
                </>
              ) : (
                "Publish Course"
              )}
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-8 bg-gray-50 rounded-lg p-6 border flex gap-4">
        <div className="bg-white p-2 rounded-md shadow-sm h-fit">
          {metadata.image ? (
            <Image
              src={metadata.image}
              alt="Course"
              width={100}
              height={56}
              className="object-cover rounded"
            />
          ) : (
            <div className="w-[100px] h-[56px] bg-gray-200 rounded flex items-center justify-center">
              <span className="text-xs text-gray-500">No Image</span>
            </div>
          )}
        </div>
        <div>
          <h4 className="font-medium text-gray-900">
            {metadata.title || "Untitled Course"}
          </h4>
          <p className="text-sm text-gray-500 line-clamp-2 mt-1">
            {metadata.description || "No description provided."}
          </p>
          <div className="flex gap-2 mt-2">
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
              {metadata.level}
            </span>
            <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
              {chapters.length} Chapters
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function CheckItem({
  label,
  isComplete,
}: {
  label: string;
  isComplete: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      {isComplete ? (
        <CheckCircle className="text-green-500 h-5 w-5" />
      ) : (
        <AlertCircle className="text-yellow-500 h-5 w-5" />
      )}
      <span
        className={`text-sm ${isComplete ? "text-gray-900" : "text-gray-500"}`}
      >
        {label}
      </span>
    </div>
  );
}

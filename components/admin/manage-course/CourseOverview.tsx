"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CourseWithDetails } from "./types";
import { CourseLevel } from "@/types/database.types";
import { Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { CourseService } from "@/lib/services/courses.service";

// import { uploadCourseThumbnail } from "@/lib/services/storage.service"; // Switched to API route

interface CourseOverviewProps {
  course: CourseWithDetails;
  onCourseUpdated: (course: CourseWithDetails) => void;
}

const LEVELS: CourseLevel[] = ["beginner", "intermediate", "advanced"];

export function CourseOverview({
  course,
  onCourseUpdated,
}: CourseOverviewProps) {
  const { toast } = useToast();
  const draftKey = `hbm_course_overview_draft_${course.id}`;

  const [formData, setFormData] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(draftKey);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error("Failed to parse course overview draft", e);
        }
      }
    }
    return {
      title: course.title,
      slug: course.slug,
      level: course.level || "beginner",
      description: course.description,
      image: course.image || "",
    };
  });

  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Sync formData to localStorage
  useEffect(() => {
    const isChanged =
      formData.title !== course.title ||
      formData.slug !== course.slug ||
      formData.level !== (course.level || "beginner") ||
      formData.description !== course.description ||
      formData.image !== (course.image || "");

    setIsDirty(isChanged);

    if (isChanged) {
      localStorage.setItem(draftKey, JSON.stringify(formData));
    } else {
      localStorage.removeItem(draftKey);
    }
  }, [formData, course, draftKey]);

  const handleChange = (field: string, value: string) => {
    setFormData(
      (prev: {
        title: string;
        slug: string;
        level: string;
        description: string;
        image: string;
      }) => ({ ...prev, [field]: value }),
    );
  };

  const handleSlugGeneraton = () => {
    const slug = CourseService.generateSlug(formData.title);
    handleChange("slug", slug);
  };

  const handleSave = async () => {
    if (!isDirty) return;

    if (formData.title.length < 5) {
      toast({
        title: "Validation Error",
        description: "Title must be at least 5 characters long",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const { course: updatedCourse, error } = await CourseService.updateCourse(
        course.id,
        {
          title: formData.title,
          level: formData.level as CourseLevel,
          description: formData.description,
          image: formData.image,
          // Note: Slug updates might need valid check if enforced by backend logic in updateCourse
        },
      );

      if (error) throw new Error(error);
      if (updatedCourse) {
        // Merge with existing sections since updateCourse doesn't return them
        onCourseUpdated({
          ...updatedCourse,
          sections: course.sections,
        });

        // Clear draft on successful save
        localStorage.removeItem(draftKey);

        toast({
          title: "Success",
          description: "Course details updated successfully",
        });
        setIsDirty(false);
      }
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to save changes",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "File size must be less than 5MB",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      // Use the Admin API to upload (bypasses RLS)
      const formData = new FormData();
      formData.append("file", file);
      formData.append("bucket", "course-thumbnails");
      formData.append("pathPrefix", course.id); // Organize by course ID

      const response = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to upload image");
      }

      if (data.success && data.url) {
        handleChange("image", data.url);
        toast({
          title: "Success",
          description: "Image uploaded successfully",
        });
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to upload image",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Course Information</CardTitle>
          <CardDescription>
            Update your course metadata and basic settings.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Course Title
              </label>
              <Input
                value={formData.title}
                onChange={(e) => handleChange("title", e.target.value)}
                onBlur={handleSlugGeneraton}
                placeholder="e.g. Complete React Guide"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Slug (URL Friendly)
              </label>
              <div className="flex gap-2">
                <Input
                  value={formData.slug}
                  onChange={(e) => handleChange("slug", e.target.value)}
                  disabled // Generally auto-generated, can enable if manual edit needed
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleSlugGeneraton}
                  title="Regenerate from title"
                  type="button"
                >
                  <Loader2 className="h-4 w-4 animate-spin hidden" />{" "}
                  {/* Placeholder for logic */}
                  <span className="sr-only">Generate</span>⚡
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Level
              </label>
              <select
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={formData.level}
                onChange={(e) => handleChange("level", e.target.value)}
              >
                {LEVELS.map((level) => (
                  <option key={level} value={level} className="capitalize">
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Description
            </label>
            <textarea
              className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Describe what students will learn..."
            />
            <div className="text-xs text-muted-foreground text-right">
              {formData.description.length} characters
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Course Thumbnail
            </label>
            <div className="flex items-center gap-4 rounded-lg border border-dashed p-4">
              {formData.image ? (
                <div className="relative h-20 w-32 overflow-hidden rounded-md border">
                  <img
                    src={formData.image || undefined}
                    alt="Preview"
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : (
                <div className="flex h-20 w-32 items-center justify-center rounded-md bg-muted text-muted-foreground">
                  No Image
                </div>
              )}
              <div className="flex-1">
                <Input
                  type="file"
                  accept="image/*"
                  className="cursor-pointer"
                  onChange={handleImageUpload}
                  disabled={isUploading}
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Recommended: 1280x720px (16:9). Max 5MB.
                </p>
              </div>
              {isUploading && (
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
              )}
            </div>
          </div>

          <div className="flex items-center justify-between pt-4">
            {isDirty && (
              <span className="text-sm text-yellow-600 font-medium animate-pulse">
                Unsaved changes
              </span>
            )}
            <div className="flex gap-2 ml-auto">
              <Button onClick={handleSave} disabled={!isDirty || isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

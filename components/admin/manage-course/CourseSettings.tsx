"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label"; // Check if Label exists. No. I'll use <label>.
import { Separator } from "@/components/ui/separator";
import { AlertCircle, Trash2 } from "lucide-react";
import { CourseWithDetails } from "./types";
import { useToast } from "@/components/ui/use-toast";
import { CourseService } from "@/lib/services/courses.service";

// Simple Switch Component since we might not have it in components/ui
function SimpleSwitch({
  checked,
  onCheckedChange,
  disabled,
}: {
  checked: boolean;
  onCheckedChange: (c: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={`
        relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50
        ${checked ? "bg-primary" : "bg-input"}
      `}
    >
      <span
        className={`
          pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform
          ${checked ? "translate-x-5" : "translate-x-0"}
        `}
      />
    </button>
  );
}

interface CourseSettingsProps {
  course: CourseWithDetails;
  onUpdate: () => void;
  onDelete: () => Promise<void>;
}

export function CourseSettings({
  course,
  onUpdate,
  onDelete,
}: CourseSettingsProps) {
  const { toast } = useToast();
  const [isPublished, setIsPublished] = useState(course.is_published);
  const [isUpdating, setIsUpdating] = useState(false);

  const handlePublishToggle = async (checked: boolean) => {
    setIsPublished(checked);
    setIsUpdating(true);
    try {
      const { error } = await CourseService.updateCourse(course.id, {
        is_published: checked,
      });
      if (error) throw new Error(error);
      toast({
        title: checked ? "Course Published" : "Course Unpublished",
        description: checked
          ? "Your course is now live."
          : "Your course is now in draft mode.",
      });
      onUpdate();
    } catch (error) {
      setIsPublished(!checked); // Revert
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Availability */}
      <Card>
        <CardHeader>
          <CardTitle>Course Availability</CardTitle>
          <CardDescription>
            Control how and when students can access your course.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between space-x-2">
            <div className="space-y-0.5">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Publish Course
              </label>
              <p className="text-sm text-muted-foreground">
                Make this course visible to students.
              </p>
            </div>
            <SimpleSwitch
              checked={isPublished}
              onCheckedChange={handlePublishToggle}
              disabled={isUpdating}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between space-x-2">
            <div className="space-y-0.5">
              <label className="text-sm font-medium leading-none">
                Public Course
              </label>
              <p className="text-sm text-muted-foreground">
                If disabled, the course will be private (invite only).
              </p>
            </div>
            <SimpleSwitch
              checked={course.settings?.isPublic ?? true}
              onCheckedChange={async (val) => {
                try {
                  await CourseService.updateCourse(course.id, {
                    settings: { ...course.settings, isPublic: val } as any,
                  });
                  onUpdate();
                  toast({
                    title: "Success",
                    description: "Visibility updated",
                  });
                } catch (e) {
                  toast({
                    title: "Error",
                    description: "Failed to update",
                    variant: "destructive",
                  });
                }
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Learning Experience */}
      <Card>
        <CardHeader>
          <CardTitle>Learning Experience</CardTitle>
          <CardDescription>
            Configure features available to students.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between space-x-2">
            <div className="space-y-0.5">
              <label className="text-sm font-medium leading-none">
                Enable Ratings
              </label>
              <p className="text-sm text-muted-foreground">
                Allow students to rate this course.
              </p>
            </div>
            <SimpleSwitch
              checked={course.settings?.enableRatings ?? false}
              onCheckedChange={async (val) => {
                try {
                  await CourseService.updateCourse(course.id, {
                    settings: { ...course.settings, enableRatings: val } as any,
                  });
                  onUpdate();
                  toast({
                    title: "Success",
                    description: "Ratings setting updated",
                  });
                } catch (e) {
                  toast({
                    title: "Error",
                    description: "Failed to update",
                    variant: "destructive",
                  });
                }
              }}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between space-x-2">
            <div className="space-y-0.5">
              <label className="text-sm font-medium leading-none">
                Enable Discussions
              </label>
              <p className="text-sm text-muted-foreground">
                Allow comments and questions on lessons.
              </p>
            </div>
            <SimpleSwitch
              checked={course.settings?.enableDiscussions ?? false}
              onCheckedChange={async (val) => {
                try {
                  await CourseService.updateCourse(course.id, {
                    settings: {
                      ...course.settings,
                      enableDiscussions: val,
                    } as any,
                  });
                  onUpdate();
                  toast({
                    title: "Success",
                    description: "Discussions setting updated",
                  });
                } catch (e) {
                  toast({
                    title: "Error",
                    description: "Failed to update",
                    variant: "destructive",
                  });
                }
              }}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between space-x-2">
            <div className="space-y-0.5">
              <label className="text-sm font-medium leading-none">
                Course Certificate
              </label>
              <p className="text-sm text-muted-foreground">
                Issue a certificate upon 100% completion.
              </p>
            </div>
            <SimpleSwitch
              checked={course.settings?.enableCertificates ?? false}
              onCheckedChange={async (val) => {
                try {
                  await CourseService.updateCourse(course.id, {
                    settings: {
                      ...course.settings,
                      enableCertificates: val,
                    } as any,
                  });
                  onUpdate();
                  toast({
                    title: "Success",
                    description: "Certificates setting updated",
                  });
                } catch (e) {
                  toast({
                    title: "Error",
                    description: "Failed to update",
                    variant: "destructive",
                  });
                }
              }}
            />
          </div>

          {course.settings?.enableCertificates && (
            <div className="mt-4 border-l-2 pl-4 ml-2 space-y-2">
              <Label>Certificate Validity (Days)</Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  className="w-[150px]"
                  defaultValue={course.settings?.certificateValidityDays ?? ""}
                  placeholder="0 = Forever"
                  onBlur={async (e) => {
                    // Save on blur
                    const val = e.target.value
                      ? parseInt(e.target.value)
                      : null;
                    if (val === course.settings?.certificateValidityDays)
                      return;

                    try {
                      await CourseService.updateCourse(course.id, {
                        settings: {
                          ...course.settings,
                          certificateValidityDays: val,
                        } as any,
                      });
                      onUpdate();
                      toast({
                        title: "Success",
                        description: "Certificate validity updated",
                      });
                    } catch (err) {
                      toast({
                        title: "Error",
                        description: "Failed to update",
                        variant: "destructive",
                      });
                    }
                  }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Set to 0 or leave empty for no expiration.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="text-red-600">Danger Zone</CardTitle>
          <CardDescription className="text-red-600/80">
            Irreversible actions for your course.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-red-900">Delete Course</h4>
              <p className="text-sm text-red-700">
                Permanently delete this course and all its content. This action
                cannot be undone.
              </p>
            </div>
            <Button variant="destructive" onClick={() => onDelete()}>
              <Trash2 className="mr-2 h-4 w-4" /> Delete Course
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

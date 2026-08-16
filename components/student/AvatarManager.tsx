"use client";

import { useRef, useState } from "react";
import { Camera, Loader2, RotateCcw, Trash2 } from "lucide-react";
import { AvatarCropModal } from "@/components/dashboard/account/AvatarCropModal";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { useStudent } from "@/hooks/useStudent";
import { resolveAvatarUrl } from "@/lib/avatar";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const VALID_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/jpg"]);

export function AvatarManager() {
  const inputRef = useRef<HTMLInputElement>(null);
  const { student, setStudent } = useStudent();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [cropOpen, setCropOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!VALID_TYPES.has(file.type)) {
      toast({
        title: "Unsupported image",
        description: "Upload a JPG, PNG, or WebP image.",
        variant: "destructive",
      });
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: "Image too large",
        description: "Profile pictures must be smaller than 5MB.",
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);
    setCropOpen(true);
  }

  async function uploadCroppedAvatar(blob: Blob) {
    setSaving(true);
    const formData = new FormData();
    formData.append(
      "file",
      new File([blob], `student-avatar-${Date.now()}.webp`, {
        type: "image/webp",
      }),
    );

    try {
      const response = await fetch("/api/student/auth/avatar", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Avatar could not be saved.");
      }

      setStudent(data.student);
      setCropOpen(false);
      setSelectedFile(null);
      toast({
        title: "Profile picture updated",
        description: "Your new avatar is now visible across the platform.",
      });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Avatar could not be saved.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }

  async function removeAvatar() {
    setSaving(true);
    try {
      const response = await fetch("/api/student/auth/avatar", {
        method: "DELETE",
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Avatar could not be removed.");
      }

      setStudent(data.student);
      toast({
        title: "Default avatar restored",
        description: "Your profile picture has been reset.",
      });
    } catch (error) {
      toast({
        title: "Remove failed",
        description: error instanceof Error ? error.message : "Avatar could not be removed.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }

  const hasCustomAvatar =
    !!student?.avatar && student.avatar !== resolveAvatarUrl(null);

  return (
    <div className="space-y-3">
      <Label>Profile picture</Label>
      <div className="flex flex-wrap items-center gap-4">
        <Avatar className="h-20 w-20 border">
          <AvatarImage src={student?.avatar ?? undefined} alt={student?.name ?? "Student"} />
          <AvatarFallback>{student?.name?.[0]?.toUpperCase() ?? "S"}</AvatarFallback>
        </Avatar>
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => inputRef.current?.click()}
              disabled={saving}
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
              Change photo
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={removeAvatar}
              disabled={saving || !hasCustomAvatar}
            >
              {hasCustomAvatar ? <Trash2 className="h-4 w-4" /> : <RotateCcw className="h-4 w-4" />}
              Use default
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            JPG, PNG, or WebP. Crop to square before saving. Max 5MB.
          </p>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      <AvatarCropModal
        isOpen={cropOpen}
        imageFile={selectedFile}
        onSave={uploadCroppedAvatar}
        onCancel={() => {
          setCropOpen(false);
          setSelectedFile(null);
        }}
      />
    </div>
  );
}

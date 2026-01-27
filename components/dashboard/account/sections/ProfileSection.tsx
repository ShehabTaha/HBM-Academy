"use client";

import React, { useState } from "react";
import { User } from "@/types/account";
import { useProfileUpdate } from "@/hooks/account/useProfileUpdate";
import { Camera, Mail, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { EmailChangeDialog } from "../EmailChangeDialog";
import Image from "next/image";

interface ProfileSectionProps {
  user: User;
  refresh: () => void;
}

export default function ProfileSection({ user, refresh }: ProfileSectionProps) {
  const { isUpdating, updateBasicInfo, updateAvatar } = useProfileUpdate();
  const [formData, setFormData] = useState({
    name: user.name,
    bio: user.bio || "",
  });
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const result = await updateAvatar(user.id, file);
      if (result.success) refresh();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await updateBasicInfo(user.id, formData);
    if (result.success) refresh();
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h3 className="text-xl font-bold text-gray-900">Profile</h3>
        <p className="text-sm text-gray-500">
          Manage your basic account information
        </p>
      </div>

      <div className="space-y-8">
        {/* Avatar Section */}
        <div>
          <Label className="block mb-4">Profile Picture</Label>
          <div className="flex items-center space-x-6">
            <div className="relative h-24 w-24 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center border border-gray-200">
              {user.avatar ? (
                <Image
                  src={user.avatar}
                  alt={user.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <span className="text-2xl font-bold text-gray-400">
                  {user.name[0]}
                </span>
              )}
              {isUpdating && (
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-white" />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="relative cursor-pointer"
                  disabled={isUpdating}
                >
                  <input
                    type="file"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    accept="image/*"
                    onChange={handleAvatarChange}
                  />
                  <Camera className="mr-2 h-4 w-4" />
                  Change Avatar
                </Button>
                {user.avatar && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() =>
                      updateBasicInfo(user.id, { avatar: null }).then(() =>
                        refresh(),
                      )
                    }
                    disabled={isUpdating}
                  >
                    Remove
                  </Button>
                )}
              </div>
              <p className="text-xs text-gray-500">
                Max 5MB. JPG, PNG or WebP. 1:1 ratio recommended.
              </p>
            </div>
          </div>
        </div>

        {/* Basic Info Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                maxLength={100}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Input
                  id="email"
                  value={user.email}
                  disabled
                  className="bg-gray-50 pl-10"
                />
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <div className="absolute right-3 top-2.5 flex items-center">
                  {user.is_email_verified && (
                    <span className="flex items-center text-xs text-green-600 font-medium">
                      <CheckCircle className="mr-1 h-3 w-3" />
                      Verified
                    </span>
                  )}
                </div>
              </div>
              <p
                className="text-xs text-blue-600 cursor-pointer hover:underline font-medium"
                onClick={() => setIsEmailDialogOpen(true)}
              >
                Request email change
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) =>
                setFormData({ ...formData, bio: e.target.value })
              }
              placeholder="Tell us a bit about yourself..."
              rows={4}
              maxLength={500}
            />
            <div className="text-right text-xs text-gray-400">
              {formData.bio.length}/500
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
            <div className="text-xs text-gray-400">
              Account created on{" "}
              {new Date(user.created_at).toLocaleDateString()}
            </div>
            <div className="space-x-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() =>
                  setFormData({ name: user.name, bio: user.bio || "" })
                }
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isUpdating}>
                {isUpdating && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Save Changes
              </Button>
            </div>
          </div>
        </form>
      </div>

      <EmailChangeDialog
        user={user}
        isOpen={isEmailDialogOpen}
        onOpenChange={setIsEmailDialogOpen}
        onSuccess={refresh}
      />
    </div>
  );
}

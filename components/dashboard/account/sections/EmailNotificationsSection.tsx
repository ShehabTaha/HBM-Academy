"use client";

import React, { useState } from "react";
import { User, UserProfile } from "@/types/account";
import { useProfileUpdate } from "@/hooks/account/useProfileUpdate";
import { EmailChangeDialog } from "../EmailChangeDialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Loader2, Mail, ExternalLink, RefreshCcw } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface EmailNotificationsSectionProps {
  user: User;
  profile: UserProfile;
  refresh: () => void;
}

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export default function EmailNotificationsSection({
  user,
  profile,
  refresh,
}: EmailNotificationsSectionProps) {
  const { isUpdating, updatePreferences } = useProfileUpdate();
  const [preferences, setPreferences] = useState(profile.preferences);

  // Email Change State
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);

  const handleToggle = (key: string) => {
    const k = key as keyof typeof preferences;
    const newPrefs = { ...preferences, [k]: !preferences[k] };
    setPreferences(newPrefs);
  };

  const handleSave = async () => {
    const result = await updatePreferences(profile.user_id, preferences);
    if (result.success) refresh();
  };

  const notificationItems = [
    {
      key: "notification_emails",
      label: "Course Updates",
      description: "Receive emails when course updates are published",
    },
    {
      key: "marketing_emails",
      label: "Marketing Emails",
      description: "Receive news, special offers, and promotions",
    },
    {
      key: "newsletter",
      label: "Newsletter",
      description: "Subscribe to our weekly newsletter",
    },
    {
      key: "enrollment_confirmations",
      label: "Enrollment Confirmations",
      description: "Get confirmation when you enroll in a course",
    },
    {
      key: "progress_notifications",
      label: "Progress Notifications",
      description: "Email when you complete lessons or courses",
    },
    {
      key: "discussion_replies",
      label: "Discussion Replies",
      description: "Get notified when someone replies to your discussion",
    },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h3 className="text-xl font-bold text-gray-900">
          Email & Notifications
        </h3>
        <p className="text-sm text-gray-500">Manage your email preferences</p>
      </div>

      <div className="space-y-8">
        {/* Email Status */}
        <div className="bg-blue-50 rounded-lg p-6 flex items-start space-x-4 border border-blue-100">
          <div className="bg-blue-100 p-2 rounded-lg">
            <Mail className="h-6 w-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-blue-900">
              Primary Email Status
            </h4>
            <p className="text-sm text-blue-700 mt-1">
              Your primary email is used for account security and course
              updates.
            </p>
            <div className="flex items-center space-x-4 mt-4">
              <Button
                variant="outline"
                size="sm"
                className="bg-white"
                onClick={() => setIsEmailDialogOpen(true)}
              >
                Change Email Address
                <ExternalLink className="ml-2 h-3 w-3" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="text-blue-600 hover:bg-blue-100"
              >
                <RefreshCcw className="mr-2 h-3 w-3" />
                Resend Verification
              </Button>
            </div>
          </div>
        </div>

        {/* Preferences Toggles */}
        <div className="space-y-6">
          <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
            Communication Preferences
          </h4>

          <div className="space-y-4">
            {notificationItems.map((item) => (
              <div
                key={item.key}
                className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors"
              >
                <div className="space-y-0.5">
                  <Label className="text-base font-semibold text-gray-900">
                    {item.label}
                  </Label>
                  <p className="text-sm text-gray-500">{item.description}</p>
                </div>
                <Switch
                  checked={
                    (preferences[
                      item.key as keyof typeof preferences
                    ] as boolean) ?? false
                  }
                  onCheckedChange={() => handleToggle(item.key)}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Frequency */}
        <div className="space-y-4">
          <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
            Email Frequency
          </h4>
          <RadioGroup
            defaultValue="immediately"
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            {[
              {
                id: "immediately",
                label: "Immediately",
                description: "Receive emails as they happen",
              },
              {
                id: "daily",
                label: "Daily Digest",
                description: "One email per day with all updates",
              },
              {
                id: "weekly",
                label: "Weekly Digest",
                description: "One email every Monday",
              },
              {
                id: "never",
                label: "Never",
                description: "Turn off all non-essential emails",
              },
            ].map((option) => (
              <div
                key={option.id}
                className="relative flex items-center space-x-3 p-4 rounded-xl border border-gray-100 cursor-pointer hover:border-blue-200"
              >
                <RadioGroupItem value={option.id} id={option.id} />
                <Label htmlFor={option.id} className="cursor-pointer">
                  <div className="font-semibold text-gray-900">
                    {option.label}
                  </div>
                  <div className="text-xs text-gray-500">
                    {option.description}
                  </div>
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <div className="pt-6 border-t border-gray-100 flex justify-end">
          <Button onClick={handleSave} disabled={isUpdating}>
            {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Preferences
          </Button>
        </div>
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

"use client";

import { useState } from "react";
import { User, UserProfile } from "@/types/account";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, BellRing, Plus, X, Send, Save } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAdminNotificationSettings } from "@/hooks/account/useAdminNotificationSettings";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { NotificationFrequency } from "@/lib/validations/admin-notifications";

interface EmailNotificationsSectionProps {
  user: User;
  profile: UserProfile;
  refresh: () => void;
}

const FREQUENCY_OPTIONS: { value: NotificationFrequency; label: string }[] = [
  { value: "immediate", label: "Immediate" },
  { value: "daily", label: "Daily Digest" },
  { value: "off", label: "Off" },
];

export default function EmailNotificationsSection({
  user,
}: EmailNotificationsSectionProps) {
  const {
    settings,
    isLoading,
    isSaving,
    isSendingTest,
    updateSettings,
    sendTestNotification,
  } = useAdminNotificationSettings();

  const [newEmail, setNewEmail] = useState("");

  const handleFrequencyChange = (
    key: keyof typeof settings.preferences,
    value: NotificationFrequency,
  ) => {
    updateSettings({
      ...settings,
      preferences: {
        ...settings.preferences,
        [key]: value,
      },
    });
  };

  const handleAddEmail = () => {
    if (!newEmail || !newEmail.includes("@")) return;
    if (settings.recipient_emails.includes(newEmail)) return;

    updateSettings({
      ...settings,
      recipient_emails: [...settings.recipient_emails, newEmail],
    });
    setNewEmail("");
  };

  const handleRemoveEmail = (email: string) => {
    updateSettings({
      ...settings,
      recipient_emails: settings.recipient_emails.filter((e) => e !== email),
    });
  };

  if (isLoading) {
    return (
      <div className="p-8 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const renderFrequencySelect = (
    key: keyof typeof settings.preferences,
    currentValue: NotificationFrequency,
  ) => (
    <Select
      value={currentValue}
      onValueChange={(val) =>
        handleFrequencyChange(key, val as NotificationFrequency)
      }
    >
      <SelectTrigger className="w-[140px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {FREQUENCY_OPTIONS.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );

  return (
    <div className="p-8 max-w-5xl space-y-8">
      <div>
        <h3 className="text-xl font-bold text-gray-900">
          Admin Notifications & Alerts
        </h3>
        <p className="text-sm text-gray-500">
          Configure operational and security notifications for administrators.
        </p>
      </div>

      <div className="grid gap-6">
        {/* Recipients Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Notification Recipients</CardTitle>
            <CardDescription>
              Who should receive these alerts? (Your account email is default)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Badge
                variant="secondary"
                className="px-3 py-1 text-sm bg-blue-50 text-blue-700 border-blue-100 mb-1"
              >
                {user.email} (You)
              </Badge>
              {settings.recipient_emails.map((email) => (
                <Badge
                  key={email}
                  variant="outline"
                  className="px-3 py-1 text-sm flex items-center gap-2 mb-1"
                >
                  {email}
                  <X
                    className="h-3 w-3 cursor-pointer hover:text-red-600"
                    onClick={() => handleRemoveEmail(email)}
                  />
                </Badge>
              ))}
            </div>

            <div className="flex gap-2 max-w-md">
              <Input
                placeholder="Add another recipient email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddEmail()}
              />
              <Button onClick={handleAddEmail} variant="outline" size="icon">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Categories */}
        <div className="space-y-6">
          {/* A) Student Activity */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-50 rounded-lg">
                  <BellRing className="h-5 w-5 text-indigo-600" />
                </div>
                <CardTitle className="text-base">
                  Student Activity Alerts
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>New Assignment Submission</Label>
                  <p className="text-sm text-muted-foreground">
                    Detailed alert when a student submits work.
                  </p>
                </div>
                {renderFrequencySelect(
                  "assignment_submission",
                  settings.preferences.assignment_submission,
                )}
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Quiz Submission</Label>
                  <p className="text-sm text-muted-foreground">
                    Alert on quiz completion.
                  </p>
                </div>
                {renderFrequencySelect(
                  "quiz_submission",
                  settings.preferences.quiz_submission,
                )}
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Student Issue Reports</Label>
                  <p className="text-sm text-muted-foreground">
                    If a student reports a technical issue.
                  </p>
                </div>
                {renderFrequencySelect(
                  "student_report",
                  settings.preferences.student_report,
                )}
              </div>
            </CardContent>
          </Card>

          {/* B) Operations */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-50 rounded-lg">
                  <Loader2 className="h-5 w-5 text-amber-600" />
                </div>
                <CardTitle className="text-base">Operations & Data</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Failed Import / Jobs</Label>
                  <p className="text-sm text-muted-foreground">
                    Critical failures in background jobs or imports.
                  </p>
                </div>
                {renderFrequencySelect(
                  "job_failed",
                  settings.preferences.job_failed,
                )}
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Analytics Refresh Failure</Label>
                  <p className="text-sm text-muted-foreground">
                    If nightly data aggregation fails.
                  </p>
                </div>
                {renderFrequencySelect(
                  "analytics_refresh_failed",
                  settings.preferences.analytics_refresh_failed,
                )}
              </div>
            </CardContent>
          </Card>

          {/* D) Security */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-red-50 rounded-lg">
                  <BellRing className="h-5 w-5 text-red-600" />
                </div>
                <CardTitle className="text-base">Security Alerts</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>New Device Login</Label>
                  <p className="text-sm text-muted-foreground">
                    Admin login from unknown IP/Device.
                  </p>
                </div>
                {renderFrequencySelect(
                  "new_device_login",
                  settings.preferences.new_device_login,
                )}
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Failed Login Attempts</Label>
                  <p className="text-sm text-muted-foreground">
                    Multiple failed attempts detected.
                  </p>
                </div>
                {renderFrequencySelect(
                  "failed_login_attempts",
                  settings.preferences.failed_login_attempts,
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex justify-between items-center pt-6 border-t">
        <Button
          variant="outline"
          onClick={sendTestNotification}
          disabled={isSendingTest}
        >
          {isSendingTest ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Send className="mr-2 h-4 w-4" />
          )}
          Send Test Notification
        </Button>

        <Button disabled>
          <Save className="mr-2 h-4 w-4" />
          Auto-Saved
        </Button>
      </div>
    </div>
  );
}

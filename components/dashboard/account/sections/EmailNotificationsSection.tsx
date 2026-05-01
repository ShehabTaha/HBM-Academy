"use client";

import { useState, useRef } from "react";
import { User, UserProfile } from "@/types/account";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, BellRing, Plus, X, Send, Save, CheckCircle2, Trash2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAdminNotificationSettings } from "@/hooks/account/useAdminNotificationSettings";
import { useUserEmails } from "@/hooks/account/useUserEmails";
import { useOTPVerification } from "@/hooks/useOTPVerification";
import { cn } from "@/lib/utils";
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
    isLoading: isSettingsLoading,
    isSendingTest,
    updateSettings,
    sendTestNotification,
  } = useAdminNotificationSettings();

  const {
    emails: userEmails,
    isLoading: isEmailsLoading,
    addEmail,
    makePrimary,
    deleteEmail,
  } = useUserEmails();

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

  const handleAddEmail = async (email: string) => {
    if (!email || !email.includes("@")) return;
    await addEmail(email);
  };

  const handleDeleteEmail = async (id: string, isPrimary: boolean) => {
    if (isPrimary && userEmails.length === 1) {
      toast({ title: "Error", description: "You cannot delete your only email address.", variant: "destructive" });
      return;
    }
    if (confirm("Are you sure you want to delete this email address?")) {
      await deleteEmail(id);
    }
  };

  if (isSettingsLoading || isEmailsLoading) {
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
        {/* Account Emails Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Account Emails</CardTitle>
            <CardDescription>
              Manage your email addresses. Your primary email is used for login and important notifications.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              {userEmails.map((ue) => (
                <div key={ue.id} className={cn(
                  "flex items-center justify-between p-3 rounded-lg border",
                  ue.is_primary ? "border-blue-200 bg-blue-50/50" : "border-gray-200 bg-white"
                )}>
                  <div className="flex flex-col">
                    <span className="font-medium text-sm text-gray-900">{ue.email}</span>
                    <div className="flex items-center gap-2 mt-1">
                      {ue.is_primary ? (
                        <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-100 text-[10px] uppercase font-bold tracking-wider">
                          Primary
                        </Badge>
                      ) : null}
                      {ue.is_verified ? (
                        <span className="text-xs text-green-600 font-medium flex items-center">
                          <CheckCircle2 className="w-3 h-3 mr-1" /> Verified
                        </span>
                      ) : (
                        <span className="text-xs text-amber-600 font-medium">Unverified</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {!ue.is_primary && ue.is_verified && (
                      <Button variant="outline" size="sm" onClick={() => makePrimary(ue.id)}>
                        Make Primary
                      </Button>
                    )}
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-gray-400 hover:text-red-600 hover:bg-red-50"
                      onClick={() => handleDeleteEmail(ue.id, ue.is_primary)}
                      disabled={userEmails.length === 1}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t">
              <h4 className="text-sm font-medium mb-3">Add a new email address</h4>
              <NotificationEmailOTPForm onAdd={handleAddEmail} />
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
          onClick={() => sendTestNotification(userEmails.map(e => e.email))}
          disabled={isSendingTest || userEmails.length === 0}
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

function NotificationEmailOTPForm({ onAdd }: { onAdd: (email: string) => void }) {
  const [newEmail, setNewEmail] = useState("");
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const {
    step,
    digits,
    updateDigit,
    isOTPComplete,
    isLoading,
    error,
    isLocked,
    isExpired,
    sendOTP,
    verifyOTP,
    reset,
  } = useOTPVerification({
    purpose: "notification_add",
    onSuccess: () => {
      onAdd(newEmail);
      reset();
      setNewEmail("");
    },
  });

  const handleDigitKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.key === "Backspace") {
      if (digits[index] === "" && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    }
    if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
    if (e.key === "Enter" && isOTPComplete && !isLocked && !isExpired) {
      verifyOTP();
    }
  };

  const handleDigitChange = (value: string, index: number) => {
    // Handle paste
    if (value.length > 1) {
      const pastedDigits = value.replace(/\D/g, "").slice(0, 6).split("");
      pastedDigits.forEach((d, i) => {
        if (index + i < 6) updateDigit(index + i, d);
      });
      const nextFocus = Math.min(index + pastedDigits.length, 5);
      inputRefs.current[nextFocus]?.focus();
      return;
    }
    updateDigit(index, value);
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  if (step === "otp") {
    return (
      <div className="space-y-4 p-5 bg-gray-50 border border-gray-100 rounded-xl max-w-md">
        <p className="text-sm font-medium text-gray-700">Enter the 6-digit verification code sent to {newEmail}</p>
        <div className="flex gap-2 justify-start">
          {digits.map((digit, i) => (
            <input
              key={i}
              ref={(el) => { inputRefs.current[i] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={digit}
              onChange={(e) => handleDigitChange(e.target.value, i)}
              onKeyDown={(e) => handleDigitKeyDown(e, i)}
              disabled={isLocked || isExpired || isLoading}
              className={cn(
                "w-10 h-12 text-center text-lg font-bold border-2 rounded-lg outline-none transition-all",
                "focus:border-blue-500 focus:ring-2 focus:ring-blue-100",
                digit
                  ? "border-blue-400 bg-blue-50 text-blue-700"
                  : "border-gray-200 bg-white text-gray-900",
                (isLocked || isExpired) &&
                  "opacity-50 cursor-not-allowed border-gray-100 bg-gray-50"
              )}
            />
          ))}
        </div>
        {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
        <div className="flex gap-3 pt-2">
          <Button variant="outline" size="sm" className="flex-1" onClick={() => { reset(); setNewEmail(""); }} disabled={isLoading}>
            Cancel
          </Button>
          <Button size="sm" className="flex-1" onClick={verifyOTP} disabled={!isOTPComplete || isLocked || isExpired || isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Verify & Add
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 max-w-md">
      <div className="flex gap-2">
        <Input
          placeholder="Add another recipient email"
          value={newEmail}
          onChange={(e) => setNewEmail(e.target.value)}
          disabled={isLoading}
          onKeyDown={(e) => e.key === "Enter" && sendOTP(newEmail)}
        />
        <Button onClick={() => sendOTP(newEmail)} variant="outline" size="icon" disabled={isLoading || !newEmail}>
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
        </Button>
      </div>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

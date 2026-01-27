"use client";

import React, { useState } from "react";
import { User } from "@/types/account";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Shield, Key, Loader2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface SecuritySectionProps {
  user: User;
  refresh: () => void;
}

export default function SecuritySection({
  user,
  refresh,
}: SecuritySectionProps) {
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast({
        title: "Error",
        description: "Password must be at least 8 characters long",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/user/password/change", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to change password");
      }

      toast({
        title: "Success",
        description: "Password updated successfully",
      });

      // Reset form
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setShowPasswordForm(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to change password",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h3 className="text-xl font-bold text-gray-900">Security</h3>
        <p className="text-sm text-gray-500">Keep your account safe</p>
      </div>

      <div className="space-y-8">
        {/* Change Password */}
        <div className="p-6 rounded-xl border border-gray-100 hover:border-blue-100 transition-colors">
          <div className="flex items-start justify-between">
            <div className="flex space-x-4">
              <div className="bg-blue-50 p-3 rounded-lg">
                <Key className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h4 className="text-base font-bold text-gray-900">Password</h4>
                <p className="text-sm text-gray-500 mt-1">
                  Change your account password
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => setShowPasswordForm(!showPasswordForm)}
            >
              {showPasswordForm ? "Cancel" : "Change Password"}
            </Button>
          </div>

          {showPasswordForm && (
            <form
              onSubmit={handlePasswordChange}
              className="mt-8 pt-8 border-t border-gray-100 space-y-6 max-w-md"
            >
              <div className="space-y-2">
                <Label htmlFor="current-password">Current Password *</Label>
                <Input
                  type="password"
                  id="current-password"
                  value={passwordData.currentPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      currentPassword: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password *</Label>
                <Input
                  type="password"
                  id="new-password"
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      newPassword: e.target.value,
                    })
                  }
                  minLength={8}
                  required
                />
                <p className="text-xs text-gray-500">Minimum 8 characters</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm New Password *</Label>
                <Input
                  type="password"
                  id="confirm-password"
                  value={passwordData.confirmPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      confirmPassword: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setShowPasswordForm(false);
                    setPasswordData({
                      currentPassword: "",
                      newPassword: "",
                      confirmPassword: "",
                    });
                  }}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Update Password
                </Button>
              </div>
            </form>
          )}
        </div>

        {/* Two-Factor Authentication */}
        <div className="p-6 rounded-xl border border-gray-100 hover:border-blue-100 transition-colors">
          <div className="flex items-start justify-between">
            <div className="flex space-x-4">
              <div className="bg-purple-50 p-3 rounded-lg">
                <Shield className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h4 className="text-base font-bold text-gray-900">
                  Two-Factor Authentication (2FA)
                </h4>
                <p className="text-sm text-gray-500 mt-1">
                  Status: Not enabled
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  Add an extra layer of security to your account.
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              className="border-purple-200 text-purple-700 hover:bg-purple-50"
              disabled
            >
              Coming Soon
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Inline input for the password form
function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="w-full h-10 px-3 rounded-md border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
    />
  );
}

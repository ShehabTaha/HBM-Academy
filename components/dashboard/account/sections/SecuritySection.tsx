"use client";

import React, { useState } from "react";
import { User } from "@/types/account";
import { Button } from "@/components/ui/button";
import { Shield, Key } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import ChangePasswordForm from "../ChangePasswordForm";

interface SecuritySectionProps {
  user: User;
  refresh: () => void;
}

export default function SecuritySection({
  user,
  refresh,
}: SecuritySectionProps) {
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  /**
   * Passed to <ChangePasswordForm> as the `onSubmit` prop.
   * Throws on failure so the form can handle the error state internally.
   */
  const handlePasswordChange = async ({
    currentPassword,
    newPassword,
  }: {
    currentPassword: string;
    newPassword: string;
  }) => {
    const response = await fetch("/api/user/password/change", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    });

    const result = await response.json();

    if (!response.ok) {
      toast({
        title: "Error",
        description: result.error || "Failed to change password",
        variant: "destructive",
      });
      throw new Error(result.error || "Failed to change password");
    }

    toast({
      title: "Password updated",
      description: "Your password has been changed successfully.",
    });

    // Collapse the form after a short delay so the user sees the success banner
    setTimeout(() => {
      setShowPasswordForm(false);
    }, 2000);

    refresh();
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h3 className="text-xl font-bold text-gray-900">Security</h3>
        <p className="text-sm text-gray-500">Keep your account safe</p>
      </div>

      <div className="space-y-8">
        {/* ── Change Password ── */}
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
              onClick={() => setShowPasswordForm((prev) => !prev)}
            >
              {showPasswordForm ? "Cancel" : "Change Password"}
            </Button>
          </div>

          {showPasswordForm && (
            <div className="mt-8 pt-8 border-t border-gray-100">
              <ChangePasswordForm onSubmit={handlePasswordChange} />
            </div>
          )}
        </div>

        {/* ── Two-Factor Authentication ── */}
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

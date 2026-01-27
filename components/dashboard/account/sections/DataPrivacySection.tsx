"use client";

import React, { useState } from "react";
import { User, UserProfile } from "@/types/account";
import { Button } from "@/components/ui/button";
import {
  Download,
  Database,
  Trash2,
  AlertCircle,
  FileJson,
  FileText,
  Loader2,
} from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { toast } from "@/components/ui/use-toast";

interface DataPrivacySectionProps {
  user: User;
  profile: UserProfile;
}

export default function DataPrivacySection({
  user,
  profile,
}: DataPrivacySectionProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeactivating, setIsDeactivating] = useState(false);

  const handleExport = async (format: "json" | "csv") => {
    try {
      setIsExporting(true);
      const response = await fetch(`/api/user/data/export?format=${format}`);

      if (!response.ok) throw new Error("Export failed");

      if (format === "json") {
        const data = await response.json();
        const blob = new Blob([JSON.stringify(data, null, 2)], {
          type: "application/json",
        });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `hbm-academy-data-${user.id}.json`;
        link.click();
      } else {
        const text = await response.text();
        const blob = new Blob([text], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `hbm-academy-data-${user.id}.csv`;
        link.click();
      }

      toast({
        title: "Export Complete",
        description: "Your data has been successfully exported.",
      });
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "Export Failed",
        description: "There was a problem exporting your data.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (
      !confirm(
        "Are you sure you want to permanently delete your account? This action cannot be undone.",
      )
    ) {
      return;
    }

    try {
      setIsDeleting(true);
      const response = await fetch("/api/user/account/delete", {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Delete failed");

      toast({
        title: "Account Deleted",
        description:
          "Your account has been permanently deleted. Redirecting...",
      });

      // Redirect to login or home
      setTimeout(() => {
        window.location.href = "/auth/signin";
      }, 2000);
    } catch (error) {
      console.error("Delete error:", error);
      toast({
        title: "Error",
        description: "Failed to delete account. Please try again.",
        variant: "destructive",
      });
      setIsDeleting(false);
    }
  };

  const handleDeactivate = async () => {
    // Placeholder for now
    toast({
      title: "Coming Soon",
      description: "Account deactivation will be available soon.",
    });
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h3 className="text-xl font-bold text-gray-900">Data & Privacy</h3>
        <p className="text-sm text-gray-500">Manage your data and account</p>
      </div>

      <div className="space-y-8">
        {/* Download Data */}
        <div className="p-6 rounded-xl border border-gray-100 hover:border-blue-100 transition-colors">
          <div className="flex items-start justify-between">
            <div className="flex space-x-4">
              <div className="bg-blue-50 p-3 rounded-lg flex items-center justify-center">
                <Download className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h4 className="text-base font-bold text-gray-900">
                  Download Your Data
                </h4>
                <p className="text-sm text-gray-500 mt-1">
                  Get a copy of all your personal data in a portable format.
                </p>
                <ul className="mt-4 space-y-2">
                  {[
                    "Profile information",
                    "Course enrollments",
                    "Learning progress",
                  ].map((item) => (
                    <li
                      key={item}
                      className="flex items-center text-xs text-gray-400"
                    >
                      <div className="h-1 w-1 rounded-full bg-gray-300 mr-2" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport("json")}
              disabled={isExporting}
            >
              {isExporting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <FileJson className="mr-2 h-4 w-4" />
              )}
              Download as JSON
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport("csv")}
              disabled={isExporting}
            >
              <FileText className="mr-2 h-4 w-4" />
              Download as CSV
            </Button>
          </div>
        </div>

        {/* Learning Data Export */}
        <div className="p-6 rounded-xl border border-gray-100 hover:border-blue-100 transition-colors bg-gray-50/50">
          <div className="flex items-start justify-between">
            <div className="flex space-x-4">
              <div className="bg-green-50 p-3 rounded-lg">
                <Database className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h4 className="text-base font-bold text-gray-900">
                  Export Learning Progress
                </h4>
                <p className="text-sm text-gray-500 mt-1">
                  Get all your course progress, completed lessons, and grades.
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="border-green-200 text-green-700 hover:bg-green-50"
              onClick={() => handleExport("csv")}
              disabled={isExporting}
            >
              {/* We reuse handleExport for now as a placeholder for learning data too, or just alert */}
              Export to CSV
            </Button>
          </div>
        </div>

        <hr className="border-gray-100" />

        {/* Account Deletion Area */}
        <div className="space-y-4">
          <h4 className="text-sm font-bold text-red-600 uppercase tracking-widest">
            Danger Zone
          </h4>

          <div className="space-y-4">
            <div className="p-6 rounded-xl border border-red-100 bg-red-50/30 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h5 className="font-bold text-gray-900">Deactivate Account</h5>
                <p className="text-sm text-gray-500 mt-1">
                  Temporarily hide your profile and unenroll from courses. You
                  can recover it within 30 days.
                </p>
              </div>
              <Button
                variant="outline"
                className="text-red-600 border-red-200 font-semibold hover:bg-red-50"
                onClick={handleDeactivate}
                disabled={isDeactivating}
              >
                Deactivate
              </Button>
            </div>

            <div className="p-6 rounded-xl border border-red-200 bg-red-50 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h5 className="font-bold text-red-900">
                  Permanently Delete Account
                </h5>
                <p className="text-sm text-red-700 mt-1">
                  This action is irreversible. All your data will be permanently
                  wiped from our servers.
                </p>
              </div>
              <Button
                className="bg-red-600 text-white hover:bg-red-700 font-bold"
                onClick={handleDeleteAccount}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="mr-2 h-4 w-4" />
                )}
                Delete Account
              </Button>
            </div>
          </div>

          <Alert className="bg-gray-100 border-gray-200">
            <AlertCircle className="h-4 w-4 text-gray-500" />
            <AlertTitle className="text-gray-900">Important Note</AlertTitle>
            <AlertDescription className="text-gray-600 text-xs">
              HBM Academy complies with GDPR and CCPA. Upon account deletion, we
              retain only the absolute minimum data required for financial
              compliance and legal obligations.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    </div>
  );
}

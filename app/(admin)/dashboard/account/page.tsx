"use client";

import React, { useState } from "react";
import { useUserProfile } from "@/hooks/account/useUserProfile";
import Sidebar from "@/components/dashboard/account/Sidebar";
import ProfileSection from "@/components/dashboard/account/sections/ProfileSection";
import PersonalDetailsSection from "@/components/dashboard/account/sections/PersonalDetailsSection";
import EmailNotificationsSection from "@/components/dashboard/account/sections/EmailNotificationsSection";
import SecuritySection from "@/components/dashboard/account/sections/SecuritySection";
import SessionsSection from "@/components/dashboard/account/sections/SessionsSection";
import DataPrivacySection from "@/components/dashboard/account/sections/DataPrivacySection";
import { AccountSection } from "@/types/account";
import { Loader2 } from "lucide-react";

export default function AccountPage() {
  const { user, profile, loading, refresh } = useUserProfile();
  const [activeSection, setActiveSection] = useState<AccountSection>("profile");

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!user || !profile) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <p className="text-gray-500">Failed to load account information.</p>
      </div>
    );
  }

  const renderSection = () => {
    switch (activeSection) {
      case "profile":
        return <ProfileSection user={user!} refresh={refresh} />;
      case "personal-details":
        return <PersonalDetailsSection profile={profile!} refresh={refresh} />;
      case "email-notifications":
        return (
          <EmailNotificationsSection
            user={user!}
            profile={profile!}
            refresh={refresh}
          />
        );
      case "security":
        return <SecuritySection user={user!} refresh={refresh} />;
      case "sessions":
        return <SessionsSection />;
      case "data-privacy":
        return <DataPrivacySection user={user!} profile={profile!} />;
      default:
        return <ProfileSection user={user!} refresh={refresh} />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="lg:grid lg:grid-cols-12 lg:gap-x-8">
        <Sidebar
          user={user}
          activeSection={activeSection}
          onSectionChange={setActiveSection}
        />

        <div className="lg:col-span-9">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {renderSection()}
          </div>
        </div>
      </div>
    </div>
  );
}

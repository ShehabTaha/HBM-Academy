"use client";

import { usePlatformSettings } from "@/hooks/usePlatformSettings";
import { SettingsTabs } from "@/components/admin/settings/SettingsTabs";
import { GeneralTab } from "@/components/admin/settings/tabs/GeneralTab";
import { PaymentTab } from "@/components/admin/settings/tabs/PaymentTab";
import { EmailTab } from "@/components/admin/settings/tabs/EmailTab";
// import { CourseTab } from "@/components/admin/settings/tabs/CourseTab";
// import { FeaturesTab } from "@/components/admin/settings/tabs/FeaturesTab";
// import { ModerationTab } from "@/components/admin/settings/tabs/ModerationTab";
// import { AdvancedTab } from "@/components/admin/settings/tabs/AdvancedTab";
import { Button } from "@/components/ui/button";
import { Loader2, Save } from "lucide-react";

export default function PlatformSettingsPage() {
  const {
    settings,
    isLoading,
    isSaving,
    activeTab,
    setActiveTab,
    updateSetting,
    saveSettings,
    hasUnsavedChanges,
  } = usePlatformSettings();

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Platform Settings
          </h1>
          <p className="text-muted-foreground">
            Manage your HBM Academy platform configuration.
          </p>
        </div>
        <div>{/* Header Actions if needed */}</div>
      </div>

      {/* Warning/Info Alerts could go here */}

      <div className="relative min-h-[500px]">
        <SettingsTabs activeTab={activeTab} onTabChange={setActiveTab} />

        <div className="pb-24">
          {" "}
          {/* Padding for fixed bottom bar if we chose that, or just spacing */}
          {activeTab === "general" && (
            <GeneralTab settings={settings} updateSetting={updateSetting} />
          )}
          {activeTab === "payment" && (
            <PaymentTab settings={settings} updateSetting={updateSetting} />
          )}
          {activeTab === "email" && (
            <EmailTab settings={settings} updateSetting={updateSetting} />
          )}
          {/* {activeTab === "course" && (
            <CourseTab settings={settings} updateSetting={updateSetting} />
          )} */}
          {/* {activeTab === "feature" && (
            <FeaturesTab settings={settings} updateSetting={updateSetting} />
          )}
          {activeTab === "moderation" && (
            <ModerationTab settings={settings} updateSetting={updateSetting} />
          )}
          {activeTab === "advanced" && (
            <AdvancedTab settings={settings} updateSetting={updateSetting} />
          )} */}
        </div>
      </div>

      {/* Floating Save Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t shadow-lg md:pl-72 z-20">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {hasUnsavedChanges ? (
              <span className="text-amber-600 font-medium">
                ⚠ You have unsaved changes
              </span>
            ) : (
              <span className="text-green-600">All changes saved</span>
            )}
          </div>
          <div className="flex gap-4">
            <Button
              onClick={saveSettings}
              disabled={!hasUnsavedChanges || isSaving}
              className="min-w-[120px]"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" /> Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

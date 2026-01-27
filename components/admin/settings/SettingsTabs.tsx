import { SettingCategory } from "@/types/settings";
import { cn } from "@/lib/utils";
import {
  Settings,
  CreditCard,
  Mail,
  // Zap,
  // ShieldAlert,
  // Server,
} from "lucide-react";

import { LucideIcon } from "lucide-react";

interface SettingsTabsProps {
  activeTab: SettingCategory;
  onTabChange: (tab: SettingCategory) => void;
}

export function SettingsTabs({ activeTab, onTabChange }: SettingsTabsProps) {
  const tabs: { id: SettingCategory; label: string; icon: LucideIcon }[] = [
    { id: "general", label: "General", icon: Settings },
    { id: "payment", label: "Payment", icon: CreditCard },
    { id: "email", label: "Email", icon: Mail },
    // { id: "course", label: "Course", icon: BookOpen },
    // { id: "feature", label: "Features", icon: Zap },
    // { id: "moderation", label: "Moderation", icon: ShieldAlert },
    // { id: "advanced", label: "Advanced", icon: Server },
  ];

  return (
    <div className="sticky top-0 z-10 bg-background border-b mb-6 overflow-x-auto no-scrollbar">
      <div className="flex items-center space-x-1 p-2 min-w-max">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

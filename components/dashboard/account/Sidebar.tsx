"use client";

import React from "react";
import { User, AccountSection } from "@/types/account";
import {
  User as UserIcon,
  FileText,
  Bell,
  Shield,
  Monitor,
  Lock,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface SidebarProps {
  user: User;
  activeSection: AccountSection;
  onSectionChange: (section: AccountSection) => void;
}

const menuItems: {
  id: AccountSection;
  label: string;
  icon: React.ElementType;
}[] = [
  { id: "profile", label: "Profile", icon: UserIcon },
  { id: "personal-details", label: "Personal Details", icon: FileText },
  { id: "email-notifications", label: "Email & Notifications", icon: Bell },
  { id: "security", label: "Security", icon: Shield },
  { id: "sessions", label: "Sessions", icon: Monitor },
  { id: "data-privacy", label: "Data & Privacy", icon: Lock },
];

export default function Sidebar({
  user,
  activeSection,
  onSectionChange,
}: SidebarProps) {
  const router = useRouter();
  return (
    <aside className="lg:col-span-3 mb-8 lg:mb-0">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-8">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="relative h-24 w-24 rounded-full overflow-hidden border-4 border-blue-50 mb-4 bg-gray-100 flex items-center justify-center">
            {user.avatar ? (
              <Image
                src={user.avatar}
                alt={user.name}
                fill
                className="object-cover"
              />
            ) : (
              <UserIcon className="h-12 w-12 text-gray-300" />
            )}
          </div>
          <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
        </div>

        <nav className="space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={cn(
                "w-full flex items-center justify-between px-4 py-3 text-sm font-medium rounded-lg transition-colors group",
                activeSection === item.id
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 hover:bg-blue-50 hover:text-blue-600",
              )}
            >
              <div className="flex items-center">
                <item.icon
                  className={cn(
                    "mr-3 h-5 w-5",
                    activeSection === item.id
                      ? "text-white"
                      : "text-gray-400 group-hover:text-blue-600",
                  )}
                />
                {item.label}
              </div>
              {activeSection === item.id && (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
          ))}

          <button
            onClick={async () => {
              console.log("[Sidebar] Logout button clicked");
              await signOut({ redirect: false });
              console.log("[Sidebar] SignOut completed, now redirecting...");
              router.push("/auth/login");
            }}
            className="w-full flex items-center px-4 py-3 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors mt-6"
          >
            <LogOut className="mr-3 h-5 w-5" />
            Logout
          </button>
        </nav>
      </div>
    </aside>
  );
}

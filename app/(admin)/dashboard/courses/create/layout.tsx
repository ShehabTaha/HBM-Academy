"use client";
import React from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { CourseProvider } from "@/contexts/CourseContext";

const navitems = [
  {
    title: "Curriculum",
    href: "/dashboard/courses/create",
  },
  {
    title: "Content Uploader",
    href: "/dashboard/courses/create/content-uploader",
  },
  {
    title: "Settings",
    href: "/dashboard/courses/create/settings",
  },
  {
    title: "pricing",
    href: "/dashboard/courses/create/pricing",
  },
  {
    title: "Landing page",
    href: "/dashboard/courses/create/landing",
  },
  {
    title: "Publish",
    href: "/dashboard/courses/create/publish",
  },
];
const Navigation = () => {
  const pathname = usePathname();

  return (
    <div className="w-full mt-4">
      <Link
        href="/dashboard/courses"
        className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Courses
      </Link>
      <div className="mb-4">
        <h2 className="text-2xl font-normal">New Course</h2>
      </div>
      <div className="w-full flex flex-wrap gap-3">
        {navitems.map((item) => {
          // Check if current path matches this nav item
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard/courses/create" &&
              pathname?.startsWith(item.href));

          return (
            <Link
              key={item.title}
              href={item.href}
              className={`px-4 py-2 rounded-md transition-colors text-sm font-medium ${
                isActive
                  ? "bg-main-white text-primary-blue"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              {item.title}
            </Link>
          );
        })}
      </div>
      <hr className=" border-t border-gray-400 w-full" />
    </div>
  );
};
const layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <CourseProvider>
      <Navigation />
      <div className="w-full h-full">{children}</div>
    </CourseProvider>
  );
};

export default layout;

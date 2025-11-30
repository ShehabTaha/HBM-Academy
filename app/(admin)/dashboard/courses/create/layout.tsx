"use client";
import React from "react";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft } from "lucide-react";

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
      <NavigationMenu className="w-full">
        <NavigationMenuList className="gap-3 flex-wrap">
          {navitems.map((item) => (
            <NavigationMenuItem key={item.title}>
              <NavigationMenuLink asChild>
                <Link
                  href={item.href}
                  className={`px-4 py-2 rounded-md transition-colors  ${
                    pathname === item.href
                      ? "bg-main-primary-blue text-primary-blue"
                      : "hover:bg-gray-100"
                  }`}
                >
                  {item.title}
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
          ))}
        </NavigationMenuList>
      </NavigationMenu>
      <hr className=" border-t border-gray-300 w-full" />
    </div>
  );
};
const layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <Navigation />
      <div className="w-full h-full">{children}</div>
    </>
  );
};

export default layout;

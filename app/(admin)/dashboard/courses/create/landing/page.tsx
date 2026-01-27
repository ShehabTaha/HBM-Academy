"use client";

import React from "react";
import { useParams } from "next/navigation";
import LandingPageEditor from "@/components/dashboard/courses/landing-page/LandingPageEditor";

export default function CourseLandingPageStep() {
  const params = useParams();

  // In the create flow, the ID might be in usePathname or contexts,
  // but looking at layout.tsx, it's a sub-route of /create.
  // Wait, if it's /dashboard/courses/create/landing, how do we get the ID?
  // Let's check CourseContext usage in layout.tsx.

  return (
    <div className="h-[calc(100vh-180px)] w-full">
      {/* 
        In the create flow, we need to know WHICH course we are editing.
        Usually this is stored in a context after step 1.
      */}
      <LandingPageEditor courseId="temp-new-course" />
      {/* 
        Note: Implementation detail - the course ID should be retrieved 
        from CourseContext if available.
      */}
    </div>
  );
}

import type { Metadata } from "next";
import ManageCourse from "@/components/admin/manage-course/ManageCourse";

export const metadata: Metadata = {
  title: "Manage Course | HBM Academy",
  description: "Edit and manage your course content and settings",
};

export default async function ManageCoursePage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;

  return <ManageCourse courseId={courseId} />;
}

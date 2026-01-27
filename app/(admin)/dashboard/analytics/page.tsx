import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { AnalyticsDashboardClient } from "./_components/AnalyticsDashboardClient";

export const metadata = {
  title: "Analytics Dashboard | HBM Academy",
  description: "Comprehensive analytics for student progress and performance",
};

// Custom user interface to avoid 'any'
interface CustomUser {
  role?: string;
  id?: string;
  name?: string;
  email?: string;
}

export default async function AnalyticsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/signin");
  }

  // Ensure admin access
  const user = session.user as CustomUser;
  if (user.role !== "admin") {
    redirect("/dashboard");
  }

  return (
    <div className="p-6 space-y-6 w-full max-w-[1600px] mx-auto">
      <AnalyticsDashboardClient />
    </div>
  );
}

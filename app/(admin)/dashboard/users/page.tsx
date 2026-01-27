import { redirect } from "next/navigation";
import { UsersPageContent } from "@/components/admin/users/UsersPageContent";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

export default async function UsersPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/auth/login");
  }

  // Check Admin Role
  if ((session.user as any).role !== "admin") {
    redirect("/dashboard");
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <UsersPageContent />
    </div>
  );
}

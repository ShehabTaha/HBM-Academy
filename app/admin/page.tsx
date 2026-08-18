import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { isAllowedAdminEmail } from "@/lib/security/admin-allowlist";

export default async function AdminRootPage() {
  const session = await getServerSession(authOptions);

  if (
    session?.user &&
    (session.user as { role?: string }).role === "admin" &&
    isAllowedAdminEmail(session.user.email)
  ) {
    redirect("/dashboard/home");
  }

  redirect("/admin/login");
}

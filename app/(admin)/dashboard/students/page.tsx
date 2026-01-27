import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { StudentsPageContent } from "@/components/admin/users/StudentsPageContent";

export default async function StudentsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/signin"); // Adjust login path
  }

  // Check Admin Role
  const { data: adminProfile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!adminProfile || (adminProfile as { role: string }).role !== "admin") {
    redirect("/dashboard"); // Redirect non-admins
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <StudentsPageContent />
    </div>
  );
}

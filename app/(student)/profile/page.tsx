import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BillingPortalButton } from "@/components/student/BillingPortalButton";
import { ProfileForm } from "@/components/student/ProfileForm";
import { getCurrentStudent } from "@/lib/services/student.service";

export default async function ProfilePage() {
  const student = await getCurrentStudent();
  if (!student) redirect("/auth/login");

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Profile</h1>
        <p className="mt-2 text-muted-foreground">
          Keep your student details and learning preferences up to date.
        </p>
      </div>
      <Card className="rounded-lg bg-white">
        <CardHeader>
          <CardTitle>Personal info</CardTitle>
        </CardHeader>
        <CardContent>
          <ProfileForm />
        </CardContent>
      </Card>
      <Card className="rounded-lg bg-white">
        <CardHeader>
          <CardTitle>Billing</CardTitle>
        </CardHeader>
        <CardContent>
          <BillingPortalButton />
        </CardContent>
      </Card>
    </div>
  );
}

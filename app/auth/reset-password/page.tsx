import { Metadata } from "next";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

export const metadata: Metadata = {
  title: "Set New Password | HBM Academy",
};

export default function ResetPasswordPage() {
  return (
    <>
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Set new password</h1>
        <p className="text-sm text-muted-foreground">
          Choose a new password for your student account.
        </p>
      </div>
      <div className="mt-6">
        <ResetPasswordForm />
      </div>
    </>
  );
}

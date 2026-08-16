import { Metadata } from "next";
import Link from "next/link";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Forgot Password | HBM Academy",
};

export default function ForgotPasswordPage() {
  return (
    <>
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Reset password</h1>
        <p className="text-sm text-muted-foreground">
          Enter your student email and we will send a reset link.
        </p>
      </div>
      <div className="mt-6">
        <ForgotPasswordForm />
      </div>
      <p className="mt-6 text-center text-sm">
        <Link href="/auth/login" className="text-primary hover:underline">
          Back to sign in
        </Link>
      </p>
    </>
  );
}

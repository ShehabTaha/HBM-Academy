import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { RegisterForm } from "@/components/auth/RegisterForm";

export const metadata: Metadata = {
  title: "Create Account | HBM Academy",
  description: "Create your HBM Academy student account",
};

export default function RegisterPage() {
  return (
    <>
      <div className="flex flex-col space-y-2 text-center">
        <div className="mb-4 flex justify-center">
          <Link href="/" className="flex items-center space-x-2 text-xl font-bold">
            <Image src="/logo.svg" alt="HBM Academy" width={40} height={40} />
            <span>HBM Academy</span>
          </Link>
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">Create account</h1>
        <p className="text-sm text-muted-foreground">
          Start your hospitality and business management learning path.
        </p>
      </div>

      <div className="mt-6">
        <RegisterForm />
      </div>
    </>
  );
}

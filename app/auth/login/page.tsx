import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Login | HBM Academy",
  description: "Sign in to your HBM Academy account",
};

export default function LoginPage() {
  return (
    <>
      <div className="flex flex-col space-y-2 text-center">
        <div className="flex justify-center mb-4">
          {/* Logo Placeholder */}
          <Link
            href="/"
            className="flex items-center space-x-2 font-bold text-xl"
          >
            <div className="relative h-10 w-10">
              <Image
                src="/logo.svg"
                alt="HBM Academy Logo"
                fill
                className="object-contain"
              />
            </div>
            <span>HBM Academy</span>
          </Link>
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">Welcome Back</h1>
        <p className="text-sm text-muted-foreground">
          Sign in to access your dashboard and courses
        </p>
      </div>

      <div className="mt-6">
        <LoginForm />
      </div>

      <p className="px-8 text-center text-sm text-muted-foreground mt-8">
        By clicking continue, you agree to our{" "}
        <Link
          href="/terms"
          className="underline underline-offset-4 hover:text-primary"
        >
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link
          href="/privacy"
          className="underline underline-offset-4 hover:text-primary"
        >
          Privacy Policy
        </Link>
        .
      </p>
    </>
  );
}

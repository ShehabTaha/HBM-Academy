"use client";

import React, { useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { EmailInput } from "@/components/auth/EmailInput";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { SignInButton } from "@/components/auth/SignInButton";
import { ErrorDisplay } from "@/components/auth/ErrorDisplay";

function getSafeAdminDestination(callbackUrl: string | null) {
  if (
    callbackUrl &&
    callbackUrl.startsWith("/dashboard/") &&
    !callbackUrl.includes("//") &&
    !callbackUrl.includes(":")
  ) {
    return callbackUrl;
  }
  return "/dashboard/home";
}

export function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const errorParam = searchParams.get("error");
    if (!errorParam) return;

    if (errorParam === "CredentialsSignin") {
      setError("Invalid administrator email or password.");
    } else if (errorParam === "AccessDenied") {
      setError("This account is not authorized for the admin portal.");
    } else {
      setError("Administrator sign in failed. Please try again.");
    }
  }, [searchParams]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    const result = await signIn("credentials", {
      redirect: false,
      email,
      password,
      callbackUrl: getSafeAdminDestination(searchParams.get("callbackUrl")),
    });

    setIsLoading(false);

    if (result?.error) {
      setError(
        result.error === "AccessDenied"
          ? "This account is not authorized for the admin portal."
          : "Invalid administrator email or password.",
      );
      return;
    }

    const targetUrl = getSafeAdminDestination(searchParams.get("callbackUrl"));
    window.location.href = targetUrl;
  }

  return (
    <div className="w-full space-y-6">
      <ErrorDisplay error={error} onDismiss={() => setError(null)} />

      <form onSubmit={handleSubmit} className="space-y-4">
        <EmailInput
          label="Administrator Email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          disabled={isLoading}
          autoComplete="email"
          required
        />
        <PasswordInput
          label="Administrator Password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          disabled={isLoading}
          autoComplete="current-password"
          required
        />
        <SignInButton isLoading={isLoading}>Enter Admin Portal</SignInButton>
      </form>
    </div>
  );
}

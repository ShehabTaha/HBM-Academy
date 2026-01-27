"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { EmailInput } from "./EmailInput";
import { PasswordInput } from "./PasswordInput";
import { RememberMe } from "./RememberMe";
import { SignInButton } from "./SignInButton";
import { ErrorDisplay } from "./ErrorDisplay";
import { ForgotPasswordModal } from "./ForgotPasswordModal";

export function LoginForm() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);

  // Handle errors from URL (NextAuth redirects)
  useEffect(() => {
    const errorParam = searchParams.get("error");
    if (errorParam) {
      if (errorParam === "CredentialsSignin") {
        setError("Invalid email or password.");
      } else if (errorParam === "OAuthAccountNotLinked") {
        setError("Email already in use with a different provider.");
      } else {
        setError("Authentication failed. Please try again.");
      }
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        setIsLoading(false);
        // Map common errors
        if (result.error === "CredentialsSignin") {
          setError("Invalid email or password.");
        } else if (result.error.includes("Email not verified")) {
          setError("Please verify your email address to log in.");
        } else {
          // If error message came from backend throw, display it if safe
          // Basic security practice: don't reveal too much, but here we trust our backend responses to be sanitized or generic enough
          setError(result.error);
        }
      } else {
        // Successful login
        router.push("/dashboard/home");
        router.refresh();
      }
    } catch (err) {
      setIsLoading(false);
      setError("An unexpected error occurred. Please try again.");
      console.error(err);
    }
  };

  return (
    <div className="w-full max-w-md space-y-6">
      <ErrorDisplay error={error} onDismiss={() => setError(null)} />

      <form onSubmit={handleSubmit} className="space-y-4">
        <EmailInput
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
          required // Browser validation as fallback
        />
        <PasswordInput
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isLoading}
          required
          showForgotPassword={true}
          onForgotPassword={() => setIsForgotPasswordOpen(true)}
        />
        <RememberMe checked={rememberMe} onCheckedChange={setRememberMe} />

        <SignInButton isLoading={isLoading} />
      </form>

      <ForgotPasswordModal
        isOpen={isForgotPasswordOpen}
        onClose={() => setIsForgotPasswordOpen(false)}
      />
    </div>
  );
}

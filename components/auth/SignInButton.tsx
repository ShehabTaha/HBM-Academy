"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface SignInButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
}

export function SignInButton({
  isLoading,
  className,
  children,
  ...props
}: SignInButtonProps) {
  return (
    <Button
      className={`w-full ${className}`}
      disabled={isLoading || props.disabled}
      type="submit"
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Signing in...
        </>
      ) : (
        children || "Sign In"
      )}
    </Button>
  );
}

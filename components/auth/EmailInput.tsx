"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface EmailInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
}

export const EmailInput = React.forwardRef<HTMLInputElement, EmailInputProps>(
  ({ className, error, label = "Email Address", ...props }, ref) => {
    return (
      <div className="space-y-2">
        <Label
          htmlFor="email"
          className={cn(error && "text-destructive", "text-sm font-medium")}
        >
          {label} <span className="text-destructive">*</span>
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="you@example.com"
          className={cn(
            error ? "border-destructive focus-visible:ring-destructive" : "",
            className,
          )}
          ref={ref}
          {...props}
        />
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
    );
  },
);
EmailInput.displayName = "EmailInput";

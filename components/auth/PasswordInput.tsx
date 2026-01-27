"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
  showForgotPassword?: boolean;
  onForgotPassword?: () => void;
}

export const PasswordInput = React.forwardRef<
  HTMLInputElement,
  PasswordInputProps
>(
  (
    {
      className,
      error,
      label = "Password",
      showForgotPassword,
      onForgotPassword,
      ...props
    },
    ref,
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const [capsLockOn, setCapsLockOn] = useState(false);

    const togglePasswordVisibility = () => {
      setShowPassword(!showPassword);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.getModifierState("CapsLock")) {
        setCapsLockOn(true);
      } else {
        setCapsLockOn(false);
      }
      props.onKeyDown?.(e);
    };

    const handleKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.getModifierState("CapsLock")) {
        setCapsLockOn(true);
      } else {
        setCapsLockOn(false);
      }
      props.onKeyUp?.(e);
    };

    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label
            htmlFor="password"
            className={cn(error && "text-destructive", "text-sm font-medium")}
          >
            {label} <span className="text-destructive">*</span>
          </Label>
          {showForgotPassword && (
            <Button
              variant="link"
              className="px-0 h-auto font-normal text-xs text-muted-foreground hover:text-primary"
              onClick={onForgotPassword}
              type="button"
            >
              Forgot Password?
            </Button>
          )}
        </div>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            className={cn(
              "pr-10",
              error ? "border-destructive focus-visible:ring-destructive" : "",
              className,
            )}
            ref={ref}
            onKeyDown={handleKeyDown}
            onKeyUp={handleKeyUp}
            {...props}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
            onClick={togglePasswordVisibility}
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4 text-muted-foreground" />
            ) : (
              <Eye className="h-4 w-4 text-muted-foreground" />
            )}
            <span className="sr-only">
              {showPassword ? "Hide password" : "Show password"}
            </span>
          </Button>
        </div>
        {capsLockOn && !error && (
          <p className="text-xs text-yellow-600 flex items-center mt-1">
            ⚠️ Caps Lock is on
          </p>
        )}
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
    );
  },
);
PasswordInput.displayName = "PasswordInput";

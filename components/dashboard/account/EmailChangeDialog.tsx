"use client";

import React, { useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Mail, ShieldCheck, Clock } from "lucide-react";
import { User } from "@/types/account";
import { useOTPVerification } from "@/hooks/useOTPVerification";
import { cn } from "@/lib/utils";

interface EmailChangeDialogProps {
  user: User;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function EmailChangeDialog({
  user,
  isOpen,
  onOpenChange,
  onSuccess,
}: EmailChangeDialogProps) {
  const [newEmail, setNewEmail] = React.useState("");
  const [emailError, setEmailError] = React.useState<string | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const {
    step,
    digits,
    updateDigit,
    isOTPComplete,
    isLoading,
    error,
    isLocked,
    isExpired,
    timeFormatted,
    resendCooldown,
    maskedEmail,
    sendOTP,
    resendOTP,
    verifyOTP,
    reset,
  } = useOTPVerification({
    purpose: "primary_change",
    onSuccess: () => {
      onOpenChange(false);
      onSuccess();
    },
  });

  // Auto-focus first OTP digit when step changes
  useEffect(() => {
    if (step === "otp") {
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    }
  }, [step]);

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => {
      reset();
      setNewEmail("");
      setEmailError(null);
    }, 300);
  };

  const handleSendCode = async () => {
    setEmailError(null);
    if (!newEmail) {
      setEmailError("Email is required.");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      setEmailError("Please enter a valid email address.");
      return;
    }
    if (newEmail.toLowerCase() === user.email.toLowerCase()) {
      setEmailError("New email must be different from your current one.");
      return;
    }
    await sendOTP(newEmail);
  };

  const handleDigitKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.key === "Backspace") {
      if (digits[index] === "" && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    }
    if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
    if (e.key === "Enter" && isOTPComplete && !isLocked && !isExpired) {
      verifyOTP();
    }
  };

  const handleDigitChange = (value: string, index: number) => {
    // Handle paste
    if (value.length > 1) {
      const pastedDigits = value.replace(/\D/g, "").slice(0, 6).split("");
      pastedDigits.forEach((d, i) => {
        if (index + i < 6) updateDigit(index + i, d);
      });
      const nextFocus = Math.min(index + pastedDigits.length, 5);
      inputRefs.current[nextFocus]?.focus();
      return;
    }
    updateDigit(index, value);
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
              <Mail className="h-5 w-5 text-blue-600" />
            </div>
            <DialogTitle>Change Email Address</DialogTitle>
          </div>
          <DialogDescription>
            {step === "email"
              ? "Enter your new email address. We'll send a verification code to confirm ownership."
              : `We sent a 6-digit code to ${maskedEmail}. Enter it below within 10 minutes.`}
          </DialogDescription>
        </DialogHeader>

        {step === "email" ? (
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="current-email">Current Email</Label>
              <Input
                id="current-email"
                value={user.email}
                disabled
                className="bg-gray-50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-email">New Email Address</Label>
              <Input
                id="new-email"
                type="email"
                value={newEmail}
                onChange={(e) => {
                  setNewEmail(e.target.value);
                  setEmailError(null);
                }}
                placeholder="Enter new email address"
                disabled={isLoading}
                onKeyDown={(e) => e.key === "Enter" && handleSendCode()}
              />
              {emailError && (
                <p className="text-xs text-red-500">{emailError}</p>
              )}
              {error && <p className="text-xs text-red-500">{error}</p>}
            </div>
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={handleSendCode}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Mail className="mr-2 h-4 w-4" />
                )}
                Send Verification Code
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-5 py-2">
            {/* Countdown */}
            <div className="flex items-center justify-between text-sm">
              <div
                className={cn(
                  "flex items-center gap-1.5 font-medium",
                  isExpired ? "text-red-500" : "text-gray-500"
                )}
              >
                <Clock className="h-4 w-4" />
                {isExpired ? "Code expired" : `Expires in ${timeFormatted}`}
              </div>
            </div>

            {/* OTP Digit Boxes */}
            <div className="flex gap-2 justify-center">
              {digits.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    inputRefs.current[index] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={digit}
                  onChange={(e) => handleDigitChange(e.target.value, index)}
                  onKeyDown={(e) => handleDigitKeyDown(e, index)}
                  disabled={isLocked || isExpired || isLoading}
                  className={cn(
                    "w-11 h-14 text-center text-xl font-bold border-2 rounded-xl outline-none transition-all",
                    "focus:border-blue-500 focus:ring-2 focus:ring-blue-100",
                    digit
                      ? "border-blue-400 bg-blue-50 text-blue-700"
                      : "border-gray-200 bg-white text-gray-900",
                    (isLocked || isExpired) &&
                      "opacity-50 cursor-not-allowed border-gray-100 bg-gray-50"
                  )}
                />
              ))}
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-lg bg-red-50 border border-red-100 px-4 py-2 text-sm text-red-600">
                {error}
              </div>
            )}

            {/* Resend */}
            <div className="text-center text-sm text-gray-500">
              Didn&apos;t receive a code?{" "}
              <button
                type="button"
                onClick={resendOTP}
                disabled={resendCooldown > 0 || isLoading}
                className={cn(
                  "font-medium transition-colors",
                  resendCooldown > 0 || isLoading
                    ? "text-gray-300 cursor-not-allowed"
                    : "text-blue-600 hover:text-blue-700 underline underline-offset-2"
                )}
              >
                {resendCooldown > 0
                  ? `Resend in ${resendCooldown}s`
                  : "Resend code"}
              </button>
            </div>

            <div className="flex gap-3 pt-1">
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={verifyOTP}
                disabled={
                  !isOTPComplete || isLocked || isExpired || isLoading
                }
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <ShieldCheck className="mr-2 h-4 w-4" />
                )}
                Verify
              </Button>
            </div>

            <button
              type="button"
              onClick={() => {
                reset();
                setNewEmail("");
              }}
              className="w-full text-xs text-center text-gray-400 hover:text-gray-600 underline underline-offset-2 mt-1"
            >
              Use a different email
            </button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

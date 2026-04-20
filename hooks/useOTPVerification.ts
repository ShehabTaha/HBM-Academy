import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "@/components/ui/use-toast";

export type OTPPurpose = "primary_change" | "notification_add";

interface UseOTPVerificationOptions {
  purpose: OTPPurpose;
  onSuccess?: () => void;
}

/** Masks an email address: john.doe@example.com → jo***@example.com */
export function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!local || !domain) return email;
  const visible = local.slice(0, 2);
  return `${visible}***@${domain}`;
}

export function useOTPVerification({
  purpose,
  onSuccess,
}: UseOTPVerificationOptions) {
  const [step, setStep] = useState<"email" | "otp">("email");
  const [email, setEmail] = useState("");
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attemptsRemaining, setAttemptsRemaining] = useState(3);
  const [isLocked, setIsLocked] = useState(false);

  // 10-minute OTP countdown
  const [timeRemaining, setTimeRemaining] = useState(0);
  // 60-second resend cooldown
  const [resendCooldown, setResendCooldown] = useState(0);

  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startCountdown = useCallback(() => {
    setTimeRemaining(10 * 60);
    if (countdownRef.current) clearInterval(countdownRef.current);
    countdownRef.current = setInterval(() => {
      setTimeRemaining((t) => {
        if (t <= 1) {
          clearInterval(countdownRef.current!);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  }, []);

  const startResendCooldown = useCallback(() => {
    setResendCooldown(60);
    if (cooldownRef.current) clearInterval(cooldownRef.current);
    cooldownRef.current = setInterval(() => {
      setResendCooldown((c) => {
        if (c <= 1) {
          clearInterval(cooldownRef.current!);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
  }, []);

  useEffect(() => {
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
      if (cooldownRef.current) clearInterval(cooldownRef.current);
    };
  }, []);

  const sendOTP = useCallback(
    async (targetEmail: string) => {
      setError(null);
      setIsLoading(true);
      try {
        const res = await fetch("/api/user/email/send-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: targetEmail, purpose }),
        });
        const data = await res.json();

        if (!res.ok) {
          setError(data.error ?? "Failed to send code.");
          return false;
        }

        setEmail(targetEmail);
        setDigits(["", "", "", "", "", ""]);
        setAttemptsRemaining(3);
        setIsLocked(false);
        setStep("otp");
        startCountdown();
        startResendCooldown();
        return true;
      } catch {
        setError("Network error. Please try again.");
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [purpose, startCountdown, startResendCooldown]
  );

  const resendOTP = useCallback(async () => {
    if (resendCooldown > 0) return;
    const ok = await sendOTP(email);
    if (ok) {
      setIsLocked(false);
      setAttemptsRemaining(3);
    }
  }, [email, resendCooldown, sendOTP]);

  const verifyOTP = useCallback(async () => {
    const otp = digits.join("");
    if (otp.length !== 6) return;
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/user/email/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, purpose }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Verification failed.");
        if (data.locked) setIsLocked(true);
        if (typeof data.attemptsRemaining === "number") {
          setAttemptsRemaining(data.attemptsRemaining);
        }
        return;
      }

      // Success
      toast({ title: "Email verified successfully." });
      onSuccess?.();
      reset();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [digits, email, purpose, onSuccess]);

  const reset = useCallback(() => {
    setStep("email");
    setEmail("");
    setDigits(["", "", "", "", "", ""]);
    setError(null);
    setIsLoading(false);
    setAttemptsRemaining(3);
    setIsLocked(false);
    setTimeRemaining(0);
    setResendCooldown(0);
    if (countdownRef.current) clearInterval(countdownRef.current);
    if (cooldownRef.current) clearInterval(cooldownRef.current);
  }, []);

  const updateDigit = useCallback((index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;
    setDigits((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const otp = digits.join("");
  const isOTPComplete = otp.length === 6;
  const isExpired = step === "otp" && timeRemaining === 0;

  return {
    step,
    email,
    digits,
    updateDigit,
    otp,
    isOTPComplete,
    isLoading,
    error,
    attemptsRemaining,
    isLocked,
    isExpired,
    timeRemaining,
    timeFormatted: formatTime(timeRemaining),
    resendCooldown,
    maskedEmail: email ? maskEmail(email) : "",
    sendOTP,
    resendOTP,
    verifyOTP,
    reset,
  };
}

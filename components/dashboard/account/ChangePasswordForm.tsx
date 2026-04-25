"use client";

import React, { useState, useCallback } from "react";
import { Eye, EyeOff, Check, X, Loader2, ShieldCheck } from "lucide-react";

// ─── Types ──────────────────────────────────────────────────────────────────

interface ChangePasswordFormProps {
  /** Async handler called on valid submit. Receives current & new password. */
  onSubmit: (data: {
    currentPassword: string;
    newPassword: string;
  }) => Promise<void>;
}

// ─── Password requirement rules ──────────────────────────────────────────────

const REQUIREMENTS = [
  {
    id: "minLength",
    label: "At least 8 characters",
    test: (pw: string) => pw.length >= 8,
  },
  {
    id: "uppercase",
    label: "At least one uppercase letter (A–Z)",
    test: (pw: string) => /[A-Z]/.test(pw),
  },
  {
    id: "lowercase",
    label: "At least one lowercase letter (a–z)",
    test: (pw: string) => /[a-z]/.test(pw),
  },
  {
    id: "number",
    label: "At least one number (0–9)",
    test: (pw: string) => /\d/.test(pw),
  },
  {
    id: "special",
    label: "At least one special character (!@#$%^&*...)",
    test: (pw: string) => /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/.test(pw),
  },
] as const;

// ─── Strength config ─────────────────────────────────────────────────────────

function getStrength(metCount: number): {
  segments: number;
  color: string;
  label: string;
  labelColor: string;
} {
  if (metCount === 0) {
    return { segments: 0, color: "bg-gray-200", label: "", labelColor: "text-gray-400" };
  }
  if (metCount === 1) {
    return { segments: 1, color: "bg-red-500", label: "Weak", labelColor: "text-red-600" };
  }
  if (metCount === 2) {
    return { segments: 2, color: "bg-orange-500", label: "Fair", labelColor: "text-orange-600" };
  }
  if (metCount <= 4) {
    return { segments: 3, color: "bg-yellow-500", label: "Good", labelColor: "text-yellow-600" };
  }
  return { segments: 4, color: "bg-green-500", label: "Strong", labelColor: "text-green-600" };
}

// ─── Sub-components ──────────────────────────────────────────────────────────

/** A password input with an integrated show/hide toggle */
function PasswordInput({
  id,
  label,
  value,
  onChange,
  placeholder,
  autoComplete,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoComplete?: string;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={visible ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className="w-full h-11 px-4 pr-11 rounded-lg border border-gray-200 bg-white text-sm text-gray-900 placeholder:text-gray-400
            focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500
            transition-all duration-200"
        />
        <button
          type="button"
          aria-label={visible ? "Hide password" : "Show password"}
          onClick={() => setVisible((v) => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-150"
        >
          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </div>
  );
}

/** A single requirement row in the live checklist */
function RequirementRow({ met, label }: { met: boolean; label: string }) {
  return (
    <li className="flex items-center gap-2">
      <span
        className={`flex items-center justify-center w-4 h-4 rounded-full transition-all duration-300 ${
          met ? "bg-green-100 text-green-600" : "bg-red-100 text-red-500"
        }`}
      >
        {met ? <Check size={10} strokeWidth={3} /> : <X size={10} strokeWidth={3} />}
      </span>
      <span
        className={`text-xs transition-colors duration-300 ${
          met ? "text-green-700" : "text-red-600"
        }`}
      >
        {label}
      </span>
    </li>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function ChangePasswordForm({ onSubmit }: ChangePasswordFormProps) {
  // ── Form state ──
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // ── Submission state ──
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // ── Derived checks ──
  // Which requirements the new password currently satisfies
  const requirementsMet = REQUIREMENTS.map((r) => r.test(newPassword));
  const metCount = requirementsMet.filter(Boolean).length;
  const allRequirementsMet = metCount === REQUIREMENTS.length;

  // Password match state
  const passwordsMatch = newPassword === confirmPassword;
  const showMatchIndicator = confirmPassword.length > 0;

  // Submit is only enabled when all rules + match are satisfied
  const canSubmit = allRequirementsMet && passwordsMatch && currentPassword.length > 0;

  // Strength bar config
  const strength = getStrength(newPassword.length > 0 ? metCount : 0);

  // ── Handlers ──
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!canSubmit || isSubmitting) return;

      setIsSubmitting(true);
      try {
        await onSubmit({ currentPassword, newPassword });
        setIsSuccess(true);
        // Reset fields after success
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        // Auto-dismiss success message after 4 s
        setTimeout(() => setIsSuccess(false), 4000);
      } catch {
        // Parent is responsible for surfacing errors (e.g. toast)
      } finally {
        setIsSubmitting(false);
      }
    },
    [canSubmit, isSubmitting, onSubmit, currentPassword, newPassword]
  );

  // ── Render ──
  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="w-full max-w-md space-y-6"
    >
      {/* ── Current Password ── */}
      <PasswordInput
        id="current-password"
        label="Current Password"
        value={currentPassword}
        onChange={setCurrentPassword}
        placeholder="Enter current password"
        autoComplete="current-password"
      />

      {/* ── New Password + Checklist + Strength ── */}
      <div className="space-y-3">
        <PasswordInput
          id="new-password"
          label="New Password"
          value={newPassword}
          onChange={setNewPassword}
          placeholder="Enter new password"
          autoComplete="new-password"
        />

        {/* Live requirements checklist — always visible once user focuses */}
        <div className="rounded-lg border border-gray-100 bg-gray-50 px-4 py-3">
          <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
            Password requirements
          </p>
          <ul className="space-y-1.5">
            {REQUIREMENTS.map((req, i) => (
              <RequirementRow
                key={req.id}
                met={requirementsMet[i]}
                label={req.label}
              />
            ))}
          </ul>
        </div>

        {/* Strength bar */}
        {newPassword.length > 0 && (
          <div className="space-y-1.5">
            {/* 4-segment bar */}
            <div className="flex gap-1.5">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 flex-1 rounded-full transition-all duration-400 ${
                    i < strength.segments ? strength.color : "bg-gray-200"
                  }`}
                />
              ))}
            </div>
            {/* Label */}
            {strength.label && (
              <p className={`text-xs font-semibold ${strength.labelColor} transition-colors duration-300`}>
                {strength.label}
              </p>
            )}
          </div>
        )}
      </div>

      {/* ── Confirm Password + Match Indicator ── */}
      <div className="space-y-2">
        <PasswordInput
          id="confirm-password"
          label="Confirm New Password"
          value={confirmPassword}
          onChange={setConfirmPassword}
          placeholder="Re-enter new password"
          autoComplete="new-password"
        />

        {/* Real-time match indicator */}
        {showMatchIndicator && (
          <div
            className={`flex items-center gap-1.5 text-xs font-medium transition-all duration-300 ${
              passwordsMatch ? "text-green-600" : "text-red-600"
            }`}
          >
            <span
              className={`flex items-center justify-center w-4 h-4 rounded-full ${
                passwordsMatch ? "bg-green-100" : "bg-red-100"
              }`}
            >
              {passwordsMatch ? (
                <Check size={10} strokeWidth={3} />
              ) : (
                <X size={10} strokeWidth={3} />
              )}
            </span>
            {passwordsMatch ? "Passwords match" : "Passwords do not match"}
          </div>
        )}
      </div>

      {/* ── Success banner ── */}
      {isSuccess && (
        <div className="flex items-center gap-2.5 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 animate-in fade-in duration-300">
          <ShieldCheck size={16} className="shrink-0 text-green-600" />
          <span className="font-medium">Password updated successfully!</span>
        </div>
      )}

      {/* ── Submit button ── */}
      <button
        type="submit"
        disabled={!canSubmit || isSubmitting}
        className={`w-full h-11 rounded-lg text-sm font-semibold flex items-center justify-center gap-2
          transition-all duration-200
          ${
            canSubmit && !isSubmitting
              ? "bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white shadow-sm cursor-pointer"
              : "bg-gray-100 text-gray-400 cursor-not-allowed"
          }`}
      >
        {isSubmitting ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Updating password…
          </>
        ) : (
          "Update Password"
        )}
      </button>
    </form>
  );
}

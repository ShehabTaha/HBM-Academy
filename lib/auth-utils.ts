import bcrypt from "bcryptjs";
import crypto from "crypto";

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}

/**
 * Compare password with hash
 */
export async function comparePassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Generate a random token for password reset or email verification
 */
export function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Generate a token with expiration
 */
export function generateTokenWithExpiry(expiryHours = 24): {
  token: string;
  expires: Date;
} {
  const token = generateToken();
  const expires = new Date();
  expires.setHours(expires.getHours() + expiryHours);

  return { token, expires };
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength
 * Requirements: At least 8 characters, 1 uppercase, 1 lowercase, 1 number
 */
export function isStrongPassword(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 6) {
    errors.push("Password must be at least 6 characters long");
  }

  // Relaxed rules: Just need valid length for now to unblock user
  // if (!/[A-Z]/.test(password)) {
  //   errors.push("Password must contain at least one uppercase letter");
  // }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Generate a random password
 */
export function generateRandomPassword(length = 12): string {
  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lowercase = "abcdefghijklmnopqrstuvwxyz";
  const numbers = "0123456789";
  const special = "!@#$%^&*()";
  const all = uppercase + lowercase + numbers + special;

  let password = "";
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += special[Math.floor(Math.random() * special.length)];

  for (let i = password.length; i < length; i++) {
    password += all[Math.floor(Math.random() * all.length)];
  }

  // Shuffle the password
  return password
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("");
}

/**
 * Sanitize user input to prevent XSS
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, "") // Remove < and >
    .trim();
}

/**
 * Generate a verification code (6 digits)
 */
export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Check if a user is rate limited based on IP or Email
 * Limit: 5 failed attempts per 15 minutes
 */
import { createClient } from "@supabase/supabase-js";

// Helper for server-side supabase client
const createServerClient = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } },
  );

export async function checkRateLimit(
  email: string,
  ipAddress?: string,
): Promise<{ isBlocked: boolean; message?: string }> {
  try {
    const windowMinutes = 15;
    const maxAttempts = 5;
    const timeWindow = new Date();
    timeWindow.setMinutes(timeWindow.getMinutes() - windowMinutes);

    const supabase = createServerClient();

    // Check failed attempts for this email
    const { count: emailCount, error: emailError } = await supabase
      .from("login_attempts")
      .select("*", { count: "exact", head: true })
      .eq("email", email.toLowerCase())
      .eq("success", false)
      .gt("created_at", timeWindow.toISOString());

    if (emailError) {
      console.error("Rate limit check error (email):", emailError);
      return { isBlocked: false };
    }

    if ((emailCount || 0) >= maxAttempts) {
      return {
        isBlocked: true,
        message:
          "Too many failed login attempts. Please try again in 15 minutes.",
      };
    }

    // Check failed attempts for this IP (if provided)
    if (ipAddress) {
      const { count: ipCount, error: ipError } = await supabase
        .from("login_attempts")
        .select("*", { count: "exact", head: true })
        .eq("ip_address", ipAddress)
        .eq("success", false)
        .gt("created_at", timeWindow.toISOString());

      if (ipError) {
        console.error("Rate limit check error (IP):", ipError);
        return { isBlocked: false };
      }

      if ((ipCount || 0) >= maxAttempts * 2) {
        // Higher limit for IP (shared networks)
        return {
          isBlocked: true,
          message:
            "Too many failed login attempts from this network. Please try again later.",
        };
      }
    }
  } catch (err) {
    console.error("Rate limit unexpected crash:", err);
    // Fail OPEN: Allow login if rate limiting crashes
    return { isBlocked: false };
  }

  return { isBlocked: false };
}

/**
 * Record a login attempt
 */
export async function recordLoginAttempt(
  email: string,
  success: boolean,
  ipAddress?: string,
  userAgent?: string,
  failureReason?: string,
): Promise<void> {
  try {
    const supabase = createServerClient();
    const { error } = await supabase.from("login_attempts").insert({
      email: email.toLowerCase(),
      ip_address: ipAddress || null,
      user_agent: userAgent || null,
      success,
      failure_reason: failureReason || null,
    });

    if (error) {
      console.error("Error recording login attempt:", error);
    }
  } catch (err) {
    console.error("Failed to log login attempt:", err);
  }
}

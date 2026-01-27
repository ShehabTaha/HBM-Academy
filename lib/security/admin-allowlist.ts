/**
 * Utility for managing the administrator email allowlist.
 */

// Load allowed emails from environment variable (comma separated)
// Example: ADMIN_ALLOWED_EMAILS="ahmed@example.com,admin@hbmacademy.com"
const allowedEmailsRaw = process.env.ADMIN_ALLOWED_EMAILS || "";

const ALLOWED_EMAILS = allowedEmailsRaw
  .split(",")
  .map((email) => email.trim().toLowerCase())
  .filter((email) => email.length > 0);

/**
 * Checks if a given email is in the administrator allowlist.
 * @param email The email to check
 * @returns boolean
 */
export function isAllowedAdminEmail(email?: string | null): boolean {
  if (!email) return false;

  // In development, if no allowlist is provided, we might want to allow all for testing
  // But for the user's "hard-lock" request, we enforce it if any are defined
  if (ALLOWED_EMAILS.length === 0) {
    if (process.env.NODE_ENV === "production") {
      console.error(
        "[Security] ADMIN_ALLOWED_EMAILS is not configured in production!",
      );
      return false;
    }
    // In dev, if empty, we can return true to avoid locking out the dev,
    // but the user asked for a hard-lock. Let's stick to the list if provided.
    return false;
  }

  return ALLOWED_EMAILS.includes(email.trim().toLowerCase());
}

export { ALLOWED_EMAILS };

/**
 * Utility for managing the administrator email allowlist.
 */

const BUILT_IN_ADMIN_EMAILS = ["shehabtaha783@gmail.com"];

/**
 * Checks if a given email is in the administrator allowlist.
 * Dynamically reads process.env.ADMIN_ALLOWED_EMAILS on every request.
 */
export function isAllowedAdminEmail(email?: string | null): boolean {
  if (!email) return false;

  const normalizedEmail = email.trim().toLowerCase();
  if (BUILT_IN_ADMIN_EMAILS.includes(normalizedEmail)) {
    return true;
  }

  const raw = process.env.ADMIN_ALLOWED_EMAILS || "";
  const allowedList = raw
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  // If no allowlist is configured in environment, allow any admin user in DB
  if (allowedList.length === 0) {
    return true;
  }

  return allowedList.includes(normalizedEmail);
}

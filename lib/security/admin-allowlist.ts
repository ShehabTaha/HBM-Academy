/**
 * Utility for managing the administrator email allowlist.
 *
 * Trust model:
 * - BUILT_IN_ADMIN_EMAILS is the primary hardcoded list (always checked).
 * - ADMIN_ALLOWED_EMAILS env var can extend that list (comma-separated).
 * - If the env var is absent or empty, ONLY the built-in list is used.
 *   There is intentionally NO "allow all" fallback — missing config = deny.
 */

const BUILT_IN_ADMIN_EMAILS = ["shehabtaha783@gmail.com"];

/**
 * Returns true only if `email` is in the administrator allowlist.
 * Called on every protected request — reads env var dynamically.
 */
export function isAllowedAdminEmail(email?: string | null): boolean {
  if (!email) return false;

  const normalizedEmail = email.trim().toLowerCase();

  // 1. Built-in list (always trusted)
  if (BUILT_IN_ADMIN_EMAILS.includes(normalizedEmail)) {
    return true;
  }

  // 2. Env-var extension (optional)
  const raw = process.env.ADMIN_ALLOWED_EMAILS ?? "";
  const envList = raw
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  return envList.includes(normalizedEmail);
}

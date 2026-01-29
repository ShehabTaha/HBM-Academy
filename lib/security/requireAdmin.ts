import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth-options";
import { isAllowedAdminEmail } from "@/lib/security/admin-allowlist";

export type AdminUser = {
  id: string;
  email: string;
  role: string | "admin";
  name?: string | null;
  image?: string | null;
};

export async function requireAdmin() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return {
      user: null as AdminUser | null,
      error: NextResponse.json(
        { error: "Unauthorized: No active session" },
        { status: 401 },
      ),
    };
  }

  // 1. Check Email Allowlist (First line of defense)
  if (!isAllowedAdminEmail(session.user.email)) {
    console.warn(
      `[Security] Blocked unauthorized email: ${session.user.email}`,
    );
    return {
      user: null,
      error: NextResponse.json(
        { error: "Forbidden: Email not in admin allowlist" },
        { status: 403 },
      ),
    };
  }

  // 2. Check Role (Second line of defense)
  if (session.user.role !== "admin") {
    console.warn(
      `[Security] Blocked non-admin role: ${session.user.role} (${session.user.email})`,
    );
    return {
      user: null,
      error: NextResponse.json(
        { error: "Forbidden: User does not have admin role" },
        { status: 403 },
      ),
    };
  }

  return { user: session.user as AdminUser, error: null };
}

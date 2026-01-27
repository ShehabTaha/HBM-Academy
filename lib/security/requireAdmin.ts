import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { isAllowedAdminEmail } from "./admin-allowlist";

/**
 * Protects an API route by requiring the user to be an admin and in the allowlist.
 * Returns the user's token info if successful, otherwise returns a NextResponse error.
 */
export async function requireAdmin(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token) {
    return {
      authorized: false,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  // Check both role AND email allowlist
  const isAllowed = isAllowedAdminEmail(token.email);
  const isAdmin = token.role === "admin" || token.role === "lecturer";

  if (!isAllowed || !isAdmin) {
    console.warn(
      `[Security] Blocked unauthorized access attempt: ${token.email} (Role: ${token.role})`,
    );
    return {
      authorized: false,
      response: NextResponse.json(
        { error: "Forbidden: Restricted Access" },
        { status: 403 },
      ),
    };
  }

  return {
    authorized: true,
    user: {
      id: token.id as string,
      email: token.email as string,
      role: token.role as string,
    },
  };
}

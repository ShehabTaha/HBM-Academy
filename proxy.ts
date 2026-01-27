import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";
import { isAllowedAdminEmail } from "@/lib/security/admin-allowlist";

export async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // 1. Skip middleware for static assets, NextAuth routes, and images
  if (
    path.startsWith("/api/auth") ||
    path.startsWith("/_next") ||
    path.startsWith("/static") ||
    path.includes(".") // Catch files like .svg, .ico, .png
  ) {
    return NextResponse.next();
  }

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  // 2. Root path handling
  if (path === "/") {
    if (token) {
      return NextResponse.redirect(new URL("/dashboard/home", req.url));
    }
    // Redirect to login if visiting root unauthenticated
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  // 3. Protected Routes (Dashboard & Admin API)
  if (path.startsWith("/dashboard") || path.startsWith("/api/admin")) {
    if (!token) {
      const url = new URL("/auth/login", req.url);
      url.searchParams.set("callbackUrl", path);
      return NextResponse.redirect(url);
    }

    // Email Allowlist Check
    if (!isAllowedAdminEmail(token.email as string)) {
      console.warn(
        `[Middleware] Unauthorized email access blocked: ${token.email}`,
      );
      // Redirect to a specialized unauthorized page
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  // Explicitly exclude /api/auth/* from the matcher to be safe
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (NextAuth routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico).*)",
  ],
};

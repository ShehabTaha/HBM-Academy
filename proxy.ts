/**
 * proxy.ts — Next.js Edge Proxy (middleware equivalent in Next.js 16+)
 *
 * Two independent auth systems:
 *   - Student routes  → Supabase Auth (cookies managed by @supabase/ssr)
 *   - Admin routes    → NextAuth JWT  (next-auth/jwt)
 *
 * Admin entry point is /admin/login — completely separate from student login.
 * Students are never redirected to /admin/login and vice-versa.
 */

import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { isAllowedAdminEmail } from "@/lib/security/admin-allowlist";

// ─────────────────────────────────────────────
// Route classification
// ─────────────────────────────────────────────

/** Admin dashboard + admin API routes — protected by NextAuth JWT */
const ADMIN_ROUTE_PREFIXES = [
  "/dashboard/home",
  "/dashboard/courses",
  "/dashboard/students",
  "/dashboard/settings",
  "/dashboard/analytics",
  "/dashboard/messages",
  "/dashboard/profile",
  "/dashboard/users",
  "/dashboard/submissions",
  "/dashboard/video-library",
  "/dashboard/account",
  "/api/admin",
];

/** Student protected routes — protected by Supabase Auth */
const STUDENT_PROTECTED_PREFIXES = [
  "/profile",
  "/certificates",
  "/messages",
];

// /dashboard exactly (student-facing dashboard root)
const STUDENT_DASHBOARD_EXACT = "/dashboard";

export default async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  let response = NextResponse.next({ request: req });

  // ── 1. Skip static assets and NextAuth internal routes ───────────────────
  if (
    path.startsWith("/api/auth") ||
    path.startsWith("/_next") ||
    path.startsWith("/static") ||
    path.includes(".")
  ) {
    return response;
  }

  // ── 2. Evaluate NextAuth Admin JWT with robust cookie & secret handling ────
  const secret =
    process.env.NEXTAUTH_SECRET ||
    "your-secret-key-here-change-in-production";

  const isHttps =
    req.url.startsWith("https://") ||
    req.headers.get("x-forwarded-proto") === "https" ||
    process.env.NODE_ENV === "production";

  let adminToken = await getToken({
    req,
    secret,
    secureCookie: isHttps,
  });

  if (!adminToken) {
    adminToken = await getToken({
      req,
      secret,
      secureCookie: !isHttps,
    });
  }

  const isValidAdmin =
    Boolean(adminToken) &&
    String(adminToken?.role || "").toLowerCase() === "admin" &&
    isAllowedAdminEmail(adminToken?.email as string);

  // ── 3. Direct /admin or /admin/dashboard navigation ──────────────────────
  if (path === "/admin" || path === "/admin/dashboard") {
    if (isValidAdmin) {
      return NextResponse.redirect(new URL("/dashboard/home", req.url));
    }
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }

  // ── 4. Admin login page protection ───────────────────────────────────────
  if (path === "/admin/login") {
    if (isValidAdmin) {
      return NextResponse.redirect(new URL("/dashboard/home", req.url));
    }
    return response;
  }

  // ── 5. Admin route guard ─────────────────────────────────────────────────
  const isAdminRoute = ADMIN_ROUTE_PREFIXES.some((prefix) =>
    path.startsWith(prefix)
  );

  if (isAdminRoute) {
    // No JWT session → send to admin login
    if (!adminToken) {
      const url = new URL("/admin/login", req.url);
      url.searchParams.set("callbackUrl", path);
      return NextResponse.redirect(url);
    }

    // Has a JWT but email not in admin allowlist or not admin role → deny
    if (!isValidAdmin) {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    return response;
  }

  // ── 6. Logged-in Admin attempt to access student pages or student login ────
  if (
    isValidAdmin &&
    (path === STUDENT_DASHBOARD_EXACT ||
      path === "/auth/login" ||
      path === "/login" ||
      path === "/auth/signin")
  ) {
    return NextResponse.redirect(new URL("/dashboard/home", req.url));
  }

  // ── 7. Student route guard ───────────────────────────────────────────────
  const makeSupabase = () =>
    createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => req.cookies.getAll(),
          setAll: (cookiesToSet) => {
            cookiesToSet.forEach(({ name, value }) => {
              req.cookies.set(name, value);
            });
            response = NextResponse.next({ request: req });
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, options);
            });
          },
        },
      }
    );

  const isStudentProtected =
    path === STUDENT_DASHBOARD_EXACT ||
    STUDENT_PROTECTED_PREFIXES.some((prefix) => path.startsWith(prefix)) ||
    path.includes("/learn/");

  if (isStudentProtected) {
    const supabase = makeSupabase();
    const {
      data: { user: supabaseUser },
    } = await supabase.auth.getUser();

    if (!supabaseUser) {
      const url = new URL("/auth/login", req.url);
      url.searchParams.set("redirect", path);
      return NextResponse.redirect(url);
    }

    return response;
  }

  // ── 8. Root "/" — redirect logged-in admin to admin dashboard ────────────
  if (path === "/") {
    if (isValidAdmin) {
      return NextResponse.redirect(new URL("/dashboard/home", req.url));
    }
  }

  return response;
}

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
};

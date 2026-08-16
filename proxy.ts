import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { isAllowedAdminEmail } from "@/lib/security/admin-allowlist";

// Routes that require Supabase student auth
const STUDENT_PROTECTED = [
  "/dashboard",
  "/profile",
  "/certificates",
  "/messages",
];

export default async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  let response = NextResponse.next({ request: req });

  // 1. Skip middleware for static assets and NextAuth internal routes
  if (
    path.startsWith("/api/auth") ||
    path.startsWith("/_next") ||
    path.startsWith("/static") ||
    path.includes(".")
  ) {
    return response;
  }

  // Helper to create a Supabase SSR client that reads/writes cookies on the response
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

  const supabase = makeSupabase();
  const {
    data: { user: supabaseUser },
  } = await supabase.auth.getUser();

  // 2. Admin routes — NextAuth only
  const isAdminRoute =
    path.startsWith("/admin/dashboard") ||
    path.startsWith("/dashboard/home") ||
    path.startsWith("/dashboard/courses") ||
    path.startsWith("/dashboard/students") ||
    path.startsWith("/dashboard/settings") ||
    path.startsWith("/dashboard/analytics") ||
    path.startsWith("/dashboard/messages") ||
    path.startsWith("/dashboard/profile") ||
    path.startsWith("/dashboard/users") ||
    path.startsWith("/dashboard/submissions") ||
    path.startsWith("/dashboard/video-library") ||
    path.startsWith("/dashboard/account") ||
    path.startsWith("/api/admin");

  if (isAdminRoute) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      const url = new URL("/auth/login", req.url);
      url.searchParams.set("callbackUrl", path);
      return NextResponse.redirect(url);
    }
    if (!isAllowedAdminEmail(token.email as string)) {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }
    return response;
  }

  // 3. Student protected routes — Supabase Auth
  const isStudentProtected =
    STUDENT_PROTECTED.some((route) =>
      route === "/dashboard" ? path === "/dashboard" : path.startsWith(route),
    ) ||
    path.includes("/learn/");

  if (isStudentProtected) {
    if (!supabaseUser) {
      const url = new URL("/auth/login", req.url);
      url.searchParams.set("redirect", path);
      return NextResponse.redirect(url);
    }

    return response;
  }

  // 4. Root "/" — check admin session. Student sessions are handled by
  // protected routes to keep public/auth pages fast and offline-friendly.
  if (path === "/") {
    const adminToken = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
    });
    if (adminToken && isAllowedAdminEmail(adminToken.email as string)) {
      return NextResponse.redirect(new URL("/dashboard/home", req.url));
    }
  }

  return response;
}

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
};

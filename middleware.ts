import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // // Admin routes
    // if (path.startsWith("/admin")) {
    //   if (token?.role !== "admin") {
    //     return NextResponse.redirect(new URL("/unauthorized", req.url));
    //   }
    // }

    // Lecturer routes
    if (path.startsWith("/lecturer")) {
      if (token?.role !== "lecturer" && token?.role !== "admin") {
        return NextResponse.redirect(new URL("/unauthorized", req.url));
      }
    }

    // Student routes
    if (path.startsWith("/student")) {
      if (!token || token.role === "admin") {
        return NextResponse.redirect(new URL("/unauthorized", req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

// Protect these routes
export const config = {
  matcher: [
    // "/admin/:path*",
    "/lecturer/:path*",
    "/student/:path*",
    "/api/admin/:path*",
    "/api/lecturer/:path*",
    "/api/student/:path*",
  ],
};

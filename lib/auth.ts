import { getServerSession } from "next-auth/next";
import type { Session } from "next-auth";
import { authOptions } from "@/app/api/auth/[nextauth]/route";

/**
 * Get the current session on the server side
 * Use this in Server Components and API Routes
 */
export async function getSession(): Promise<Session | null> {
  return await getServerSession(authOptions);
}

/**
 * Get the current user from session
 */
export async function getCurrentUser() {
  const session = await getSession();
  return session?.user;
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await getSession();
  return !!session?.user;
}

/**
 * Check if user has a specific role
 */
export async function hasRole(
  role: "student" | "admin" | "lecturer"
): Promise<boolean> {
  const user = await getCurrentUser();
  return user?.role === role;
}

/**
 * Check if user is admin
 */
export async function isAdmin(): Promise<boolean> {
  return hasRole("admin");
}

/**
 * Check if user is lecturer
 */
export async function isLecturer(): Promise<boolean> {
  return hasRole("lecturer");
}

/**
 * Require authentication - throws error if not authenticated
 */
export async function requireAuth() {
  const session = await getSession();
  if (!session?.user) {
    throw new Error("Unauthorized - Please sign in");
  }
  return session.user;
}

/**
 * Require specific role - throws error if user doesn't have role
 */
export async function requireRole(role: "student" | "admin" | "lecturer") {
  const user = await requireAuth();
  if (user.role !== role) {
    throw new Error(`Forbidden - Requires ${role} role`);
  }
  return user;
}

/**
 * Require admin role
 */
export async function requireAdmin() {
  return requireRole("admin");
}

/**
 * Require lecturer role
 */
export async function requireLecturer() {
  return requireRole("lecturer");
}
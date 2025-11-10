import type { DefaultSession, DefaultUser } from "next-auth";
import type { JWT, DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  /**
   * Extend the built-in session type
   */
  interface Session {
    user: {
      id: string;
      role: "student" | "admin" | "lecturer";
      email: string;
      name: string;
      avatar?: string;
      isEmailVerified?: boolean;
    } & DefaultSession["user"];
  }

  /**
   * Extend the built-in user type
   */
  interface User extends DefaultUser {
    id: string;
    role: "student" | "admin" | "lecturer";
    avatar?: string;
    isEmailVerified?: boolean;
  }
}

declare module "next-auth/jwt" {
  /**
   * Extend the built-in JWT type
   */
  interface JWT extends DefaultJWT {
    id: string;
    role: "student" | "admin" | "lecturer";
    isEmailVerified?: boolean;
  }
}
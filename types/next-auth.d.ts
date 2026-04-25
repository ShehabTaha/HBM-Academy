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
      isEmailVerified: boolean;
      /** Custom token stored in user_sessions table; used to match current session */
      sessionToken: string | null;
      /** Row ID in user_sessions for the current device's session */
      sessionId: string | null;
    } & DefaultSession["user"];
  }

  /**
   * Extend the built-in user type
   */
  interface User extends DefaultUser {
    id: string;
    role: "student" | "admin" | "lecturer";
    avatar?: string;
    isEmailVerified: boolean;
    /** Custom token stored in user_sessions table; used to match current session */
    sessionToken: string | null;
    /** Row ID in user_sessions for the current device's session */
    sessionId: string | null;
  }
}

declare module "next-auth/jwt" {
  /**
   * Extend the built-in JWT type
   */
  interface JWT extends DefaultJWT {
    id: string;
    role: "student" | "admin" | "lecturer";
    isEmailVerified: boolean;
    /** Custom token stored in user_sessions table; used to match current session */
    sessionToken: string | null;
    /** Row ID in user_sessions for the current device's session */
    sessionId: string | null;
  }
}
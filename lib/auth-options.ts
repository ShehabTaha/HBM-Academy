import { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";
import { isAllowedAdminEmail } from "./security/admin-allowlist";

// Validation Schema
const credentialsSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password required"),
});

export const authOptions: NextAuthOptions = {
  // Debug mode to see logs
  debug: true,
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        console.log("[Auth] Starting authorization for:", credentials?.email);

        try {
          // Initialize Supabase Client dynamicially
          const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
          const supabaseKey =
            process.env.SUPABASE_SERVICE_ROLE_KEY ||
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

          if (!supabaseUrl || !supabaseKey) {
            console.error("[Auth] Missing Supabase environment variables");
            return null;
          }

          const supabase = createClient(supabaseUrl, supabaseKey, {
            auth: {
              persistSession: false,
              autoRefreshToken: false,
              detectSessionInUrl: false,
            },
          });

          // A. Parse Input
          const validation = credentialsSchema.safeParse(credentials);
          if (!validation.success) {
            console.error("[Auth] Validation failed:", validation.error);
            return null;
          }
          const { email, password } = validation.data;

          // B. Fetch User
          const { data: user, error: dbError } = await supabase
            .from("users")
            .select("*")
            .eq("email", email.toLowerCase())
            .single();

          if (dbError) {
            console.error("[Auth] Database error:", dbError);
            return null;
          }

          if (!user) {
            console.warn("[Auth] User not found in DB");
            return null;
          }

          // C. Verify Password
          const isValidPassword = await bcrypt.compare(password, user.password);
          if (!isValidPassword) {
            console.warn("[Auth] Invalid password");
            return null;
          }

          // D. Success
          console.log("[Auth] Login successful for:", user.email);

          // E. Create Session Record
          const userAgent = req?.headers?.["user-agent"] || "Unknown Device";
          const ip =
            (req?.headers?.["x-forwarded-for"] as string)?.split(",")[0] ||
            "Unknown IP";

          // Simple device/browser parsing
          const isMobile = /mobile/i.test(userAgent);
          const isTablet = /tablet|ipad/i.test(userAgent);
          const deviceType: "desktop" | "mobile" | "tablet" = isTablet
            ? "tablet"
            : isMobile
              ? "mobile"
              : "desktop";

          let browser = "Unknown Browser";
          if (userAgent.includes("Firefox")) browser = "Firefox";
          else if (userAgent.includes("Chrome")) browser = "Chrome";
          else if (userAgent.includes("Safari")) browser = "Safari";
          else if (userAgent.includes("Edge")) browser = "Edge";

          const deviceName = isMobile ? "Mobile Device" : "Desktop PC";
          const sessionToken = crypto.randomUUID();

          const { data: sessionData, error: sessionError } = await supabase
            .from("user_sessions")
            .insert({
              user_id: user.id,
              session_token: sessionToken,
              ip_address: ip,
              device_name: deviceName,
              device_type: deviceType,
              browser: browser,
              last_activity: new Date().toISOString(),
            })
            .select("id")
            .single();

          if (sessionError) {
            console.error(
              "[Auth] Failed to create session record:",
              sessionError,
            );
          }

          // Handle loose column naming (is_email_verified vs isemailverified)
          const isVerified =
            user.is_email_verified ?? user.isemailverified ?? false;

          return {
            id: user.id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
            isEmailVerified: isVerified,
            image: user.avatar,
            sessionToken: sessionToken,
            sessionId: sessionData?.id,
          } as any;
        } catch (err) {
          console.error("[Auth] Critical crash in authorize:", err);
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: "/auth/login",
    signOut: "/auth/login",
    error: "/auth/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async signIn({ user }) {
      if (!isAllowedAdminEmail(user.email)) {
        console.warn(
          `[Auth] Sign-in denied for unauthorized email: ${user.email}`,
        );
        return false; // Deny sign in
      }
      return true; // Allow sign in
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.isEmailVerified = user.isEmailVerified;
        // @ts-ignore
        token.sessionToken = user.sessionToken;
        // @ts-ignore
        token.sessionId = user.sessionId;
      }

      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as any;
        session.user.isEmailVerified = token.isEmailVerified as boolean;
        // @ts-ignore
        session.user.sessionToken = token.sessionToken as string;
        // @ts-ignore
        session.user.sessionId = token.sessionId as string;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

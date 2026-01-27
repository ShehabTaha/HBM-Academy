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
          const ip = req?.headers?.["x-forwarded-for"] || "Unknown IP";
          // Simple device parsing
          const isMobile = /mobile/i.test(userAgent);
          const deviceInfo = isMobile ? "Mobile Device" : "Desktop";
          const location = "Unknown Location"; // Requires IP geolocation service

          const { data: sessionData, error: sessionError } = await supabase
            .from("user_sessions")
            .insert({
              user_id: user.id,
              ip_address: ip,
              user_agent: userAgent,
              device_info: deviceInfo,
              location: location,
              last_activity: new Date().toISOString(),
            })
            .select("id")
            .single();

          if (sessionError) {
            console.error(
              "[Auth] Failed to create session record:",
              sessionError,
            );
            // Verify if table exists, if not, proceed without session tracking (graceful degradation) but log it.
            // If we really want to enforce sessions, we should fail here.
            // But for now, let's proceed but maybe without sessionId.
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
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.isEmailVerified = user.isEmailVerified;
        // @ts-ignore
        token.sessionId = user.sessionId;
      }

      // Update last activity on session update?
      if (trigger === "update" && token.sessionId) {
        // Could update DB here
      }

      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as any;
        session.user.isEmailVerified = token.isEmailVerified as boolean;
        // @ts-ignore
        session.user.sessionId = token.sessionId as string;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

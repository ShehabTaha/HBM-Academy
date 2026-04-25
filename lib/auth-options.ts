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
          const rawIp = req?.headers?.["x-forwarded-for"] as string | undefined;
          const ip = rawIp ? rawIp.split(",")[0].trim() : "Unknown IP";

          // Device type detection
          const isTablet = /tablet|ipad/i.test(userAgent);
          const isMobile = !isTablet && /mobile/i.test(userAgent);
          const deviceType: "desktop" | "mobile" | "tablet" = isTablet
            ? "tablet"
            : isMobile
              ? "mobile"
              : "desktop";

          // Browser detection — order matters: Edge > Chrome > Firefox > Safari
          let browser = "Unknown Browser";
          if (/edg\//i.test(userAgent))         browser = "Edge";
          else if (/firefox/i.test(userAgent))  browser = "Firefox";
          else if (/chrome/i.test(userAgent))   browser = "Chrome";
          else if (/safari/i.test(userAgent))   browser = "Safari";

          // OS detection
          let os = "Unknown OS";
          if (/windows/i.test(userAgent))       os = "Windows";
          else if (/mac os x/i.test(userAgent)) os = "macOS";
          else if (/android/i.test(userAgent))  os = "Android";
          else if (/iphone|ipad/i.test(userAgent)) os = "iOS";
          else if (/linux/i.test(userAgent))    os = "Linux";

          const deviceName = `${browser} on ${os}`;
          const sessionToken = crypto.randomUUID();

          const { data: sessionData, error: sessionError } = await supabase
            .from("user_sessions")
            .insert({
              user_id: user.id,
              session_token: sessionToken,
              ip_address: ip,
              device_name: deviceName,
              device_type: deviceType,
              browser,
              os,
              last_activity: new Date().toISOString(),
              expires_at: new Date(
                Date.now() + 30 * 24 * 60 * 60 * 1000
              ).toISOString(),
            })
            .select("id")
            .single();

          if (sessionError) {
            // Log but do not fail login — session tracking is non-critical
            console.error(
              "[Auth] Failed to create session record:",
              JSON.stringify(sessionError),
            );
          } else {
            console.log("[Auth] Session record created:", sessionData?.id);
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
            sessionToken,
            sessionId: sessionData?.id ?? null,
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
        return false;
      }
      return true;
    },

    async jwt({ token, user }) {
      // On initial sign-in, `user` is populated — persist into token
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.isEmailVerified = user.isEmailVerified;
        token.sessionToken = user.sessionToken;
        token.sessionId = user.sessionId;
      }
      // On subsequent requests, token already has these values — just return it
      return token;
    },

    async session({ session, token }) {
      if (token && session.user) {
        session.user.id              = token.id;
        session.user.role            = token.role;
        session.user.isEmailVerified = token.isEmailVerified;
        session.user.sessionToken    = token.sessionToken;
        session.user.sessionId       = token.sessionId;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

import NextAuth, { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { z } from "zod";
import { supabase } from "@/lib/supabase";
import bcrypt from "bcryptjs";

// Validation schema for credentials
const credentialsSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "you@example.com",
        },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          // Validate the inputs
          const validation = credentialsSchema.safeParse(credentials);
          if (!validation.success) {
            console.error("Validation error:", validation.error);
            return null;
          }

          const { email, password } = validation.data;

          // Fetch user from Supabase
          const { data: user, error } = await supabase
            .from("users")
            .select("*")
            .eq("email", email.toLowerCase())
            .is("deletedAt", null)
            .single();

          if (error || !user) {
            console.error("User not found or error:", email, error);
            return null;
          }

          // Check if email is verified (optional - uncomment if needed)
          // if (!user.isEmailVerified) {
          //   console.error("Email not verified:", email);
          //   return null;
          // }

          // Check password
          const passwordMatch = await bcrypt.compare(password, user.password);
          if (!passwordMatch) {
            console.error("Invalid password for user:", email);
            return null;
          }

          // Return user object (password excluded)
          return {
            id: user.id.toString(), // Supabase ID is typically UUID or int, ensure string
            email: user.email,
            name: user.name,
            role: user.role,
            avatar: user.avatar,
            isEmailVerified: user.isEmailVerified,
          };
        } catch (error) {
          console.error("Authorization error:", error);
          return null;
        }
      },
    }),
    // Google OAuth Provider (optional)
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            authorization: {
              params: {
                prompt: "consent",
                access_type: "offline",
                response_type: "code",
              },
            },
          }),
        ]
      : []),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      // Handle OAuth sign-in
      if (account?.provider === "google") {
        try {
          // Check if user exists
          const { data: existingUser, error } = await supabase
            .from("users")
            .select("*")
            .eq("email", user.email?.toLowerCase())
            .is("deletedAt", null)
            .single();

          if (!existingUser) {
            // Create new user from OAuth
            const { data: newUser, error: createError } = await supabase
              .from("users")
              .insert({
                name: user.name,
                email: user.email?.toLowerCase(),
                avatar: user.image,
                role: "student",
                isEmailVerified: true,
                password: await bcrypt.hash(Math.random().toString(36), 10), // Random password
              })
              .select()
              .single();

            if (createError) {
              console.error("Error creating user from OAuth:", createError);
              return false;
            }
            // Update user ID for session
            user.id = newUser.id.toString();
            user.role = newUser.role;
          } else {
            // Update user ID for session
            user.id = existingUser.id.toString();
            user.role = existingUser.role;
          }

          return true;
        } catch (error) {
          console.error("Sign-in error:", error);
          return false;
        }
      }

      return true;
    },
    async jwt({ token, user, trigger, session }) {
      // Initial sign in
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.isEmailVerified = user.isEmailVerified;
      }

      // Handle session update
      if (trigger === "update" && session) {
        token.name = session.name;
        token.email = session.email;
      }

      return token;
    },
    async session({ session, token }) {
      // Pass user info to session object
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as "student" | "admin" | "lecturer";
        session.user.isEmailVerified = token.isEmailVerified as boolean;
      }

      return session;
    },
  },
  pages: {
    signIn: "/login",
    signOut: "/",
    error: "/login",
    verifyRequest: "/verify-email",
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };

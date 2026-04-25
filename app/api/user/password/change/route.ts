import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-options";
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";
import type { Database } from "@/types/database.types";

// Explicit row shape for the password fetch query
type UserPasswordRow = Pick<
  Database["public"]["Tables"]["users"]["Row"],
  "password"
>;

/**
 * Creates a Supabase admin client (service role) without strict generics.
 * The strongly-typed createAdminClient<Database> causes .update() to collapse
 * to `never` for certain column combinations — using the raw client avoids
 * this while keeping all other validations in TypeScript.
 */
function createRawAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  if (!url || !key) throw new Error("Missing Supabase env vars");
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

// ─── Validation helpers ───────────────────────────────────────────────────────

const PASSWORD_RULES = {
  minLength: (p: string) => p.length >= 8,
  uppercase: (p: string) => /[A-Z]/.test(p),
  lowercase: (p: string) => /[a-z]/.test(p),
  number: (p: string) => /\d/.test(p),
  special: (p: string) => /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/.test(p),
};

function validateNewPassword(password: string): string | null {
  if (!PASSWORD_RULES.minLength(password))
    return "Password must be at least 8 characters long.";
  if (!PASSWORD_RULES.uppercase(password))
    return "Password must contain at least one uppercase letter.";
  if (!PASSWORD_RULES.lowercase(password))
    return "Password must contain at least one lowercase letter.";
  if (!PASSWORD_RULES.number(password))
    return "Password must contain at least one number.";
  if (!PASSWORD_RULES.special(password))
    return "Password must contain at least one special character.";
  return null; // all rules passed
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function POST(req: Request) {
  try {
    // 1. Auth guard — must be a signed-in user
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    // 2. Parse & basic-validate request body
    let body: { currentPassword?: string; newPassword?: string };
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid request body." },
        { status: 400 }
      );
    }

    const { currentPassword, newPassword } = body;

    if (!currentPassword || typeof currentPassword !== "string") {
      return NextResponse.json(
        { error: "Current password is required." },
        { status: 400 }
      );
    }
    if (!newPassword || typeof newPassword !== "string") {
      return NextResponse.json(
        { error: "New password is required." },
        { status: 400 }
      );
    }

    // 3. Validate new password strength (mirrors the front-end rules exactly)
    const strengthError = validateNewPassword(newPassword);
    if (strengthError) {
      return NextResponse.json({ error: strengthError }, { status: 400 });
    }

    // 4. Prevent "new password is same as current" (fast check before DB hit)
    //    We compare after fetching the hash below — placeholder guard is here
    //    for the string identity case (e.g. user literally typed the same value).

    // 5. Fetch current password hash from DB (service role bypasses RLS)
    const supabase = createRawAdminClient();

    const { data: userRow, error: fetchError } = await supabase
      .from("users")
      .select("password")
      .eq("id", userId)
      .single() as { data: UserPasswordRow | null; error: Error | null };

    if (fetchError || !userRow) {
      console.error("[Password Change] User not found:", fetchError);
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    // 6. Verify current password against stored bcrypt hash
    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      userRow.password
    );
    if (!isCurrentPasswordValid) {
      return NextResponse.json(
        { error: "Current password is incorrect." },
        { status: 401 }
      );
    }

    // 7. Prevent re-using the same password
    const isSameAsCurrentPassword = await bcrypt.compare(
      newPassword,
      userRow.password
    );
    if (isSameAsCurrentPassword) {
      return NextResponse.json(
        { error: "New password must be different from your current password." },
        { status: 400 }
      );
    }

    // 8. Hash the new password
    const SALT_ROUNDS = 12; // slightly stronger than the old 10
    const hashedNewPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);

    // 9. Persist the new hash + audit timestamp
    const { error: updateError } = await supabase
      .from("users")
      .update({
        password: hashedNewPassword,
        password_changed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (updateError) {
      console.error("[Password Change] Failed to update:", updateError);
      return NextResponse.json(
        { error: "Failed to update password. Please try again." },
        { status: 500 }
      );
    }

    // 10. Success
    console.log(`[Password Change] Password updated for user ${userId}`);
    return NextResponse.json({
      success: true,
      message: "Password updated successfully.",
    });
  } catch (err) {
    console.error("[Password Change] Unexpected error:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";

// Force dynamic to prevent caching
export const dynamic = "force-dynamic";

// Initialize Supabase Client (safe in route handler if vars are missing, will error on call)
// Initialize Supabase Client (Prefer Service Role for Admin access, fallback to Anon)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
});

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");
  const passwordToCheck = searchParams.get("password");
  const newRole = searchParams.get("newRole");

  if (!email) {
    return NextResponse.json({ error: "Email required" }, { status: 400 });
  }

  try {
    // 1. Check User in DB
    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email.toLowerCase())
      .single();

    if (error) {
      return NextResponse.json({
        step: "Fetch User",
        status: "Error",
        details: error,
      });
    }

    if (!user) {
      return NextResponse.json({
        step: "Fetch User",
        status: "Not Found",
        email,
      });
    }

    // 2. Check Password (if provided)
    let passwordCheck = "Skipped";
    if (passwordToCheck) {
      const isMatch = await bcrypt.compare(passwordToCheck, user.password);
      passwordCheck = isMatch ? "MATCH" : "INVALID";
    }

    // 3. Check Rate Limits
    const { count: attempts } = await supabase
      .from("login_attempts")
      .select("*", { count: "exact", head: true })
      .eq("email", email.toLowerCase())
      .eq("success", false)
      .gt("created_at", new Date(Date.now() - 15 * 60 * 1000).toISOString());

    // 4. Update Role (if requested)
    let roleUpdateStatus = "No change requested";

    if (newRole && ["admin", "lecturer", "student"].includes(newRole)) {
      const { error: updateError } = await supabase
        .from("users")
        .update({ role: newRole })
        .eq("email", email.toLowerCase());

      if (updateError) {
        roleUpdateStatus = `Failed: ${updateError.message}`;
      } else {
        roleUpdateStatus = `Success: Changed to ${newRole}`;
        // Refresh local user object to return new role
        const { data: refreshedUser } = await supabase
          .from("users")
          .select("*")
          .eq("email", email.toLowerCase())
          .single();
        if (refreshedUser) {
          user.role = refreshedUser.role;
        }
      }
    }

    return NextResponse.json({
      status: "Success",
      user: {
        id: user.id,
        email: user.email,
        role: user.role, // This will be the NEW role if updated
        is_email_verified: user.is_email_verified,
        created_at: user.created_at,
      },
      passwordCheck,
      roleUpdateStatus,
      recentFailedAttempts: attempts,
      env: {
        supabaseUrlBound: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        supabaseKeyBound: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        supabaseServiceKeyBound: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        usingServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Unexpected Crash", details: err.message, stack: err.stack },
      { status: 500 },
    );
  }
}

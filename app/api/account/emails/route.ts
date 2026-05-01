import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as any).id;

  const { data, error } = await supabase
    .from("user_emails")
    .select("*")
    .eq("user_id", userId)
    .order("is_primary", { ascending: false })
    .order("created_at", { ascending: true });

  if (error) {
    // If the table doesn't exist yet, fallback to users.email
    if (error.code === "42P01") {
       return NextResponse.json([{
         id: "fallback-id",
         user_id: userId,
         email: session.user.email,
         is_primary: true,
         is_verified: true,
         created_at: new Date().toISOString()
       }]);
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { email } = await req.json();
    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    const userId = (session.user as any).id;

    // Check if email already exists
    const { data: existing } = await supabase
      .from("user_emails")
      .select("id")
      .eq("email", email.toLowerCase())
      .single();

    if (existing) {
      return NextResponse.json({ error: "Email already in use" }, { status: 400 });
    }

    // Insert new verified email (assuming OTP verified it before calling this)
    const { data, error } = await supabase
      .from("user_emails")
      .insert({
        user_id: userId,
        email: email.toLowerCase(),
        is_primary: false,
        is_verified: true, // Assuming client verifies before calling this
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { createClient } from "@supabase/supabase-js";
import { adminNotificationSettingsSchema } from "@/lib/validations/admin-notifications";

// Use service role to manage settings table if needed, or just standard client
// We'll use service role to ensure we can upsert easily even if RLS is tricky
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("admin_notification_settings")
    .select("*")
    .eq("admin_user_id", (session.user as any).id)
    .single();

  if (error && error.code !== "PGRST116") {
    // PGRST116 is "Relation contains no rows" (no settings yet)
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Return default empty structure if no row exists
  return NextResponse.json(
    data || {
      recipient_emails: [],
      preferences: {},
    },
  );
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();

    // Validate schema
    const validation = adminNotificationSettingsSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid settings", details: validation.error.format() },
        { status: 400 },
      );
    }

    const { recipient_emails, preferences } = validation.data;
    const userId = (session.user as any).id;

    // Upsert settings
    const { data, error } = await supabase
      .from("admin_notification_settings")
      .upsert(
        {
          admin_user_id: userId,
          recipient_emails,
          preferences,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "admin_user_id" },
      )
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

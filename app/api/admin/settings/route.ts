import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/security/requireAdmin";

export async function GET(request: Request) {
  try {
    const { user: adminUser, error: authError } = await requireAdmin();
    if (authError) return authError;

    const supabase = await createClient();

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");

    let query = supabase.from("platform_settings").select("*");
    if (category) {
      query = query.eq("category", category);
    }

    const { data: settingsData, error } = await query;
    const settings = settingsData as any;

    if (error) {
      // Check for "relation does not exist" error (code 42P01 in Postgres)
      if (error.code === "42P01") {
        console.error(
          "Platform settings table missing. Please run the migration.",
        );
        return NextResponse.json(
          {
            error:
              "Setup Required: Please run the platform settings migration in Supabase SQL Editor.",
            code: "MISSING_TABLE",
          },
          { status: 500 },
        );
      }
      throw error;
    }

    // Transform to key-value object and mask sensitive data
    const formattedSettings: Record<string, any> = {};
    settings?.forEach((setting: any) => {
      let value = setting.setting_value;

      // Mask sensitive data if it's not null/empty
      if (setting.is_sensitive && value) {
        if (typeof value === "string" && value.length > 4) {
          value = `********${value.slice(-4)}`;
        } else {
          value = "********";
        }
      }

      formattedSettings[setting.setting_key] = value;
    });

    return NextResponse.json(formattedSettings);
  } catch (error: any) {
    console.error("Error fetching settings:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { user, error: authError } = await requireAdmin();
    if (authError) return authError;

    const supabase = await createClient();
    const body = await request.json();
    const { settings, category } = body;

    if (!settings || typeof settings !== "object") {
      return NextResponse.json(
        { error: "Invalid settings code" },
        { status: 400 },
      );
    }

    const updates = Object.entries(settings).map(async ([key, value]) => {
      // Check if value is masked (starts with *******), if so, skip update to prevent overwriting with mask
      if (typeof value === "string" && value.startsWith("********")) {
        return;
      }

      // Determine sensitivity (simple heuristic or lookup)
      const sensitiveKeys = [
        "stripe_secret_key",
        "stripe_webhook_secret",
        "sendgrid_api_key",
        "payment_integrations",
      ];
      const isSensitive = sensitiveKeys.some((k) => key.includes(k));

      // @ts-ignore
      return supabase.from("platform_settings").upsert(
        {
          setting_key: key,
          setting_value: value,
          category: category || "general",
          is_sensitive: isSensitive,
          updated_by: (user as any).id,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "setting_key" },
      );
    });

    await Promise.all(updates);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error updating settings:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

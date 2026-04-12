import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * GET /api/platform/branding
 * Public endpoint — returns only non-sensitive branding assets (logo, favicon).
 * Uses the service-role key server-side to bypass RLS on platform_settings.
 * No auth required because these are public-facing URLs.
 */
export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false },
    });

    const { data, error } = await supabase
      .from("platform_settings")
      .select("setting_key, setting_value")
      .in("setting_key", ["platform_logo_url", "platform_favicon_url"]);

    if (error) {
      console.error("[branding] DB error:", error.message);
      return NextResponse.json({});
    }

    const branding: Record<string, string> = {};
    data?.forEach((row: any) => {
      let value = row.setting_value;
      // setting_value is JSONB — unwrap if it's a JSON-encoded string
      // e.g. stored as "\"https://...\"" → unwrap to "https://..."
      if (typeof value === "string") {
        try {
          const parsed = JSON.parse(value);
          if (typeof parsed === "string") value = parsed;
        } catch {
          // already a plain string, use as-is
        }
      }
      if (value && typeof value === "string" && value.startsWith("http")) {
        branding[row.setting_key] = value;
      }
    });

    console.log("[branding] returning:", branding);

    return NextResponse.json(branding, {
      headers: {
        // Don't cache so sidebar always gets fresh data after save
        "Cache-Control": "no-store",
      },
    });
  } catch (err: any) {
    console.error("[branding] Unexpected error:", err);
    return NextResponse.json({});
  }
}

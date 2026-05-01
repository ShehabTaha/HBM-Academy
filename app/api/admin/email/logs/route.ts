/**
 * app/api/admin/email/logs/route.ts
 *
 * Returns paginated email send logs with filtering.
 */
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/security/requireAdmin";
import { createAdminClient } from "@/lib/supabase/admin";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function db(supabase: any): any { return supabase; }

export async function GET(request: Request) {
  try {
    const { error: authError } = await requireAdmin();
    if (authError) return authError;

    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get("page") ?? "1");
    const limit = Math.min(Number(searchParams.get("limit") ?? "50"), 100);
    const status = searchParams.get("status");
    const templateKey = searchParams.get("template_key");
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    const offset = (page - 1) * limit;

    const supabase = createAdminClient();
    let query = db(supabase)
      .from("email_logs")
      .select("*", { count: "exact" })
      .order("sent_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) query = query.eq("status", status);
    if (templateKey) query = query.eq("template_key", templateKey);
    if (from) query = query.gte("sent_at", from);
    if (to) query = query.lte("sent_at", to);

    const { data, error, count } = await query;
    if (error) throw error;

    return NextResponse.json({
      logs: data ?? [],
      total: count ?? 0,
      page,
      limit,
      totalPages: Math.ceil((count ?? 0) / limit),
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

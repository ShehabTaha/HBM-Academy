/**
 * app/api/admin/email/templates/route.ts
 *
 * CRUD for email templates.
 */
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/security/requireAdmin";
import { createAdminClient } from "@/lib/supabase/admin";
import { z } from "zod";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function db(supabase: any): any { return supabase; }

const createSchema = z.object({
  name: z.string().min(1),
  template_key: z.string().min(1).regex(/^[a-z0-9_]+$/, "Use lowercase letters, numbers, and underscores"),
  subject: z.string().min(1),
  template_html: z.string().min(1),
  template_text: z.string().optional(),
  trigger_event: z.string().optional(),
  variables: z.array(z.string()).optional(),
  is_active: z.boolean().optional().default(true),
});

export async function GET() {
  try {
    const { error: authError } = await requireAdmin();
    if (authError) return authError;

    const supabase = createAdminClient();
    const { data, error } = await db(supabase)
      .from("email_templates")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json(data ?? []);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { error: authError } = await requireAdmin();
    if (authError) return authError;

    const body = await request.json();
    const parsed = createSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const supabase = createAdminClient();
    const dbAny = db(supabase);

    // Check key uniqueness
    const { data: existing } = await dbAny
      .from("email_templates")
      .select("id")
      .eq("template_key", parsed.data.template_key)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: `Template key "${parsed.data.template_key}" already exists` },
        { status: 409 },
      );
    }

    const { data, error } = await dbAny
      .from("email_templates")
      .insert({
        ...parsed.data,
        variables: parsed.data.variables ?? [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

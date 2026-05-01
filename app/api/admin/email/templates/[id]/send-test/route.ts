/**
 * app/api/admin/email/templates/[id]/send-test/route.ts
 *
 * Send a test email using a specific template with dummy data.
 */
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/security/requireAdmin";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/services/email.service";

type Params = { params: Promise<{ id: string }> };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function db(supabase: any): any { return supabase; }

const DUMMY_VARIABLES: Record<string, string> = {
  "user.name": "Test User",
  "user.email": "test@example.com",
  "course.title": "Sample Course",
  "course.id": "abc123",
  "invoice.amount": "$99.00",
  "invoice.date": new Date().toLocaleDateString(),
  link: "https://hbmacademy.com/reset-password?token=test",
  otp: "123456",
  platform_name: "HBM Academy",
  platform_url: "https://hbmacademy.com",
  "lesson.title": "Introduction to the Course",
};

function renderTemplate(template: string, vars: Record<string, string>): string {
  return template.replace(/\{\{([^}]+)\}\}/g, (_, key) => {
    return vars[key.trim()] ?? `[${key.trim()}]`;
  });
}

export async function POST(request: Request, { params }: Params) {
  try {
    const { user, error: authError } = await requireAdmin();
    if (authError) return authError;

    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const toEmail = (body as { to?: string }).to ?? user?.email;

    if (!toEmail) {
      return NextResponse.json({ error: "No recipient email" }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { data: template, error: tErr } = await db(supabase)
      .from("email_templates")
      .select("*")
      .eq("id", id)
      .single();

    if (tErr || !template) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    // Fetch real platform name so the test email looks accurate
    const { data: nameRow } = await (supabase
      .from("platform_settings")
      .select("setting_value")
      .eq("setting_key", "platform_name")
      .single() as any);
    const platformName = (nameRow?.setting_value as string) || "HBM Academy";

    const vars = { ...DUMMY_VARIABLES, platform_name: platformName };

    const subject = `[TEST] ${renderTemplate(template.subject as string, vars)}`;
    const html = renderTemplate(template.template_html as string, vars);
    const text = template.template_text
      ? renderTemplate(template.template_text as string, vars)
      : undefined;

    const result = await sendEmail({
      to: toEmail,
      subject,
      html,
      text,
      userId: user?.id,
      templateKey: template.template_key as string,
    });

    return NextResponse.json(result, { status: result.success ? 200 : 400 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

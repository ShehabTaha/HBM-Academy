/**
 * app/api/admin/email/test/route.ts
 *
 * Send a test email to verify provider configuration.
 */
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/security/requireAdmin";
import { sendTestEmail, getEmailConfig, EmailConfig } from "@/lib/services/email.service";
import { z } from "zod";

const schema = z.object({
  to: z.string().email(),
  config: z
    .object({
      provider: z.enum(["sendgrid", "smtp", "resend"]).optional(),
      apiKey: z.string().optional(),
      smtpHost: z.string().optional(),
      smtpPort: z.number().optional(),
      smtpUser: z.string().optional(),
      smtpPass: z.string().optional(),
      smtpSecure: z.boolean().optional(),
      fromName: z.string().optional(),
      fromEmail: z.string().email().optional(),
    })
    .optional(),
});

export async function POST(request: Request) {
  try {
    const { user, error: authError } = await requireAdmin();
    if (authError) return authError;

    const body = await request.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { to, config: overrideConfig } = parsed.data;

    let configToUse: EmailConfig | undefined = undefined;
    if (overrideConfig && Object.keys(overrideConfig).length > 0) {
      const baseConfig = await getEmailConfig();
      configToUse = { ...baseConfig, ...overrideConfig } as EmailConfig;
    }

    const result = await sendTestEmail(to, configToUse);

    return NextResponse.json(result, { status: result.success ? 200 : 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

/**
 * lib/services/email.service.ts
 *
 * Production email service layer.
 * Supports SendGrid, SMTP, Resend (extensible).
 * Uses DB-stored config and templates. Logs all sends.
 */
import nodemailer from "nodemailer";
import { createAdminClient } from "@/lib/supabase/admin";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface EmailConfig {
  provider: "sendgrid" | "smtp" | "resend";
  apiKey?: string;
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smtpPass?: string;
  smtpSecure?: boolean;
  fromName: string;
  fromEmail: string;
}

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  userId?: string;
  templateKey?: string;
}

export interface TriggerEmailOptions {
  event: EmailEventType;
  to: string;
  variables: Record<string, string>;
  userId?: string;
}

export type EmailEventType =
  | "user_registered"
  | "course_purchased"
  | "payment_failed"
  | "lesson_completed"
  | "password_reset"
  | "otp_verification"
  | "welcome"
  | "course_completed";

// ─── DB accessor (bypasses type-checker for new tables) ──────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function db(supabase: ReturnType<typeof createAdminClient>): any {
  return supabase as any;
}

// ─── Config fetcher ──────────────────────────────────────────────────────────

/**
 * Fetch email configuration from DB.
 * Falls back to environment variables if not configured in DB.
 */
export async function getEmailConfig(): Promise<EmailConfig> {
  try {
    const supabase = createAdminClient();
    const { data: rows } = await supabase
      .from("platform_settings")
      .select("setting_key, setting_value")
      .in("setting_key", [
        "email_provider",
        "email_api_key",
        "email_from_name",
        "email_from_address",
        "email_smtp_host",
        "email_smtp_port",
        "email_smtp_user",
        "email_smtp_pass",
        "email_smtp_secure",
      ]);

    const map: Record<string, unknown> = {};
    rows?.forEach((r: { setting_key: string; setting_value: unknown }) => {
      map[r.setting_key] = r.setting_value;
    });

    return {
      provider: (map["email_provider"] as EmailConfig["provider"]) ?? "smtp",
      apiKey: (map["email_api_key"] as string) ?? undefined,
      smtpHost: (map["email_smtp_host"] as string) ?? process.env.SMTP_HOST,
      smtpPort: (map["email_smtp_port"] as number) ?? Number(process.env.SMTP_PORT ?? 465),
      smtpUser: (map["email_smtp_user"] as string) ?? process.env.SMTP_USER,
      smtpPass: (map["email_smtp_pass"] as string) ?? process.env.SMTP_PASS,
      smtpSecure: (map["email_smtp_secure"] as boolean) ?? process.env.SMTP_SECURE === "true",
      fromName: (map["email_from_name"] as string) ?? "HBM Academy",
      fromEmail:
        (map["email_from_address"] as string) ??
        process.env.SMTP_USER ??
        "noreply@hbmacademy.com",
    };
  } catch {
    // Fall back to env vars if DB is unavailable
    return {
      provider: "smtp",
      smtpHost: process.env.SMTP_HOST,
      smtpPort: Number(process.env.SMTP_PORT ?? 465),
      smtpUser: process.env.SMTP_USER,
      smtpPass: process.env.SMTP_PASS,
      smtpSecure: process.env.SMTP_SECURE === "true",
      fromName: "HBM Academy",
      fromEmail: process.env.SMTP_USER ?? "noreply@hbmacademy.com",
    };
  }
}

// ─── Transporter factory ─────────────────────────────────────────────────────

function createTransporter(config: EmailConfig): nodemailer.Transporter {
  if (config.provider === "sendgrid") {
    return nodemailer.createTransport({
      host: "smtp.sendgrid.net",
      port: 587,
      secure: false,
      auth: { user: "apikey", pass: config.apiKey },
    });
  }
  // SMTP / Resend (Resend uses SMTP interface)
  return nodemailer.createTransport({
    host: config.smtpHost,
    port: config.smtpPort ?? 465,
    secure: config.smtpSecure ?? true,
    auth: {
      user: config.smtpUser,
      pass: config.smtpPass,
    },
  });
}

// ─── Template engine ─────────────────────────────────────────────────────────

/** Replace {{variable}} placeholders with actual values */
function renderTemplate(template: string, variables: Record<string, string>): string {
  return template.replace(/\{\{([^}]+)\}\}/g, (_, key) => {
    const val = variables[key.trim()];
    return val !== undefined ? val : `{{${key}}}`;
  });
}

/**
 * Fetch the platform name from DB settings.
 * Falls back to "HBM Academy" if not set.
 */
async function getPlatformName(): Promise<string> {
  try {
    const supabase = createAdminClient();
    const { data } = await (supabase
      .from("platform_settings")
      .select("setting_value")
      .eq("setting_key", "platform_name")
      .single() as any);
    return (data?.setting_value as string) || "HBM Academy";
  } catch {
    return "HBM Academy";
  }
}

// ─── Logging helper ──────────────────────────────────────────────────────────

async function logEmail(opts: {
  to: string;
  subject: string;
  templateKey?: string;
  userId?: string;
  status: "sent" | "failed";
  errorMessage?: string;
  provider: string;
}) {
  try {
    const supabase = createAdminClient();
    await db(supabase).from("email_logs").insert({
      recipient: opts.to,
      subject: opts.subject,
      template_key: opts.templateKey ?? null,
      user_id: opts.userId ?? null,
      status: opts.status,
      error_message: opts.errorMessage ?? null,
      provider: opts.provider,
      sent_at: new Date().toISOString(),
    });
  } catch (err) {
    console.error("[EmailService] Failed to log email:", err);
  }
}

// ─── Main send function ──────────────────────────────────────────────────────

/**
 * Send an email using the current DB-configured provider.
 * Logs success/failure to the email_logs table.
 */
export async function sendEmail(
  opts: SendEmailOptions,
): Promise<{ success: boolean; error?: string }> {
  const config = await getEmailConfig();
  const transporter = createTransporter(config);
  const fromAddress = `${config.fromName} <${config.fromEmail}>`;

  try {
    await transporter.sendMail({
      from: fromAddress,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
      text: opts.text,
    });

    await logEmail({
      to: opts.to,
      subject: opts.subject,
      templateKey: opts.templateKey,
      userId: opts.userId,
      status: "sent",
      provider: config.provider,
    });

    return { success: true };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error("[EmailService] Send failed:", errorMessage);

    await logEmail({
      to: opts.to,
      subject: opts.subject,
      templateKey: opts.templateKey,
      userId: opts.userId,
      status: "failed",
      errorMessage,
      provider: config.provider,
    });

    return { success: false, error: errorMessage };
  }
}

// ─── Automation engine ───────────────────────────────────────────────────────

/**
 * Trigger an email by event type.
 * Looks up the matching active template, renders variables, and sends.
 */
export async function triggerEmail(
  opts: TriggerEmailOptions,
): Promise<{ success: boolean; error?: string }> {
  const { event, to, variables, userId } = opts;

  try {
    const supabase = createAdminClient();
    const { data: template } = await db(supabase)
      .from("email_templates")
      .select("*")
      .eq("trigger_event", event)
      .eq("is_active", true)
      .single();

    if (!template) {
      console.warn(`[EmailService] No active template for event: ${event}`);
      return { success: false, error: `No active template for event: ${event}` };
    }

    // Always inject platform_name automatically
    const platformName = await getPlatformName();
    const enrichedVars = { platform_name: platformName, ...variables };

    const subject = renderTemplate(template.subject as string, enrichedVars);
    const html = renderTemplate(template.template_html as string, enrichedVars);
    const text = template.template_text
      ? renderTemplate(template.template_text as string, enrichedVars)
      : undefined;

    return sendEmail({
      to,
      subject,
      html,
      text,
      userId,
      templateKey: template.template_key as string,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Trigger email failed";
    return { success: false, error: msg };
  }
}

/**
 * Test the email configuration by sending a test email.
 */
export async function sendTestEmail(
  to: string,
  config?: EmailConfig,
): Promise<{ success: boolean; error?: string }> {
  const emailConfig = config ?? (await getEmailConfig());
  const transporter = createTransporter(emailConfig);

  try {
    await transporter.verify();
    await transporter.sendMail({
      from: `${emailConfig.fromName} <${emailConfig.fromEmail}>`,
      to,
      subject: "HBM Academy – Email Configuration Test",
      html: buildTestEmailHTML(emailConfig.fromName),
      text: "This is a test email from HBM Academy to verify your email configuration.",
    });
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Test send failed";
    return { success: false, error: msg };
  }
}

// ─── Email HTML builders ──────────────────────────────────────────────────────

export function buildTestEmailHTML(platformName: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <style>
    body { font-family: Arial, sans-serif; background: #f9fafb; margin: 0; padding: 0; }
    .container { max-width: 520px; margin: 40px auto; background: #fff; border-radius: 12px; border: 1px solid #e5e7eb; overflow: hidden; }
    .header { background: linear-gradient(135deg, #2563eb, #1d4ed8); padding: 32px; text-align: center; }
    .header h1 { color: #fff; font-size: 24px; margin: 0; }
    .body { padding: 32px; }
    .success-box { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 20px; text-align: center; margin: 24px 0; }
    .footer { background: #f9fafb; padding: 16px 32px; text-align: center; font-size: 12px; color: #9ca3af; border-top: 1px solid #e5e7eb; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header"><h1>${platformName}</h1></div>
    <div class="body">
      <p style="color:#374151;font-size:16px;">Email Configuration Test ✅</p>
      <div class="success-box">
        <p style="color:#166534;font-weight:bold;margin:0;">Your email provider is working correctly!</p>
      </div>
      <p style="color:#6b7280;font-size:14px;">This test email was sent from the HBM Academy admin panel.</p>
    </div>
    <div class="footer">${platformName} · Automated message, do not reply.</div>
  </div>
</body>
</html>`.trim();
}

export function buildOTPEmailHTML(otp: string, purpose: string): string {
  const label =
    purpose === "primary_change"
      ? "change your primary email address"
      : "add a notification email address";

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <style>
    body { font-family: Arial, sans-serif; background: #f9fafb; margin: 0; padding: 0; }
    .container { max-width: 520px; margin: 40px auto; background: #fff; border-radius: 12px; border: 1px solid #e5e7eb; overflow: hidden; }
    .header { background: linear-gradient(135deg, #2563eb, #1d4ed8); padding: 32px; text-align: center; }
    .header h1 { color: #fff; font-size: 24px; margin: 0; }
    .body { padding: 32px; }
    .otp-box { background: #f3f4f6; border-radius: 8px; padding: 20px; text-align: center; margin: 24px 0; }
    .otp { font-size: 40px; font-weight: bold; letter-spacing: 12px; color: #1e293b; }
    .footer { background: #f9fafb; padding: 16px 32px; text-align: center; font-size: 12px; color: #9ca3af; border-top: 1px solid #e5e7eb; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header"><h1>HBM Academy</h1></div>
    <div class="body">
      <p style="color:#374151;font-size:16px;">Hi there,</p>
      <p style="color:#374151;">You requested to ${label}. Use the verification code below:</p>
      <div class="otp-box"><div class="otp">${otp}</div></div>
      <p style="color:#6b7280;font-size:14px;">This code expires in <strong>10 minutes</strong>. If you did not request this, please ignore this email.</p>
    </div>
    <div class="footer">HBM Academy · This is an automated message, please do not reply.</div>
  </div>
</body>
</html>`.trim();
}

-- ============================================================
-- Migration: Stripe & Email Infrastructure
-- Created:   2026-04-30
-- Purpose:   Add stripe_events, email_logs tables and
--            extend email_templates with trigger_event + name.
-- ============================================================

-- ─── 1. Extend email_templates ──────────────────────────────
ALTER TABLE IF EXISTS email_templates
  ADD COLUMN IF NOT EXISTS name TEXT,
  ADD COLUMN IF NOT EXISTS trigger_event TEXT;

-- Index for fast event lookups (used by automation engine)
CREATE INDEX IF NOT EXISTS idx_email_templates_trigger_event
  ON email_templates (trigger_event)
  WHERE is_active = TRUE;

-- ─── 2. stripe_events (idempotency + audit log) ─────────────
CREATE TABLE IF NOT EXISTS stripe_events (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_event_id TEXT UNIQUE NOT NULL,
  event_type      TEXT NOT NULL,
  status          TEXT NOT NULL DEFAULT 'received', -- received | processing | processed | failed
  payload         JSONB,
  user_id         UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  course_id       UUID,
  amount          BIGINT,         -- in cents
  currency        TEXT,
  error_message   TEXT,
  processed_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_stripe_events_status   ON stripe_events (status);
CREATE INDEX IF NOT EXISTS idx_stripe_events_user_id  ON stripe_events (user_id);
CREATE INDEX IF NOT EXISTS idx_stripe_events_type     ON stripe_events (event_type);
CREATE INDEX IF NOT EXISTS idx_stripe_events_created  ON stripe_events (created_at DESC);

-- RLS
ALTER TABLE stripe_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view stripe events"
  ON stripe_events FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Service role can insert/update (used by webhook)
CREATE POLICY "Service role manages stripe events"
  ON stripe_events FOR ALL TO service_role
  USING (TRUE) WITH CHECK (TRUE);

-- ─── 3. email_logs ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS email_logs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient     TEXT NOT NULL,
  subject       TEXT NOT NULL,
  template_key  TEXT,
  user_id       UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status        TEXT NOT NULL DEFAULT 'sent', -- sent | failed
  provider      TEXT NOT NULL DEFAULT 'smtp',
  error_message TEXT,
  sent_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_logs_status       ON email_logs (status);
CREATE INDEX IF NOT EXISTS idx_email_logs_user_id      ON email_logs (user_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_template_key ON email_logs (template_key);
CREATE INDEX IF NOT EXISTS idx_email_logs_sent_at      ON email_logs (sent_at DESC);

-- RLS
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view email logs"
  ON email_logs FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

CREATE POLICY "Service role manages email logs"
  ON email_logs FOR ALL TO service_role
  USING (TRUE) WITH CHECK (TRUE);

-- ─── 4. Extend enrollments table ────────────────────────────
ALTER TABLE IF EXISTS enrollments
  ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'free',  -- free | paid | refunded
  ADD COLUMN IF NOT EXISTS stripe_session_id TEXT,
  ADD COLUMN IF NOT EXISTS amount_paid BIGINT;

-- ─── 5. Seed default email templates with trigger_events ────
INSERT INTO email_templates (template_key, name, subject, template_html, template_text, variables, trigger_event, is_active)
VALUES
  (
    'welcome_email',
    'Welcome Email',
    'Welcome to {{platform_name}}!',
    '<!DOCTYPE html><html><head><meta charset="utf-8"/></head><body style="font-family:Arial,sans-serif;background:#f9fafb;margin:0;padding:0;"><div style="max-width:520px;margin:40px auto;background:#fff;border-radius:12px;border:1px solid #e5e7eb;overflow:hidden;"><div style="background:linear-gradient(135deg,#2563eb,#1d4ed8);padding:32px;text-align:center;"><h1 style="color:#fff;font-size:24px;margin:0;">{{platform_name}}</h1></div><div style="padding:32px;"><h2 style="color:#111827;">Welcome, {{user.name}}! 🎉</h2><p style="color:#374151;">You''ve successfully joined {{platform_name}}. Start exploring your courses and begin your learning journey today.</p><a href="{{platform_url}}" style="display:inline-block;background:#2563eb;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;margin-top:16px;">Go to Dashboard</a></div><div style="background:#f9fafb;padding:16px 32px;text-align:center;font-size:12px;color:#9ca3af;border-top:1px solid #e5e7eb;">{{platform_name}} · Automated message, do not reply.</div></div></body></html>',
    'Welcome to {{platform_name}}, {{user.name}}! Start your learning journey today.',
    '["user.name", "user.email", "platform_name", "platform_url"]',
    'user_registered',
    TRUE
  ),
  (
    'course_purchased',
    'Course Purchase Confirmation',
    'You''re enrolled in {{course.title}}!',
    '<!DOCTYPE html><html><head><meta charset="utf-8"/></head><body style="font-family:Arial,sans-serif;background:#f9fafb;margin:0;padding:0;"><div style="max-width:520px;margin:40px auto;background:#fff;border-radius:12px;border:1px solid #e5e7eb;overflow:hidden;"><div style="background:linear-gradient(135deg,#2563eb,#1d4ed8);padding:32px;text-align:center;"><h1 style="color:#fff;font-size:24px;margin:0;">{{platform_name}}</h1></div><div style="padding:32px;"><h2 style="color:#111827;">Purchase Confirmed! ✅</h2><p style="color:#374151;">Hi {{user.name}},</p><p style="color:#374151;">You are now enrolled in <strong>{{course.title}}</strong>.</p><div style="background:#f3f4f6;border-radius:8px;padding:16px;margin:20px 0;"><p style="margin:0;color:#374151;"><strong>Amount:</strong> {{invoice.amount}}</p></div><a href="{{platform_url}}" style="display:inline-block;background:#2563eb;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;margin-top:8px;">Start Learning</a></div><div style="background:#f9fafb;padding:16px 32px;text-align:center;font-size:12px;color:#9ca3af;border-top:1px solid #e5e7eb;">{{platform_name}} · Automated message, do not reply.</div></div></body></html>',
    'Hi {{user.name}}, you are now enrolled in {{course.title}}. Amount: {{invoice.amount}}.',
    '["user.name", "user.email", "course.title", "invoice.amount", "platform_name", "platform_url"]',
    'course_purchased',
    TRUE
  ),
  (
    'password_reset',
    'Password Reset',
    'Reset your {{platform_name}} password',
    '<!DOCTYPE html><html><head><meta charset="utf-8"/></head><body style="font-family:Arial,sans-serif;background:#f9fafb;margin:0;padding:0;"><div style="max-width:520px;margin:40px auto;background:#fff;border-radius:12px;border:1px solid #e5e7eb;overflow:hidden;"><div style="background:linear-gradient(135deg,#2563eb,#1d4ed8);padding:32px;text-align:center;"><h1 style="color:#fff;font-size:24px;margin:0;">{{platform_name}}</h1></div><div style="padding:32px;"><h2 style="color:#111827;">Reset Your Password</h2><p style="color:#374151;">Click the button below to reset your password. This link expires in 15 minutes.</p><a href="{{link}}" style="display:inline-block;background:#2563eb;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;margin-top:16px;">Reset Password</a><p style="color:#6b7280;font-size:13px;margin-top:20px;">If you did not request a password reset, please ignore this email.</p></div><div style="background:#f9fafb;padding:16px 32px;text-align:center;font-size:12px;color:#9ca3af;border-top:1px solid #e5e7eb;">{{platform_name}} · Automated message, do not reply.</div></div></body></html>',
    'Click this link to reset your password: {{link}}. Expires in 15 minutes.',
    '["user.name", "link", "platform_name"]',
    'password_reset',
    TRUE
  ),
  (
    'payment_failed',
    'Payment Failed',
    'Payment issue for {{course.title}}',
    '<!DOCTYPE html><html><head><meta charset="utf-8"/></head><body style="font-family:Arial,sans-serif;background:#f9fafb;margin:0;padding:0;"><div style="max-width:520px;margin:40px auto;background:#fff;border-radius:12px;border:1px solid #e5e7eb;overflow:hidden;"><div style="background:linear-gradient(135deg,#dc2626,#b91c1c);padding:32px;text-align:center;"><h1 style="color:#fff;font-size:24px;margin:0;">{{platform_name}}</h1></div><div style="padding:32px;"><h2 style="color:#111827;">Payment Failed ❌</h2><p style="color:#374151;">Hi {{user.name}},</p><p style="color:#374151;">We were unable to process your payment for <strong>{{course.title}}</strong>. Please update your payment method and try again.</p><a href="{{platform_url}}" style="display:inline-block;background:#2563eb;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;margin-top:16px;">Try Again</a></div><div style="background:#f9fafb;padding:16px 32px;text-align:center;font-size:12px;color:#9ca3af;border-top:1px solid #e5e7eb;">{{platform_name}} · Automated message, do not reply.</div></div></body></html>',
    'Hi {{user.name}}, payment failed for {{course.title}}. Please try again.',
    '["user.name", "user.email", "course.title", "platform_name", "platform_url"]',
    'payment_failed',
    TRUE
  ),
  (
    'lesson_completed',
    'Lesson Completed',
    'Great job completing "{{lesson.title}}"!',
    '<!DOCTYPE html><html><head><meta charset="utf-8"/></head><body style="font-family:Arial,sans-serif;background:#f9fafb;margin:0;padding:0;"><div style="max-width:520px;margin:40px auto;background:#fff;border-radius:12px;border:1px solid #e5e7eb;overflow:hidden;"><div style="background:linear-gradient(135deg,#059669,#047857);padding:32px;text-align:center;"><h1 style="color:#fff;font-size:24px;margin:0;">{{platform_name}}</h1></div><div style="padding:32px;"><h2 style="color:#111827;">Lesson Completed! 🎓</h2><p style="color:#374151;">Great job, {{user.name}}! You have completed <strong>{{lesson.title}}</strong> in <strong>{{course.title}}</strong>. Keep it up!</p><a href="{{platform_url}}" style="display:inline-block;background:#059669;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;margin-top:16px;">Continue Learning</a></div><div style="background:#f9fafb;padding:16px 32px;text-align:center;font-size:12px;color:#9ca3af;border-top:1px solid #e5e7eb;">{{platform_name}} · Automated message, do not reply.</div></div></body></html>',
    'Great job, {{user.name}}! You completed {{lesson.title}} in {{course.title}}.',
    '["user.name", "lesson.title", "course.title", "platform_name", "platform_url"]',
    'lesson_completed',
    FALSE
  )
ON CONFLICT (template_key) DO UPDATE
  SET
    name = EXCLUDED.name,
    trigger_event = EXCLUDED.trigger_event,
    updated_at = NOW();

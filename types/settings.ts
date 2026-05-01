export interface PlatformSettings {
  // General
  platform_name: string;
  platform_url: string;
  platform_logo_url?: string;
  platform_favicon_url?: string;
  platform_description?: string;
  terms_of_service_url?: string;
  privacy_policy_url?: string;
  support_email?: string;
  support_url?: string;
  theme_color?: string;

  // Payment
  stripe_publishable_key?: string;
  stripe_secret_key?: string; // sensitive – masked in GET responses
  stripe_webhook_secret?: string; // sensitive
  payment_currency: string;
  tax_rate?: number;
  minimum_course_price?: number;
  maximum_course_price?: number;

  // Email
  email_provider: "sendgrid" | "smtp" | "resend";
  email_api_key?: string; // sensitive
  email_from_address: string;
  email_from_name: string;
  email_smtp_host?: string;
  email_smtp_port?: number;
  email_smtp_user?: string;
  email_smtp_pass?: string; // sensitive
  email_smtp_secure?: boolean;

  // Course
  default_course_level: "beginner" | "intermediate" | "advanced";
  enable_course_ratings: boolean;
  enable_course_discussions: boolean;
  enable_certificates: boolean;
  certificate_validity_days?: number;

  // Features
  enable_live_classes: boolean;
  enable_forums: boolean;
  enable_api_access: boolean;
  enable_user_referrals?: boolean;
  enable_affiliate_program?: boolean;

  // Moderation
  enable_content_moderation: boolean;
  auto_approve_courses: boolean;

  // Maintenance
  maintenance_mode: boolean;
  maintenance_message?: string;
  scheduled_maintenance_at?: string;
}

export type SettingCategory =
  | "general"
  | "payment"
  | "email"
  | "course"
  | "feature"
  | "moderation"
  | "advanced";

export interface PaymentIntegration {
  id: string;
  provider: "stripe" | "paypal" | "square";
  is_active: boolean;
  test_mode: boolean;
  webhook_url?: string;
  verified_at?: string;
  created_at: string;
  updated_at: string;
}

export interface EmailTemplate {
  id: string;
  template_key: string;
  name?: string;
  subject: string;
  template_html: string;
  template_text?: string;
  variables: string[];
  trigger_event?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface EmailLog {
  id: string;
  recipient: string;
  subject: string;
  template_key?: string;
  user_id?: string;
  status: "sent" | "failed";
  provider: string;
  error_message?: string;
  sent_at: string;
}

export interface StripeEvent {
  id: string;
  stripe_event_id: string;
  event_type: string;
  status: "received" | "processing" | "processed" | "failed";
  user_id?: string;
  course_id?: string;
  amount?: number;
  currency?: string;
  error_message?: string;
  processed_at?: string;
  created_at: string;
}

export interface StripeConnectionStatus {
  connected: boolean;
  verified: boolean;
  test_mode: boolean;
  has_webhook: boolean;
  account?: { type: string } | null;
  message?: string;
  error?: string | null;
}

export interface SettingsResponse {
  [key: string]: string | number | boolean | null | undefined;
}

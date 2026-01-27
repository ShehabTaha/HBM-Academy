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
  stripe_public_key?: string;
  stripe_secret_key?: string; // sensitive
  stripe_webhook_secret?: string; // sensitive
  payment_currency: string;
  tax_rate?: number;
  minimum_course_price?: number;
  maximum_course_price?: number;

  // Email
  email_provider: "sendgrid" | "smtp" | "aws_ses";
  sendgrid_api_key?: string; // sensitive
  email_from_address: string;
  email_from_name: string;

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
  subject: string;
  template_html: string;
  template_text: string;
  variables: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SettingsResponse {
  [key: string]: any;
}

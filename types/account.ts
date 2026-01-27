/**
 * Account-related TypeScript interfaces for HBM Academy
 */

export interface User {
  id: string;
  email: string;
  name: string;
  avatar: string | null;
  bio: string | null;
  role: "student" | "lecturer" | "admin";
  is_email_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  user_id: string;
  phone: string | null;
  location: string | null;
  country: string | null;
  timezone: string;
  language: string;
  date_of_birth: string | null;
  company: string | null;
  job_title: string | null;
  website: string | null;
  social_links: {
    linkedin?: string;
    twitter?: string;
    github?: string;
    website?: string;
  };
  preferences: {
    notification_emails: boolean;
    marketing_emails: boolean;
    newsletter: boolean;
    two_factor_enabled: boolean;
    theme: "light" | "dark" | "auto";
    language: string;
  };
  created_at: string;
  updated_at: string;
}

export interface UserSession {
  id: string;
  user_id: string;
  device_name: string;
  device_type: "desktop" | "mobile" | "tablet";
  browser: string;
  ip_address: string;
  country: string;
  last_activity: string;
  created_at: string;
  expires_at: string;
}

export interface PasswordChangeRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface TwoFactorSetup {
  method: "authenticator" | "sms";
  qrCode?: string;
  secret?: string;
  backupCodes: string[];
}

export type AccountSection =
  | "profile"
  | "personal-details"
  | "email-notifications"
  | "security"
  | "sessions"
  | "data-privacy";

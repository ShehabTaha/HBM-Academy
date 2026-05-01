/**
 * lib/email.ts
 *
 * Backward-compatible re-export from the new email service layer.
 * All callers can continue importing from here without changes.
 *
 * New code should import directly from @/lib/services/email.service
 */
export {
  sendEmail,
  triggerEmail,
  sendTestEmail,
  getEmailConfig,
  buildOTPEmailHTML,
  buildTestEmailHTML,
} from "@/lib/services/email.service";

export type {
  SendEmailOptions,
  TriggerEmailOptions,
  EmailConfig,
  EmailEventType,
} from "@/lib/services/email.service";

import { z } from "zod";

export const notificationFrequencySchema = z.enum([
  "off",
  "immediate",
  "daily",
]);

export const adminNotificationSettingsSchema = z.object({
  recipient_emails: z.array(z.string().email()),
  preferences: z.object({
    // A) Student Activity
    assignment_submission: notificationFrequencySchema.default("immediate"),
    quiz_submission: notificationFrequencySchema.default("immediate"),
    student_report: notificationFrequencySchema.default("immediate"),
    new_student: notificationFrequencySchema.default("immediate"),

    // B) Operations
    csv_import_failed: notificationFrequencySchema.default("immediate"),
    csv_import_success: notificationFrequencySchema.default("off"),
    job_failed: notificationFrequencySchema.default("immediate"),
    analytics_refresh_failed: notificationFrequencySchema.default("daily"),

    // C) Content
    course_published: notificationFrequencySchema.default("daily"),
    video_upload_success: notificationFrequencySchema.default("off"),
    video_upload_failed: notificationFrequencySchema.default("immediate"),

    // D) Security
    new_device_login: notificationFrequencySchema.default("immediate"),
    failed_login_attempts: notificationFrequencySchema.default("immediate"),
    role_change: notificationFrequencySchema.default("immediate"),
    data_export: notificationFrequencySchema.default("daily"),

    // E) Platform
    storage_limit: notificationFrequencySchema.default("daily"),
    error_spike: notificationFrequencySchema.default("immediate"),
  }),
});

export type AdminNotificationSettings = z.infer<
  typeof adminNotificationSettingsSchema
>;
export type NotificationFrequency = z.infer<typeof notificationFrequencySchema>;

import { createClient } from "@/lib/supabase/client";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/types/database.types";

type Certificate = Database["public"]["Tables"]["certificates"]["Row"];
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type CertificateInsert = Database["public"]["Tables"]["certificates"]["Insert"];

/**
 * Certificate service for managing course completion certificates
 */
export class CertificateService {
  /**
   * Generate a unique certificate number
   */
  static generateCertificateNumber(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `CERT-${timestamp}-${random}`;
  }

  /**
   * Generate certificate for completed enrollment
   */
  static async generateCertificate(enrollmentId: string): Promise<{
    certificate?: Certificate;
    error?: string;
  }> {
    try {
      const supabase = createClient();
      const admin = createAdminClient();

      // Get enrollment details
      const { data: enrollmentRaw, error: enrollmentError } = await (
        supabase.from("enrollments") as any
      )
        .select(
          `
          *,
          course:courses (
            id,
            title
          ),
          student:users (
            id,
            name,
            email
          )
        `,
        )
        .eq("id", enrollmentId)
        .single();

      if (enrollmentError) {
        return { error: enrollmentError.message };
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const enrollment = enrollmentRaw as any;

      // Check if enrollment is completed
      if (!enrollment.completed_at) {
        return {
          error: "Course must be completed before generating certificate",
        };
      }

      // Check if certificate already exists
      const { data: existingRaw } = await (supabase.from("certificates") as any)
        .select("*")
        .eq("enrollment_id", enrollmentId)
        .single();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const existing = existingRaw as any;

      if (existing) {
        return { certificate: existing };
      }

      // Generate certificate number
      const certificateNumber = this.generateCertificateNumber();

      // Create certificate record
      const { data: certificateRaw, error } = await (
        admin.from("certificates") as any
      )
        .insert({
          enrollment_id: enrollmentId,
          certificate_number: certificateNumber,
          // certificate_url will be updated after generating the PDF
          certificate_url: null,
        })
        .select()
        .single();

      if (error) {
        return { error: error.message };
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const certificate = certificateRaw as any;

      // TODO: Generate actual PDF certificate and upload to storage
      // For now, we'll just create the database record
      // You can implement PDF generation using libraries like jsPDF or pdfmake

      return { certificate };
    } catch (error) {
      return {
        error:
          error instanceof Error
            ? error.message
            : "Failed to generate certificate",
      };
    }
  }

  /**
   * Get certificate by ID
   */
  static async getCertificate(id: string): Promise<{
    certificate?: Certificate;
    error?: string;
  }> {
    try {
      const supabase = createClient();

      const { data: certificateRaw, error } = await (
        supabase.from("certificates") as any
      )
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        return { error: error.message };
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const certificate = certificateRaw as any;

      return { certificate };
    } catch (error) {
      return {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch certificate",
      };
    }
  }

  /**
   * Get certificates for a user
   */
  static async getUserCertificates(userId: string): Promise<{
    certificates: Certificate[];
    error?: string;
  }> {
    try {
      const supabase = createClient();

      const { data, error } = await (supabase.from("certificates") as any)
        .select(
          `
          *,
          enrollment:enrollments (
            id,
            completed_at,
            course:courses (
              id,
              title,
              image
            )
          )
        `,
        )
        .eq("enrollment.student_id", userId)
        .order("issued_at", { ascending: false });

      if (error) {
        return { certificates: [], error: error.message };
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return { certificates: (data as any) || [] };
    } catch (error) {
      return {
        certificates: [],
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch certificates",
      };
    }
  }

  /**
   * Verify a certificate by certificate number
   */
  static async verifyCertificate(certificateNumber: string): Promise<{
    valid: boolean;
    certificate?: Certificate & {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      enrollment: any;
    };
    error?: string;
  }> {
    try {
      const supabase = createClient();

      const { data: certificateRaw, error } = await (
        supabase.from("certificates") as any
      )
        .select(
          `
          *,
          enrollment:enrollments (
            id,
            completed_at,
            student:users (
              id,
              name,
              email
            ),
            course:courses (
              id,
              title,
              instructor:users (
                id,
                name
              )
            )
          )
        `,
        )
        .eq("certificate_number", certificateNumber)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          return { valid: false };
        }
        return { valid: false, error: error.message };
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const certificate = certificateRaw as any;

      return {
        valid: true,
        certificate,
      };
    } catch (error) {
      return {
        valid: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to verify certificate",
      };
    }
  }

  /**
   * Update certificate URL (after PDF generation)
   */
  static async updateCertificateUrl(
    id: string,
    certificateUrl: string,
  ): Promise<{ certificate?: Certificate; error?: string }> {
    try {
      const admin = createAdminClient();

      const { data: certificateRaw, error } = await (
        admin.from("certificates") as any
      )
        .update({ certificate_url: certificateUrl })
        .eq("id", id)
        .select()
        .single();

      if (error) {
        return { error: error.message };
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const certificate = certificateRaw as any;

      return { certificate };
    } catch (error) {
      return {
        error:
          error instanceof Error
            ? error.message
            : "Failed to update certificate",
      };
    }
  }

  /**
   * Get certificate for enrollment
   */
  static async getCertificateByEnrollment(enrollmentId: string): Promise<{
    certificate?: Certificate;
    error?: string;
  }> {
    try {
      const supabase = createClient();

      const { data: certificateRaw, error } = await (
        supabase.from("certificates") as any
      )
        .select("*")
        .eq("enrollment_id", enrollmentId)
        .single();

      if (error && error.code !== "PGRST116") {
        return { error: error.message };
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const certificate = certificateRaw as any;

      return { certificate: certificate || undefined };
    } catch (error) {
      return {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch certificate",
      };
    }
  }

  /**
   * Check if enrollment has certificate
   */
  static async hasCertificate(enrollmentId: string): Promise<boolean> {
    const { certificate } = await this.getCertificateByEnrollment(enrollmentId);
    return !!certificate;
  }
}

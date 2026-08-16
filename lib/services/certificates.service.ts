/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from "@/lib/supabase/client";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/types/database.types";
import { jsPDF } from "jspdf";
import { sendEmail } from "@/lib/services/email.service";

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

      const certificate = certificateRaw as any;

      // Generate actual PDF certificate
      const doc = new jsPDF("landscape");
      doc.setFontSize(26);
      doc.text("Certificate of Completion", 148.5, 60, { align: "center" });
      doc.setFontSize(18);
      doc.text(`Awarded to: ${enrollment.student?.name || enrollment.student?.email || "Student"}`, 148.5, 90, { align: "center" });
      doc.text(`For successfully completing the course:`, 148.5, 110, { align: "center" });
      doc.setFontSize(22);
      doc.text(enrollment.course?.title || "Course", 148.5, 130, { align: "center" });
      doc.setFontSize(12);
      doc.text(`Date: ${new Date().toLocaleDateString()}`, 148.5, 160, { align: "center" });
      doc.text(`Certificate No: ${certificateNumber}`, 148.5, 170, { align: "center" });

      const pdfArrayBuffer = doc.output("arraybuffer");
      const fileName = `${enrollmentId}_${certificateNumber}.pdf`;

      const { error: uploadError } = await admin.storage
        .from("certificates")
        .upload(fileName, pdfArrayBuffer, {
          contentType: "application/pdf",
          upsert: true,
        });

      if (uploadError) {
        console.error("Failed to upload PDF:", uploadError);
      } else {
        const { data: publicUrlData } = admin.storage
          .from("certificates")
          .getPublicUrl(fileName);
        
        const certificateUrl = publicUrlData.publicUrl;
        
        await (admin.from("certificates") as any)
          .update({ certificate_url: certificateUrl })
          .eq("id", certificate.id);
          
        certificate.certificate_url = certificateUrl;
      }

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

  static async listStudentCertificates(studentId: string): Promise<{
    certificates: any[];
    error?: string;
  }> {
    try {
      const admin = createAdminClient();
      const { data, error } = await (admin.from("certificates") as any)
        .select(
          `
          *,
          enrollment:enrollments(
            id,
            student_id,
            completed_at,
            course:courses(id,title,image)
          )
        `,
        )
        .eq("enrollment.student_id", studentId)
        .order("issued_at", { ascending: false });

      if (error) return { certificates: [], error: error.message };
      return {
        certificates: (data ?? []).filter(
          (certificate: any) => certificate.enrollment?.student_id === studentId,
        ),
      };
    } catch (error) {
      return {
        certificates: [],
        error: error instanceof Error ? error.message : "Failed to fetch certificates",
      };
    }
  }

  static async generateForStudentCourse(params: {
    studentId: string;
    courseId: string;
  }): Promise<{ certificate?: any; error?: string; status?: number }> {
    try {
      const admin = createAdminClient();
      const { data: enrollment } = await (admin.from("enrollments") as any)
        .select(
          `
          *,
          course:courses(id,title),
          student:users(id,name,email)
        `,
        )
        .eq("student_id", params.studentId)
        .eq("course_id", params.courseId)
        .maybeSingle();

      if (!enrollment) return { error: "Enrollment not found", status: 404 };
      if (!enrollment.completed_at && enrollment.progress_percentage < 100) {
        return { error: "Course is not complete yet.", status: 403 };
      }

      const { data: existing } = await (admin.from("certificates") as any)
        .select("*")
        .eq("enrollment_id", enrollment.id)
        .maybeSingle();
      if (existing) return { certificate: existing };

      const certificateNumber = this.generateCertificateNumber();
      const shareToken = crypto.randomUUID();
      const doc = new jsPDF("landscape");

      doc.setFillColor(246, 248, 251);
      doc.rect(0, 0, 297, 210, "F");
      doc.setDrawColor(72, 98, 245);
      doc.setLineWidth(2);
      doc.rect(12, 12, 273, 186);
      doc.setFontSize(28);
      doc.text("HBM Academy", 148.5, 45, { align: "center" });
      doc.setFontSize(24);
      doc.text("Certificate of Completion", 148.5, 70, { align: "center" });
      doc.setFontSize(16);
      doc.text("This certifies that", 148.5, 92, { align: "center" });
      doc.setFontSize(26);
      doc.text(enrollment.student?.name || enrollment.student?.email || "Student", 148.5, 112, {
        align: "center",
      });
      doc.setFontSize(16);
      doc.text("has successfully completed", 148.5, 132, { align: "center" });
      doc.setFontSize(22);
      doc.text(enrollment.course?.title || "Course", 148.5, 150, { align: "center" });
      doc.setFontSize(11);
      doc.text(`Issued: ${new Date().toLocaleDateString()}`, 148.5, 174, {
        align: "center",
      });
      doc.text(`Certificate No: ${certificateNumber}`, 148.5, 182, { align: "center" });

      const fileName = `${params.studentId}/${enrollment.id}_${certificateNumber}.pdf`;
      const upload = await admin.storage
        .from("certificates")
        .upload(fileName, doc.output("arraybuffer"), {
          contentType: "application/pdf",
          upsert: true,
        });

      if (upload.error) return { error: upload.error.message, status: 500 };

      const { data: publicUrlData } = admin.storage
        .from("certificates")
        .getPublicUrl(fileName);

      const { data: certificate, error } = await (admin.from("certificates") as any)
        .insert({
          enrollment_id: enrollment.id,
          certificate_number: certificateNumber,
          certificate_url: publicUrlData.publicUrl,
          share_token: shareToken,
          pdf_url: publicUrlData.publicUrl,
        })
        .select()
        .single();

      if (error) return { error: error.message, status: 500 };
      if (enrollment.student?.email) {
        sendEmail({
          to: enrollment.student.email,
          subject: "Your HBM Academy certificate is ready",
          html: `<p>Hi ${enrollment.student?.name ?? "there"},</p><p>Your certificate for <strong>${enrollment.course?.title}</strong> is ready.</p><p><a href="${publicUrlData.publicUrl}">Download your certificate</a></p>`,
          text: `Your certificate for ${enrollment.course?.title} is ready: ${publicUrlData.publicUrl}`,
          userId: params.studentId,
          templateKey: "certificate_issued",
        }).catch(() => undefined);
      }

      return { certificate };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : "Failed to generate certificate",
        status: 500,
      };
    }
  }

  static async getByShareToken(shareToken: string): Promise<{
    certificate?: any;
    error?: string;
  }> {
    try {
      const admin = createAdminClient();
      const { data, error } = await (admin.from("certificates") as any)
        .select(
          `
          *,
          enrollment:enrollments(
            completed_at,
            student:users(name),
            course:courses(title,description,image)
          )
        `,
        )
        .eq("share_token", shareToken)
        .maybeSingle();

      if (error) return { error: error.message };
      return { certificate: data ?? undefined };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : "Failed to fetch certificate",
      };
    }
  }
}

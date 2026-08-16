import Image from "next/image";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CertificateService } from "@/lib/services/certificates.service";
import { Award, Download } from "lucide-react";

export default async function PublicCertificatePage({
  params,
}: {
  params: Promise<{ shareToken: string }>;
}) {
  const { shareToken } = await params;
  const { certificate } = await CertificateService.getByShareToken(shareToken);
  if (!certificate) notFound();

  const enrollment = certificate.enrollment;
  const pdfUrl = certificate.pdf_url || certificate.certificate_url;

  return (
    <main className="min-h-screen bg-app-bg">
      <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <div className="rounded-lg border bg-white p-8 text-center">
          <Image src="/logo.svg" alt="HBM Academy" width={56} height={56} className="mx-auto" />
          <Award className="mx-auto mt-8 h-12 w-12 text-primary" />
          <h1 className="mt-4 text-3xl font-semibold">Verified Certificate</h1>
          <p className="mt-3 text-muted-foreground">
            HBM Academy confirms this certificate was issued to
          </p>
          <p className="mt-4 text-2xl font-semibold">
            {enrollment?.student?.name ?? "Student"}
          </p>
          <p className="mt-3 text-muted-foreground">for completing</p>
          <p className="mt-4 text-2xl font-semibold">
            {enrollment?.course?.title ?? "Course"}
          </p>
          <div className="mt-8 grid gap-3 text-sm text-muted-foreground sm:grid-cols-3">
            <div>Certificate No: {certificate.certificate_number}</div>
            <div>Issued: {new Date(certificate.issued_at).toLocaleDateString()}</div>
            <div>Completed: {new Date(enrollment?.completed_at).toLocaleDateString()}</div>
          </div>
          {pdfUrl ? (
            <Button asChild className="mt-8">
              <a href={pdfUrl} target="_blank" rel="noreferrer">
                <Download className="h-4 w-4" />
                Download PDF
              </a>
            </Button>
          ) : null}
        </div>
      </section>
    </main>
  );
}

import { redirect } from "next/navigation";
import { CertificateCard } from "@/components/student/CertificateCard";
import { EmptyState } from "@/components/student/EmptyState";
import { getCurrentStudent } from "@/lib/services/student.service";
import { CertificateService } from "@/lib/services/certificates.service";

export default async function CertificatesPage() {
  const student = await getCurrentStudent();
  if (!student) redirect("/auth/login");
  const { certificates } = await CertificateService.listStudentCertificates(student.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Certificates</h1>
        <p className="mt-2 text-muted-foreground">
          Completed course certificates will appear here.
        </p>
      </div>
      {certificates.length === 0 ? (
        <EmptyState
          title="No certificates yet"
          description="Complete every lesson in a course to earn a certificate."
          action={{ href: "/courses", label: "Browse courses" }}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {certificates.map((certificate) => (
            <CertificateCard key={certificate.id} certificate={certificate} />
          ))}
        </div>
      )}
    </div>
  );
}

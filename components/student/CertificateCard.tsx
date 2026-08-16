import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Award, Download, Share2 } from "lucide-react";

export function CertificateCard({ certificate }: { certificate: any }) {
  const course = certificate.enrollment?.course;
  const shareHref = certificate.share_token ? `/c/${certificate.share_token}` : null;
  const pdfUrl = certificate.pdf_url || certificate.certificate_url;

  return (
    <Card className="rounded-lg bg-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5 text-primary" />
          {course?.title ?? "Certificate"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Certificate No: {certificate.certificate_number}
        </p>
        <p className="text-sm text-muted-foreground">
          Issued {new Date(certificate.issued_at).toLocaleDateString()}
        </p>
        <div className="flex flex-wrap gap-2">
          {pdfUrl ? (
            <Button asChild variant="outline">
              <a href={pdfUrl} target="_blank" rel="noreferrer">
                <Download className="h-4 w-4" />
                Download
              </a>
            </Button>
          ) : null}
          {shareHref ? (
            <Button asChild>
              <Link href={shareHref}>
                <Share2 className="h-4 w-4" />
                Share
              </Link>
            </Button>
          ) : null}
          <Button asChild variant="outline">
            <a
              href={`https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=${encodeURIComponent(
                course?.title ?? "HBM Academy Certificate",
              )}&organizationName=${encodeURIComponent("HBM Academy")}&certUrl=${encodeURIComponent(
                shareHref ? `${process.env.NEXT_PUBLIC_APP_URL || ""}${shareHref}` : "",
              )}&certId=${encodeURIComponent(certificate.certificate_number)}`}
              target="_blank"
              rel="noreferrer"
            >
              LinkedIn
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

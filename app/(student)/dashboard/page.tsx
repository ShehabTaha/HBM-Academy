import Link from "next/link";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { EmptyState } from "@/components/student/EmptyState";
import {
  getCurrentStudent,
  getStudentDashboardData,
} from "@/lib/services/student.service";
import { t } from "@/lib/i18n";
import { Award, BookOpen, CheckCircle2 } from "lucide-react";

export default async function StudentDashboardPage() {
  const student = await getCurrentStudent();
  if (!student) redirect("/auth/login");

  const data = await getStudentDashboardData(student.id);
  const enrollments = data.enrollments;
  const completed = enrollments.filter((item: any) => item.completed_at).length;

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm text-muted-foreground">Welcome, {student.name}</p>
        <h1 className="mt-2 text-3xl font-semibold">{t("dashboard.title", student.language)}</h1>
        <p className="mt-2 text-muted-foreground">
          {t("dashboard.subtitle", student.language)}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="rounded-lg bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <BookOpen className="h-4 w-4" />
              Enrolled courses
            </CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">{enrollments.length}</CardContent>
        </Card>
        <Card className="rounded-lg bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <CheckCircle2 className="h-4 w-4" />
              Completed
            </CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">{completed}</CardContent>
        </Card>
        <Card className="rounded-lg bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <Award className="h-4 w-4" />
              Certificates
            </CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">
            {data.certificates.length}
          </CardContent>
        </Card>
      </div>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-xl font-semibold">Continue learning</h2>
          <Button asChild variant="outline">
            <Link href="/courses">Browse courses</Link>
          </Button>
        </div>

        {enrollments.length === 0 ? (
          <EmptyState
            title="No courses yet"
            description="Browse the catalog and enroll in your first course."
            action={{ href: "/courses", label: "Browse courses" }}
          />
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {enrollments.map((enrollment: any) => (
              <Card key={enrollment.id} className="rounded-lg bg-white">
                <CardHeader>
                  <CardTitle>{enrollment.course?.title ?? "Course"}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Progress value={enrollment.progress_percentage ?? 0} />
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-sm text-muted-foreground">
                      {enrollment.progress_percentage ?? 0}% complete
                    </p>
                    <Button asChild>
                      <Link href={`/courses/${enrollment.course?.slug ?? enrollment.course_id}`}>
                        Resume
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

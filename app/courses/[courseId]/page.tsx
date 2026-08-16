import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CourseEnrollButton } from "@/components/student/CourseEnrollButton";
import { CheckoutButton } from "@/components/student/CheckoutButton";
import { LessonTypeBadge } from "@/components/student/LessonTypeBadge";
import { AuthActions } from "@/components/student/AuthActions";
import {
  getCurrentStudent,
  getPublicCourse,
} from "@/lib/services/student.service";
import { getCourseMastery } from "@/lib/services/mastery.service";
import { Clock, UserRound } from "lucide-react";

export default async function CourseLandingPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const course = await getPublicCourse(courseId);
  if (!course) notFound();

  const student = await getCurrentStudent();
  const mastery = student ? await getCourseMastery(course.id, student.id) : null;
  const firstLesson = course.sections?.[0]?.lessons?.[0];

  return (
    <div className="min-h-screen bg-app-bg">
      <header className="border-b bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
          <Link href="/courses" className="font-semibold">
            HBM Academy
          </Link>
          <div className="ml-auto">
            <AuthActions initialStudent={student} />
          </div>
        </div>
      </header>

      <main>
        <section className="bg-white">
          <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="flex flex-col justify-center">
              <p className="text-sm font-medium text-primary">
                {course.category ?? "HBM Academy"}
              </p>
              <h1 className="mt-3 max-w-3xl text-4xl font-semibold leading-tight">
                {course.title}
              </h1>
              <p className="mt-4 max-w-2xl text-lg leading-8 text-muted-foreground">
                {course.description}
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  {course.duration || 0} minutes
                </span>
                {course.instructor ? (
                  <span className="inline-flex items-center gap-2">
                    <UserRound className="h-4 w-4" />
                    {course.instructor.name}
                  </span>
                ) : null}
              </div>
              <div className="mt-8">
                {Number(course.price) > 0 && !mastery?.enrollment ? (
                  <CheckoutButton courseId={course.id} />
                ) : (
                  <CourseEnrollButton
                    courseId={course.id}
                    firstLessonId={firstLesson?.id}
                    enrolled={!!mastery?.enrollment}
                  />
                )}
              </div>
            </div>
            <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-secondary">
              <Image
                src={course.image || "/course2.png"}
                alt={course.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
          <Card className="rounded-lg bg-white">
            <CardHeader>
              <CardTitle>Curriculum</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {course.sections?.map((section) => (
                <div key={section.id}>
                  <h2 className="font-semibold">{section.title}</h2>
                  <div className="mt-3 divide-y rounded-lg border">
                    {section.lessons.map((lesson) => (
                      <div
                        key={lesson.id}
                        className="flex items-center justify-between gap-4 p-4"
                      >
                        <div>
                          <p className="font-medium">{lesson.title}</p>
                          {lesson.description ? (
                            <p className="mt-1 text-sm text-muted-foreground">
                              {lesson.description}
                            </p>
                          ) : null}
                        </div>
                        <LessonTypeBadge type={lesson.type} />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}

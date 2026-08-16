import { notFound, redirect } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { CourseSidebarPanel } from "@/components/student/CourseSidebarPanel";
import { DiscussionThread } from "@/components/student/DiscussionThread";
import { LessonRenderer } from "@/components/student/lesson/LessonRenderer";
import { LessonTypeBadge } from "@/components/student/LessonTypeBadge";
import { getCurrentStudent } from "@/lib/services/student.service";
import { getCourseMastery } from "@/lib/services/mastery.service";
import { Lock } from "lucide-react";

export default async function LearnLessonPage({
  params,
}: {
  params: Promise<{ courseId: string; lessonId: string }>;
}) {
  const { courseId, lessonId } = await params;
  const student = await getCurrentStudent();
  if (!student) redirect(`/auth/login?redirect=/courses/${courseId}/learn/${lessonId}`);

  const mastery = await getCourseMastery(courseId, student.id, lessonId);
  if (!mastery?.enrollment) redirect(`/courses/${courseId}`);

  const lesson = mastery.lessons.find((item) => item.id === lessonId);
  if (!lesson) notFound();

  return (
    <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
      <CourseSidebarPanel mastery={mastery} />
      <div className="min-w-0 space-y-6">
        <div>
          <div className="mb-3">
            <LessonTypeBadge type={lesson.type} />
          </div>
          <h1 className="text-3xl font-semibold">{lesson.title}</h1>
          {lesson.description ? (
            <p className="mt-2 text-muted-foreground">{lesson.description}</p>
          ) : null}
        </div>

        {lesson.locked ? (
          <Alert>
            <Lock className="h-4 w-4" />
            <AlertTitle>Lesson locked</AlertTitle>
            <AlertDescription>
              Complete the previous lesson to unlock this step.
            </AlertDescription>
          </Alert>
        ) : (
          <Card className="rounded-lg border-0 bg-transparent p-0 shadow-none">
            <CardContent className="p-0">
              <LessonRenderer lesson={lesson} />
            </CardContent>
          </Card>
        )}

        {!lesson.locked && lesson.enable_discussions ? (
          <DiscussionThread lessonId={lesson.id} />
        ) : null}
      </div>
    </div>
  );
}

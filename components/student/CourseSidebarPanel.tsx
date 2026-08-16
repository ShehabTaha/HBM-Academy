import Link from "next/link";
import { CheckCircle2, Circle, Lock } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { LessonTypeBadge } from "@/components/student/LessonTypeBadge";
import type { CourseMastery } from "@/lib/services/mastery.service";
import { cn } from "@/lib/utils";

export function CourseSidebarPanel({ mastery }: { mastery: CourseMastery }) {
  return (
    <aside className="rounded-lg border bg-white">
      <div className="border-b p-5">
        <p className="text-sm text-muted-foreground">Course progress</p>
        <h2 className="mt-1 line-clamp-2 font-semibold">{mastery.course.title}</h2>
        <Progress value={mastery.progressPercent} className="mt-4 h-2" />
        <p className="mt-2 text-sm text-muted-foreground">
          {mastery.completedCount} of {mastery.totalLessons} lessons complete
        </p>
      </div>

      <div className="max-h-[calc(100vh-220px)] overflow-y-auto p-3">
        {mastery.course.sections?.map((section) => (
          <div key={section.id} className="mb-4">
            <p className="px-2 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {section.title}
            </p>
            <div className="space-y-1">
              {section.lessons.map((lesson) => {
                const state = mastery.lessons.find((item) => item.id === lesson.id);
                const Icon = state?.locked
                  ? Lock
                  : state?.completed
                    ? CheckCircle2
                    : Circle;
                const content = (
                  <div
                    className={cn(
                      "flex min-h-14 items-start gap-3 rounded-md px-3 py-2 text-sm transition",
                      state?.active && "bg-primary text-primary-foreground",
                      !state?.active && !state?.locked && "hover:bg-secondary",
                      state?.locked && "text-muted-foreground",
                    )}
                  >
                    <Icon className="mt-0.5 h-4 w-4 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-2 font-medium">{lesson.title}</p>
                      <div className="mt-1">
                        <LessonTypeBadge type={lesson.type} />
                      </div>
                    </div>
                  </div>
                );

                return state?.locked ? (
                  <div key={lesson.id}>{content}</div>
                ) : (
                  <Link
                    key={lesson.id}
                    href={`/courses/${mastery.course.slug || mastery.course.id}/learn/${lesson.id}`}
                  >
                    {content}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}

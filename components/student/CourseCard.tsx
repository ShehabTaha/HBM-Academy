import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, GraduationCap } from "lucide-react";
import type { PublicCourse } from "@/lib/services/student.service";

export function CourseCard({ course }: { course: PublicCourse }) {
  const href = `/courses/${course.slug || course.id}`;

  return (
    <Card className="overflow-hidden rounded-lg bg-white py-0">
      <div className="relative aspect-[16/9] bg-secondary">
        <Image
          src={course.image || "/course1.png"}
          alt={course.title}
          fill
          className="object-cover"
          sizes="(min-width: 1024px) 33vw, 100vw"
        />
      </div>
      <CardHeader className="gap-3 px-5 pt-5">
        <div className="flex flex-wrap gap-2">
          {course.category ? <Badge variant="secondary">{course.category}</Badge> : null}
          {course.level ? <Badge variant="outline">{course.level}</Badge> : null}
        </div>
        <CardTitle className="line-clamp-2 text-xl leading-snug">
          {course.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-5">
        <p className="line-clamp-3 text-sm leading-6 text-muted-foreground">
          {course.description}
        </p>
        <div className="mt-5 flex items-center gap-4 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {course.duration || 0} min
          </span>
          <span className="inline-flex items-center gap-1">
            <GraduationCap className="h-4 w-4" />
            {Number(course.price) > 0 ? `$${course.price}` : "Free"}
          </span>
        </div>
      </CardContent>
      <CardFooter className="px-5 pb-5">
        <Button asChild className="w-full">
          <Link href={href}>View course</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

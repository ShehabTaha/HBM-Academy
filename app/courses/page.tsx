import Link from "next/link";
import Image from "next/image";
import { CourseCard } from "@/components/student/CourseCard";
import { AuthActions } from "@/components/student/AuthActions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getCurrentStudent, listPublishedCourses } from "@/lib/services/student.service";

export default async function CoursesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const params = await searchParams;
  const courses = await listPublishedCourses({
    search: params.q,
    category: params.category,
  });
  const student = await getCurrentStudent();

  return (
    <div className="min-h-screen bg-app-bg">
      <header className="border-b bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <Image src="/logo.svg" alt="HBM Academy" width={34} height={34} />
            <span>HBM Academy</span>
          </Link>
          <div className="ml-auto">
            <AuthActions initialStudent={student} />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold">Course Catalog</h1>
            <p className="mt-2 max-w-2xl text-muted-foreground">
              Browse published HBM Academy courses and start with the next clear
              step.
            </p>
          </div>
          <form className="flex w-full gap-2 md:w-[420px]">
            <Input
              name="q"
              defaultValue={params.q ?? ""}
              placeholder="Search courses..."
            />
            <Button type="submit">Search</Button>
          </form>
        </div>

        {courses.length === 0 ? (
          <div className="rounded-lg border bg-white p-10 text-center">
            <h2 className="text-xl font-semibold">No courses found</h2>
            <p className="mt-2 text-muted-foreground">
              Try a different search or check back after courses are published.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

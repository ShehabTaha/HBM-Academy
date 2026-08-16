import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AuthActions } from "@/components/student/AuthActions";
import { getCurrentStudent } from "@/lib/services/student.service";
import { Award, BookOpen, CheckCircle2 } from "lucide-react";

export default async function Home() {
  const student = await getCurrentStudent();

  return (
    <main className="min-h-screen bg-white">
      <section className="relative min-h-[92vh] overflow-hidden">
        <Image
          src="/course3.png"
          alt="Hospitality training"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/55" />
        <div className="relative mx-auto flex min-h-[92vh] max-w-7xl flex-col px-4 py-6 text-white sm:px-6">
          <header className="flex items-center gap-4">
            <Image src="/logo.svg" alt="HBM Academy" width={40} height={40} />
            <span className="font-semibold">HBM Academy</span>
            <div className="ml-auto">
              <AuthActions initialStudent={student} variant="hero" />
            </div>
          </header>
          <div className="flex flex-1 items-center">
            <div className="max-w-3xl">
              <h1 className="text-5xl font-semibold leading-tight md:text-6xl">
                HBM Academy
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-white/85">
                Mastery-based hospitality and business management courses with
                sequential lessons, assessment gates, and verifiable certificates.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild size="lg">
                  <Link href="/courses">Explore courses</Link>
                </Button>
                <Button asChild size="lg" variant="secondary">
                  <Link href={student ? "/dashboard" : "/auth/register"}>
                    {student ? "Go to dashboard" : "Create account"}
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-4 px-4 py-10 sm:px-6 md:grid-cols-3">
        {[
          ["Sequential mastery", "Every lesson unlocks only after the required work is complete.", CheckCircle2],
          ["Practical review", "Students submit real work and receive admin feedback.", BookOpen],
          ["Verified certificates", "Completion produces shareable HBM Academy credentials.", Award],
        ].map(([title, text, Icon]) => (
          <Card key={title as string} className="rounded-lg bg-white">
            <CardContent className="p-6">
              <Icon className="h-6 w-6 text-primary" />
              <h2 className="mt-4 text-lg font-semibold">{title as string}</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{text as string}</p>
            </CardContent>
          </Card>
        ))}
      </section>
    </main>
  );
}

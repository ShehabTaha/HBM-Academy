"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { StudentProfile } from "@/lib/services/student.service";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export function AuthActions({
  initialStudent,
  variant = "default",
}: {
  initialStudent: StudentProfile | null;
  variant?: "default" | "hero";
}) {
  const router = useRouter();
  const [student, setStudent] = useState<StudentProfile | null>(initialStudent);
  const [loading, setLoading] = useState(!initialStudent);
  const hadInitialStudent = useRef(!!initialStudent);

  useEffect(() => {
    let active = true;
    const supabase = createClient();

    async function syncStudent() {
      if (!hadInitialStudent.current) setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!active) return;

      if (!user) {
        setStudent(null);
        setLoading(false);
        return;
      }

      const response = await fetch("/api/student/auth/profile", {
        cache: "no-store",
      });

      if (!active) return;

      if (response.ok) {
        const data = await response.json();
        setStudent(data.student ?? null);
      } else {
        setStudent(null);
      }
      setLoading(false);
    }

    void syncStudent();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      void syncStudent().then(() => router.refresh());
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center gap-2" aria-label="Loading account">
        <Skeleton className="h-9 w-20 rounded-md bg-white/30" />
        <Skeleton className="h-9 w-28 rounded-md bg-white/30" />
      </div>
    );
  }

  if (student) {
    return (
      <div className="flex items-center gap-2">
        <Button asChild variant={variant === "hero" ? "secondary" : "ghost"}>
          <Link href="/dashboard">Dashboard</Link>
        </Button>
        <Button asChild variant={variant === "hero" ? "default" : "outline"}>
          <Link href="/profile">Profile</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Button asChild variant={variant === "hero" ? "secondary" : "ghost"}>
        <Link href="/auth/login">Sign in</Link>
      </Button>
      <Button asChild>
        <Link href={variant === "hero" ? "/courses" : "/auth/register"}>
          {variant === "hero" ? "Browse courses" : "Create account"}
        </Link>
      </Button>
    </div>
  );
}

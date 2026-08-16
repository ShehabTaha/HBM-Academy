"use client";

import {
  createContext,
  useEffect,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createClient } from "@/lib/supabase/client";
import type { StudentProfile } from "@/lib/services/student.service";

interface StudentContextValue {
  student: StudentProfile | null;
  setStudent: (student: StudentProfile | null) => void;
  loading: boolean;
  language: "en" | "ar";
}

const StudentContext = createContext<StudentContextValue | null>(null);

export function StudentProvider({
  children,
  initialStudent,
}: {
  children: ReactNode;
  initialStudent: StudentProfile | null;
}) {
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
      }

      setLoading(false);
    }

    void syncStudent();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      void syncStudent();
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<StudentContextValue>(
    () => ({
      student,
      setStudent,
      loading,
      language: student?.language ?? "en",
    }),
    [loading, student],
  );

  return (
    <StudentContext.Provider value={value}>{children}</StudentContext.Provider>
  );
}

export function useStudent() {
  const context = useContext(StudentContext);
  if (!context) {
    throw new Error("useStudent must be used inside StudentProvider");
  }
  return context;
}

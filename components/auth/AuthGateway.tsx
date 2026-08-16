"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LoginForm } from "@/components/auth/LoginForm";
import { StudentLoginForm } from "@/components/auth/StudentLoginForm";

export function AuthGateway() {
  const searchParams = useSearchParams();
  const defaultMode = useMemo(
    () => (searchParams.get("callbackUrl") ? "admin" : "student"),
    [searchParams],
  );
  const [mode, setMode] = useState<"student" | "admin">(defaultMode);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 rounded-lg bg-secondary p-1">
        <Button
          type="button"
          variant={mode === "student" ? "default" : "ghost"}
          onClick={() => setMode("student")}
        >
          Student
        </Button>
        <Button
          type="button"
          variant={mode === "admin" ? "default" : "ghost"}
          onClick={() => setMode("admin")}
        >
          Admin
        </Button>
      </div>
      {mode === "student" ? <StudentLoginForm /> : <LoginForm />}
    </div>
  );
}

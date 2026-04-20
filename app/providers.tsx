"use client";

import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";

import { UnsavedChangesProvider } from "@/contexts/UnsavedChangesContext";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <UnsavedChangesProvider>{children}</UnsavedChangesProvider>
    </SessionProvider>
  );
}

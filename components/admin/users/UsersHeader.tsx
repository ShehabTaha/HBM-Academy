"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface UsersHeaderProps {
  onExport: () => void;
}

export function UsersHeader({ onExport }: UsersHeaderProps) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Users Management</h1>
        <p className="text-muted-foreground">
          View and manage all platform users
        </p>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" onClick={onExport}>
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>
    </div>
  );
}

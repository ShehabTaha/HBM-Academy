"use client";

import { Button } from "@/components/ui/button";
import { Plus, Download } from "lucide-react";

interface StudentsHeaderProps {
  onExport: () => void;
  // onAddStudent?: () => void; // Optional if we implement creating students
}

export function StudentsHeader({ onExport }: StudentsHeaderProps) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Students Management
        </h1>
        <p className="text-muted-foreground">
          View and manage all platform students
        </p>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" onClick={onExport}>
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
        {/* <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Student
        </Button> */}
      </div>
    </div>
  );
}

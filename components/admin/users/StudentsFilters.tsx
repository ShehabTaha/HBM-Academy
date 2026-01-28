"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter, X } from "lucide-react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useState, useEffect } from "react";

export function StudentsFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Local state for inputs to allow debouncing
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [isOpen, setIsOpen] = useState(false);

  // Debounce search
  // If useDebounce hook doesn't exist, I'll do basic logic here.
  // I'll assume I need to implement simple timeout logic.

  const createQueryString = useCallback(
    (name: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value && value !== "all") {
        params.set(name, value);
      } else {
        params.delete(name);
      }
      // Reset page to 1 on filter change
      params.set("page", "1");

      router.push(pathname + "?" + params.toString());
    },
    [searchParams, pathname, router],
  );

  useEffect(() => {
    const handler = setTimeout(() => {
      createQueryString("search", search);
    }, 300);
    return () => clearTimeout(handler);
  }, [search, createQueryString]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setIsOpen(!isOpen)}
            className={isOpen ? "bg-accent" : ""}
          >
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
          {/* Clear Filters */}
          {(searchParams.has("status") ||
            searchParams.has("verified") ||
            searchParams.has("search")) && (
            <Button variant="ghost" onClick={() => router.push(pathname)}>
              <X className="mr-2 h-4 w-4" /> Clear
            </Button>
          )}
        </div>
      </div>

      {isOpen && (
        <div className="grid grid-cols-1 gap-4 rounded-lg border p-4 shadow-sm sm:grid-cols-2 md:grid-cols-4 bg-card">
          <div className="space-y-2">
            <label className="text-sm font-medium">Status</label>
            <Select
              value={searchParams.get("status") || "all"}
              onValueChange={(val) => createQueryString("status", val)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Email Verified</label>
            <Select
              value={searchParams.get("verified") || "all"}
              onValueChange={(val) => createQueryString("verified", val)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="true">Verified</SelectItem>
                <SelectItem value="false">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Placeholder for Date/Course filters as native inputs for now */}
        </div>
      )}
    </div>
  );
}

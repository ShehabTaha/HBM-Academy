"use client";

import React, { useState } from "react";
import useSWR from "swr";
import { QuizAttempt } from "@/types/quiz-types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Loader2, Search, Filter, Eye } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import QuizAttemptDetail from "./QuizAttemptDetail";

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch data");
  return res.json();
};

export default function QuizAttemptsList() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAttempt, setSelectedAttempt] = useState<QuizAttempt | null>(
    null,
  );
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const queryParams = new URLSearchParams();
  if (statusFilter !== "all") queryParams.append("status", statusFilter);
  if (searchTerm) queryParams.append("search", searchTerm);

  const {
    data: attempts,
    error,
    isLoading,
    mutate,
  } = useSWR<QuizAttempt[]>(
    `/api/admin/quiz-results?${queryParams.toString()}`,
    fetcher,
  );

  const handleRowClick = (attempt: QuizAttempt) => {
    setSelectedAttempt(attempt);
    setIsSheetOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search student or quiz..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <SelectValue placeholder="Filter..." />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="submitted">Submitted</SelectItem>
              <SelectItem value="graded">Graded</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="text-sm text-muted-foreground">
          {attempts ? `${attempts.length} attempts` : "Loading..."}
        </div>
      </div>

      <div className="rounded-md border bg-card w-full">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Quiz</TableHead>
              <TableHead>Score</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  <div className="flex justify-center items-center">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" /> Loading...
                  </div>
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-24 text-center text-red-500"
                >
                  Failed to load quiz results
                </TableCell>
              </TableRow>
            ) : attempts?.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-24 text-center text-muted-foreground"
                >
                  No quiz attempts found
                </TableCell>
              </TableRow>
            ) : (
              attempts?.map((attempt) => (
                <TableRow
                  key={attempt.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleRowClick(attempt)}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          {attempt.studentName.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-medium text-sm">
                          {attempt.studentName}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {attempt.studentEmail}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{attempt.quizName}</span>
                      <span className="text-xs text-muted-foreground">
                        {attempt.courseTitle}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span
                        className={`font-bold ${attempt.percentage >= 70 ? "text-green-600" : "text-red-500"}`}
                      >
                        {attempt.percentage.toFixed(0)}%
                      </span>
                      <span className="text-xs text-muted-foreground">
                        ({attempt.earnedPoints}/{attempt.totalPoints})
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(attempt.startedAt), {
                      addSuffix: true,
                    })}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={attempt.isPassing ? "default" : "secondary"}
                    >
                      {attempt.isPassing ? "PASS" : "FAIL"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="sm:max-w-2xl w-full overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Quiz Result Detail</SheetTitle>
            <SheetDescription>
              Review student answers and override scores
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6 h-full pb-20">
            {selectedAttempt && (
              <QuizAttemptDetail
                attempt={selectedAttempt}
                onClose={() => setIsSheetOpen(false)}
                onUpdate={() => mutate()}
              />
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import useSWR from "swr";
import { AssignmentSubmission } from "@/types/assignment-submission-types";
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
import AssignmentSubmissionDetail from "./AssignmentSubmissionDetail";

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch data");
  return res.json();
};

export default function AssignmentSubmissionsList() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubmission, setSelectedSubmission] =
    useState<AssignmentSubmission | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // Construct URL with query params
  const queryParams = new URLSearchParams();
  if (statusFilter !== "all") queryParams.append("status", statusFilter);
  if (searchTerm) queryParams.append("search", searchTerm);

  const {
    data: submissions,
    error,
    isLoading,
    mutate,
  } = useSWR<AssignmentSubmission[]>(
    `/api/admin/submissions?${queryParams.toString()}`,
    fetcher,
  );

  const handleRowClick = (submission: AssignmentSubmission) => {
    setSelectedSubmission(submission);
    setIsSheetOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800 hover:bg-green-200";
      case "rejected":
        return "bg-red-100 text-red-800 hover:bg-red-200";
      case "needs_revision":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200";
      default:
        return "bg-blue-100 text-blue-800 hover:bg-blue-200";
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search student or file..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <SelectValue placeholder="Filter by status" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Stats or Bulk Actions could go here */}
        <div className="text-sm text-muted-foreground">
          {submissions ? `${submissions.length} submissions` : "Loading..."}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border bg-card w-full">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Assignment</TableHead>
              <TableHead>Course</TableHead>
              <TableHead>Submitted</TableHead>
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
                  Failed to load submissions
                </TableCell>
              </TableRow>
            ) : submissions?.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-24 text-center text-muted-foreground"
                >
                  No submissions found matching criteria
                </TableCell>
              </TableRow>
            ) : (
              submissions?.map((submission) => (
                <TableRow
                  key={submission.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleRowClick(submission)}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          {submission.studentName.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-medium text-sm">
                          {submission.studentName}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {submission.studentEmail}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    {submission.assignmentTitle}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {submission.courseTitle}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(submission.submittedAt), {
                      addSuffix: true,
                    })}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={getStatusColor(submission.status)}
                    >
                      {submission.status.toUpperCase()}
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

      {/* Detail Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="sm:max-w-xl w-full overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Submission Details</SheetTitle>
            <SheetDescription>
              Review and grade student submission
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6 h-full pb-20">
            {selectedSubmission && (
              <AssignmentSubmissionDetail
                submission={selectedSubmission}
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

"use client";

import React, { useState } from "react";
import useSWR from "swr";
import { PracticalAssessment } from "@/types/practical-types";
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
import { Loader2, Filter, Eye } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import PracticalAssessmentDetail from "./PracticalAssessmentDetail";

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch data");
  return res.json();
};

export default function PracticalAssessmentsList() {
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedAssessment, setSelectedAssessment] =
    useState<PracticalAssessment | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const queryParams = new URLSearchParams();
  if (roleFilter !== "all") queryParams.append("role", roleFilter);
  if (statusFilter !== "all") queryParams.append("status", statusFilter);

  const {
    data: assessments,
    error,
    isLoading,
    mutate,
  } = useSWR<PracticalAssessment[]>(
    `/api/admin/practical-assessments?${queryParams.toString()}`,
    fetcher,
  );

  const handleRowClick = (assessment: PracticalAssessment) => {
    setSelectedAssessment(assessment);
    setIsSheetOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800 hover:bg-green-200";
      case "needs_revision":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200";
      default:
        return "bg-blue-100 text-blue-800 hover:bg-blue-200";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-[180px]">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <SelectValue placeholder="Filter Role" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="F&B Service">F&B Service</SelectItem>
              <SelectItem value="Housekeeping">Housekeeping</SelectItem>
              <SelectItem value="Front Office">Front Office</SelectItem>
              <SelectItem value="Culinary">Culinary</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="needs_revision">Needs Revision</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="text-sm text-muted-foreground">
          {assessments ? `${assessments.length} items` : "Loading..."}
        </div>
      </div>

      <div className="rounded-md border bg-card w-full">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Competency</TableHead>
              <TableHead>Student</TableHead>
              <TableHead>Role</TableHead>
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
                  Failed to load assessments
                </TableCell>
              </TableRow>
            ) : assessments?.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-24 text-center text-muted-foreground"
                >
                  No assessments found
                </TableCell>
              </TableRow>
            ) : (
              assessments?.map((assessment) => (
                <TableRow
                  key={assessment.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleRowClick(assessment)}
                >
                  <TableCell className="font-medium">
                    {assessment.competencyName}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          {assessment.studentName.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-medium text-sm">
                          {assessment.studentName}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {assessment.studentEmail}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{assessment.role}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(assessment.submittedAt), {
                      addSuffix: true,
                    })}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={getStatusColor(assessment.status)}
                    >
                      {assessment.status.toUpperCase().replace("_", " ")}
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
        <SheetContent className="sm:max-w-xl w-full overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Practical Assessment</SheetTitle>
            <SheetDescription>Evaluate student demonstration</SheetDescription>
          </SheetHeader>
          <div className="mt-6 h-full pb-20">
            {selectedAssessment && (
              <PracticalAssessmentDetail
                assessment={selectedAssessment}
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

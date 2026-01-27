"use client";

import React, { useState } from "react";
import { AssignmentSubmission } from "@/types/assignment-submission-types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Check, X, FileText, Download } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";

interface AssignmentSubmissionDetailProps {
  submission: AssignmentSubmission;
  onClose: () => void;
  onUpdate: () => void; // Trigger refresh
}

export default function AssignmentSubmissionDetail({
  submission,
  onClose,
  onUpdate,
}: AssignmentSubmissionDetailProps) {
  const [feedback, setFeedback] = useState(submission.adminFeedback || "");
  const [sendEmail, setSendEmail] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleAction = async (action: "approve" | "reject") => {
    setIsSubmitting(true);
    try {
      const response = await fetch(
        `/api/admin/submissions/${submission.id}/${action}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ feedback, sendEmail }),
        },
      );

      if (!response.ok) throw new Error("Action failed");

      toast({
        title:
          action === "approve" ? "Submission Approved" : "Submission Rejected",
        description: `Student has been notified.`,
        variant: action === "approve" ? "default" : "destructive",
      });

      onUpdate();
      onClose();
    } catch {
      toast({
        title: "Error",
        description: "Failed to process submission. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-500 hover:bg-green-600";
      case "rejected":
        return "bg-red-500 hover:bg-red-600";
      case "needs_revision":
        return "bg-yellow-500 hover:bg-yellow-600";
      default:
        return "bg-blue-500 hover:bg-blue-600";
    }
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto p-1">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold">{submission.assignmentTitle}</h2>
          <p className="text-sm text-muted-foreground">
            {submission.courseTitle}
          </p>
        </div>
        <Badge className={getStatusColor(submission.status)}>
          {submission.status.toUpperCase().replace("_", " ")}
        </Badge>
      </div>

      <div className="grid gap-6">
        {/* Student Info */}
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Student Information
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-4 py-3">
            <Avatar>
              <AvatarFallback>
                {submission.studentName.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">{submission.studentName}</p>
              <p className="text-sm text-muted-foreground">
                {submission.studentEmail}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Submitted: {format(new Date(submission.submittedAt), "PP p")}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Submission Content */}
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Submission
            </CardTitle>
          </CardHeader>
          <CardContent className="py-3">
            {submission.submittedFileUrl ? (
              <div className="flex items-center p-3 border rounded-md bg-muted/20">
                <FileText className="h-8 w-8 text-primary mr-3" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {submission.fileName || "Assignment File"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Click to download
                  </p>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <a
                    href={submission.submittedFileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Download className="h-4 w-4 mr-2" /> Download
                  </a>
                </Button>
              </div>
            ) : (
              <div className="p-3 border rounded-md bg-muted/20 min-h-[100px whitespace-pre-wrap">
                {submission.submittedContent || "No content provided."}
              </div>
            )}

            {submission.attemptNumber > 1 && (
              <div className="mt-4 text-xs text-muted-foreground">
                Attempt {submission.attemptNumber} of {submission.maxAttempts}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Grading / Feedback */}
        <div className="space-y-4">
          <Separator />
          <h3 className="font-semibold">Feedback & Grading</h3>

          <div className="grid gap-2">
            <Label htmlFor="feedback">Instructor Feedback</Label>
            <Textarea
              id="feedback"
              placeholder="Provide detailed feedback for the student..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="min-h-[150px]"
            />
            <p className="text-xs text-muted-foreground text-right">
              {feedback.length}/500 characters
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="sendEmail"
              checked={sendEmail}
              onChange={(e) => setSendEmail(e.target.checked)}
              className="rounded border-gray-300"
            />
            <Label htmlFor="sendEmail" className="text-sm cursor-pointer">
              Send email notification to student
            </Label>
          </div>
        </div>
      </div>

      {/* Actions Footer - pinned to bottom */}
      <div className="mt-auto pt-6 flex gap-3 sticky bottom-0 bg-background py-4 border-t">
        {submission.status !== "approved" && (
          <Button
            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            onClick={() => handleAction("approve")}
            disabled={isSubmitting}
          >
            <Check className="h-4 w-4 mr-2" /> Approve
          </Button>
        )}

        {submission.status !== "rejected" && (
          <Button
            className="flex-1"
            variant="destructive"
            onClick={() => handleAction("reject")}
            disabled={isSubmitting}
          >
            <X className="h-4 w-4 mr-2" /> Reject
          </Button>
        )}
      </div>
    </div>
  );
}

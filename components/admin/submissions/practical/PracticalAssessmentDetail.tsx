"use client";

import React, { useState } from "react";
import { PracticalAssessment, DEFAULT_RUBRIC } from "@/types/practical-types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import { Check, X, ExternalLink } from "lucide-react";

interface PracticalAssessmentDetailProps {
  assessment: PracticalAssessment;
  onClose: () => void;
  onUpdate: () => void;
}

export default function PracticalAssessmentDetail({
  assessment,
  onClose,
  onUpdate,
}: PracticalAssessmentDetailProps) {
  const [rubricScores, setRubricScores] = useState<Record<string, number>>(
    assessment.rubricScores || {},
  );
  const [feedback, setFeedback] = useState(
    assessment.adminFeedback || {
      strengths: "",
      improvements: "",
      recommendations: "",
    },
  );
  const [status, setStatus] = useState<string>(assessment.status);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleScoreChange = (criteriaId: string, score: number) => {
    setRubricScores((prev) => ({ ...prev, [criteriaId]: score }));
  };

  const calculateAverage = () => {
    const scores = Object.values(rubricScores);
    if (scores.length === 0) return 0;
    return scores.reduce((a, b) => a + b, 0) / scores.length;
  };

  const currentAverage = calculateAverage();

  const handleSubmit = async () => {
    setIsSubmitting(true);

    // Determine mastery level based on score
    let masteryLevel = "needs_work";
    if (currentAverage >= 4.5) masteryLevel = "mastery";
    else if (currentAverage >= 3) masteryLevel = "proficient";

    try {
      const res = await fetch(
        `/api/admin/practical-assessments/${assessment.id}/evaluate`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            rubricScores,
            feedback,
            status,
            masteryLevel,
          }),
        },
      );

      if (!res.ok) throw new Error("Evaluation failed");

      toast({
        title: "Assessment Saved",
        description: "Evaluation has been submitted successfully.",
      });
      onUpdate();
      onClose();
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to submit evaluation",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto p-1">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-xl font-bold">{assessment.competencyName}</h2>
          <p className="text-sm text-muted-foreground">{assessment.role}</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-primary">
            {currentAverage.toFixed(1)} / 5.0
          </div>
          <Badge variant={status === "approved" ? "default" : "secondary"}>
            {status.toUpperCase().replace("_", " ")}
          </Badge>
        </div>
      </div>

      <div className="space-y-6 pb-20">
        {/* Student & Evidence */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="text-sm font-medium mb-1">Student</div>
              <div className="font-semibold">{assessment.studentName}</div>
              <div className="text-xs text-muted-foreground">
                {assessment.studentEmail}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-sm font-medium mb-1">Evidence</div>
              {assessment.evidenceUrl ? (
                <Button variant="outline" size="sm" asChild className="w-full">
                  <a
                    href={assessment.evidenceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" /> View Media
                  </a>
                </Button>
              ) : (
                <div className="text-sm text-muted-foreground italic">
                  No evidence link provided
                </div>
              )}
              <div className="text-xs text-muted-foreground mt-2 text-center">
                Submitted:{" "}
                {format(new Date(assessment.submittedAt), "MMM d, yyyy")}
              </div>
            </CardContent>
          </Card>
        </div>

        <Separator />

        {/* Rubric Grid */}
        <div>
          <h3 className="font-semibold mb-4">Assessment Rubric</h3>
          <div className="space-y-4">
            {DEFAULT_RUBRIC.map((criteria) => (
              <div key={criteria.id} className="border rounded-md p-4">
                <div className="flex justify-between mb-2">
                  <div className="font-medium">{criteria.name}</div>
                  <div className="font-bold text-primary">
                    {rubricScores[criteria.id] || 0} / 5
                  </div>
                </div>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((score) => (
                    <button
                      key={score}
                      onClick={() => handleScoreChange(criteria.id, score)}
                      className={`flex-1 h-10 rounded border text-sm font-medium transition-colors
                                        ${
                                          rubricScores[criteria.id] === score
                                            ? "bg-primary text-primary-foreground border-primary"
                                            : "bg-background hover:bg-muted border-input"
                                        }
                                        ${score <= 2 ? "hover:bg-red-50" : score === 3 ? "hover:bg-yellow-50" : "hover:bg-green-50"}
                                    `}
                    >
                      {score}
                    </button>
                  ))}
                </div>
                <div className="flex justify-between text-xs text-muted-foreground mt-1 px-1">
                  <span>Poor</span>
                  <span>Excellent</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Feedback */}
        <div className="space-y-4">
          <h3 className="font-semibold">Instructor Feedback</h3>

          <div className="grid gap-2">
            <Label>Strengths</Label>
            <Textarea
              value={feedback.strengths}
              onChange={(e) =>
                setFeedback({ ...feedback, strengths: e.target.value })
              }
              placeholder="What did the student do well?"
            />
          </div>

          <div className="grid gap-2">
            <Label>Areas for Improvement</Label>
            <Textarea
              value={feedback.improvements}
              onChange={(e) =>
                setFeedback({ ...feedback, improvements: e.target.value })
              }
              placeholder="Where can the student improve?"
            />
          </div>

          <div className="grid gap-2">
            <Label>Recommendations</Label>
            <Textarea
              value={feedback.recommendations}
              onChange={(e) =>
                setFeedback({ ...feedback, recommendations: e.target.value })
              }
              placeholder="Actionable next steps..."
            />
          </div>
        </div>

        {/* Final Status */}
        <div className="bg-muted/30 p-4 rounded-lg">
          <Label className="mb-2 block">Assessment Decision</Label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending Review</SelectItem>
              <SelectItem value="approved">
                Approved (Competency Met)
              </SelectItem>
              <SelectItem value="needs_revision">
                Needs Revision (Retake Required)
              </SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground mt-2">
            Marking as "Approved" will record competency achievement for the
            student.
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="flex gap-3 sticky bottom-0 bg-background py-4 border-t mt-auto">
        <Button variant="outline" className="flex-1" onClick={onClose}>
          Cancel
        </Button>
        <Button
          className="flex-1"
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          Save Evaluation
        </Button>
      </div>
    </div>
  );
}

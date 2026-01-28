"use client";

import React, { useState } from "react";
import { QuizAttempt, QuizResponse } from "@/types/quiz-types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { CheckCircle2, XCircle, AlertCircle, Edit2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";

interface QuizAttemptDetailProps {
  attempt: QuizAttempt;
  onClose: () => void;
  onUpdate: () => void;
}

export default function QuizAttemptDetail({
  attempt,
  onClose,
  onUpdate,
}: QuizAttemptDetailProps) {
  const [editingQuestion, setEditingQuestion] = useState<QuizResponse | null>(
    null,
  );
  const [overrideScore, setOverrideScore] = useState<string>("");
  const [overrideReason, setOverrideReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleOverrideClick = (response: QuizResponse) => {
    setEditingQuestion(response);
    setOverrideScore(response.pointsEarned.toString());
    setOverrideReason("");
  };

  const submitOverride = async () => {
    if (!editingQuestion) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(
        `/api/admin/quiz-results/${attempt.id}/override-score`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            questionId: editingQuestion.questionId,
            newScore: parseFloat(overrideScore),
            reason: overrideReason,
          }),
        },
      );

      if (!res.ok) throw new Error("Failed to update score");

      toast({
        title: "Score Updated",
        description: "The quiz score has been recalculated.",
      });
      onUpdate();
      setEditingQuestion(null);
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to update score",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getScoreColor = (percent: number) => {
    if (percent >= 80) return "text-green-600";
    if (percent >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto p-1">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h2 className="text-xl font-bold">{attempt.quizName}</h2>
            <p className="text-sm text-muted-foreground">
              {attempt.courseTitle}
            </p>
          </div>
          <div className="text-right">
            <div
              className={`text-2xl font-bold ${getScoreColor(attempt.percentage)}`}
            >
              {attempt.percentage.toFixed(1)}%
            </div>
            <Badge variant={attempt.isPassing ? "default" : "destructive"}>
              {attempt.isPassing ? "PASSED" : "FAILED"}
            </Badge>
          </div>
        </div>

        <div className="flex gap-4 text-sm text-muted-foreground mt-2">
          <div>
            Student:{" "}
            <span className="font-medium text-foreground">
              {attempt.studentName}
            </span>
          </div>
          <div>
            Date:{" "}
            <span className="font-medium text-foreground">
              {format(new Date(attempt.startedAt), "MMM d, yyyy")}
            </span>
          </div>
          <div>
            Duration:{" "}
            <span className="font-medium text-foreground">
              {Math.round(attempt.duration / 60)} mins
            </span>
          </div>
        </div>
      </div>

      <Separator className="mb-6" />

      {/* Questions List */}
      <div className="space-y-6 pb-20">
        {attempt.responses.map((response, index) => (
          <Card key={index} className="relative overflow-hidden">
            <div
              className={`absolute left-0 top-0 bottom-0 w-1 ${response.isCorrect ? "bg-green-500" : "bg-red-500"}`}
            />
            <CardHeader className="py-3 pl-6 bg-muted/10">
              <div className="flex justify-between items-start">
                <div className="text-sm font-medium text-muted-foreground">
                  Question {index + 1} ({response.questionType})
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    {response.pointsEarned} / {response.maxPoints} pts
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => handleOverrideClick(response)}
                  >
                    <Edit2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <p className="mt-2 font-medium">{response.questionText}</p>
            </CardHeader>
            <CardContent className="py-4 pl-6 space-y-3">
              {/* Student Answer */}
              <div>
                <div className="text-xs font-semibold text-muted-foreground mb-1">
                  STUDENT ANSWER
                </div>
                <div
                  className={`p-3 rounded-md border ${response.isCorrect ? "bg-green-50 border-green-200 text-green-900" : "bg-red-50 border-red-200 text-red-900"}`}
                >
                  {response.studentAnswer}
                </div>
              </div>

              {/* Correct Answer (if wrong or manually reviewed) */}
              {!response.isCorrect && (
                <div>
                  <div className="text-xs font-semibold text-muted-foreground mb-1">
                    CORRECT ANSWER
                  </div>
                  <div className="p-3 rounded-md border bg-muted/30 text-muted-foreground">
                    {response.correctAnswer}
                  </div>
                </div>
              )}

              {/* Explanation if any */}
              {response.explanation && (
                <div className="text-sm text-muted-foreground bg-blue-50 p-3 rounded border border-blue-100">
                  <span className="font-semibold text-blue-800">
                    Explanation:
                  </span>{" "}
                  {response.explanation}
                </div>
              )}

              {(response as any).overrideReason && (
                <div className="text-xs text-yellow-700 bg-yellow-50 p-2 rounded border border-yellow-200">
                  Override: {(response as any).overrideReason}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Override Dialog */}
      <Dialog
        open={!!editingQuestion}
        onOpenChange={(open) => !open && setEditingQuestion(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Override Score</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Points</Label>
              <Input
                type="number"
                value={overrideScore}
                onChange={(e) => setOverrideScore(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Reason</Label>
              <Input
                value={overrideReason}
                onChange={(e) => setOverrideReason(e.target.value)}
                placeholder="e.g. Partial credit for essay"
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingQuestion(null)}>
              Cancel
            </Button>
            <Button onClick={submitOverride} disabled={isSubmitting}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

"use client";

import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AssignmentSubmissionsList from "@/components/admin/submissions/assignments/AssignmentSubmissionsList";
import QuizAttemptsList from "@/components/admin/submissions/quizzes/QuizAttemptsList";
import PracticalAssessmentsList from "@/components/admin/submissions/practical/PracticalAssessmentsList";

export default function SubmissionsPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight">
          Student Submissions
        </h1>
        <p className="text-muted-foreground">
          Review and grade student assignments, quizzes, and practical
          assessments.
        </p>
      </div>

      <Tabs
        defaultValue="assignments"
        className="w-full"
        suppressHydrationWarning
      >
        <TabsList className="grid w-full grid-cols-3 max-w-[600px]">
          <TabsTrigger value="assignments">Assignments</TabsTrigger>
          <TabsTrigger value="quizzes">Quizzes</TabsTrigger>
          <TabsTrigger value="practical">Practical</TabsTrigger>
        </TabsList>

        <TabsContent
          value="assignments"
          className="mt-6 w-full"
          suppressHydrationWarning
        >
          <AssignmentSubmissionsList />
        </TabsContent>

        <TabsContent
          value="quizzes"
          className="mt-6 w-full"
          suppressHydrationWarning
        >
          <QuizAttemptsList />
        </TabsContent>

        <TabsContent
          value="practical"
          className="mt-6 w-full"
          suppressHydrationWarning
        >
          <PracticalAssessmentsList />
        </TabsContent>
      </Tabs>
    </div>
  );
}

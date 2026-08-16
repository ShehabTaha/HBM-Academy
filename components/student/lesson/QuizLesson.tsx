"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import type { LessonState } from "@/lib/services/mastery.service";
import { CheckCircle2, Loader2, RotateCcw, XCircle } from "lucide-react";

type QuizQuestion = {
  id: string;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string | null;
  option_d: string | null;
  explanation: string | null;
};

type QuizResult = {
  score: number;
  passed: boolean;
  explanations: Array<{
    questionId: string;
    correctOption: string;
    explanation: string | null;
    isCorrect: boolean;
  }>;
};

export function QuizLesson({ lesson }: { lesson: LessonState }) {
  const router = useRouter();
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, "a" | "b" | "c" | "d">>({});
  const [result, setResult] = useState<QuizResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetch(`/api/student/quiz/${lesson.id}`)
      .then((response) => response.json().then((data) => ({ response, data })))
      .then(({ response, data }) => {
        if (!active) return;
        if (!response.ok) {
          setError(data.error ?? "Could not load quiz.");
        } else {
          setQuestions(data.questions ?? []);
          if (data.completed) {
            setResult({ score: 100, passed: true, explanations: [] });
          }
        }
      })
      .catch(() => {
        if (active) setError("Could not load quiz.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [lesson.id]);

  const allAnswered = useMemo(
    () => questions.length > 0 && questions.every((question) => answers[question.id]),
    [answers, questions],
  );

  async function submitQuiz() {
    setSubmitting(true);
    setError(null);
    const response = await fetch(`/api/student/quiz/${lesson.id}/attempt`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers }),
    });
    const data = await response.json();
    setSubmitting(false);

    if (!response.ok) {
      setError(data.error ?? "Could not submit quiz.");
      return;
    }

    setResult(data);
    if (data.passed) router.refresh();
  }

  if (loading) {
    return (
      <Card className="rounded-lg bg-white">
        <CardContent className="p-6 text-muted-foreground">Loading quiz...</CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-lg bg-white">
      <CardHeader>
        <CardTitle>{lesson.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {error ? (
          <Alert variant="destructive">
            <AlertTitle>Quiz unavailable</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        {questions.length === 0 && !error ? (
          <Alert>
            <AlertTitle>No questions yet</AlertTitle>
            <AlertDescription>
              Add quiz questions from the admin side to activate this lesson.
            </AlertDescription>
          </Alert>
        ) : null}

        {result ? (
          <Alert variant={result.passed ? "default" : "destructive"}>
            {result.passed ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
            <AlertTitle>{result.passed ? "Passed" : "Try again"}</AlertTitle>
            <AlertDescription>
              Score: {result.score}%. Quizzes require 100% to complete.
            </AlertDescription>
          </Alert>
        ) : null}

        <div className="space-y-6">
          {questions.map((question, index) => {
            const explanation = result?.explanations?.find(
              (item) => item.questionId === question.id,
            );

            return (
              <div key={question.id} className="rounded-lg border p-4">
                <p className="font-medium">
                  {index + 1}. {question.question_text}
                </p>
                <RadioGroup
                  value={answers[question.id]}
                  onValueChange={(value) =>
                    setAnswers((current) => ({
                      ...current,
                      [question.id]: value as "a" | "b" | "c" | "d",
                    }))
                  }
                  className="mt-4 gap-3"
                  disabled={result?.passed}
                >
                  {[
                    ["a", question.option_a],
                    ["b", question.option_b],
                    ["c", question.option_c],
                    ["d", question.option_d],
                  ].map(([value, label]) =>
                    label ? (
                      <div key={value} className="flex items-center gap-2">
                        <RadioGroupItem value={value as string} id={`${question.id}-${value}`} />
                        <Label htmlFor={`${question.id}-${value}`}>{label}</Label>
                      </div>
                    ) : null,
                  )}
                </RadioGroup>
                {explanation ? (
                  <p className="mt-3 text-sm text-muted-foreground">
                    {explanation.isCorrect ? "Correct." : `Correct answer: ${explanation.correctOption.toUpperCase()}.`}{" "}
                    {explanation.explanation}
                  </p>
                ) : null}
              </div>
            );
          })}
        </div>

        <div className="flex flex-wrap gap-3">
          <Button onClick={submitQuiz} disabled={!allAnswered || submitting || result?.passed}>
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Submit quiz
          </Button>
          {result && !result.passed ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setAnswers({});
                setResult(null);
              }}
            >
              <RotateCcw className="h-4 w-4" />
              Retry
            </Button>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}

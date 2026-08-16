"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { LessonState } from "@/lib/services/mastery.service";
import { Badge } from "@/components/ui/badge";
import { UploadCloud } from "lucide-react";
import { useRealtime } from "@/hooks/useRealtime";

type Submission = {
  id: string;
  file_name: string;
  status: "pending" | "approved" | "rejected";
  admin_feedback: string | null;
  submitted_at: string;
  attempt_number: number;
};

export function PracticalLesson({ lesson }: { lesson: LessonState }) {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSubmissions = useCallback(async () => {
    const response = await fetch(`/api/student/practical/${lesson.id}/submissions`);
    const data = await response.json();
    if (response.ok) setSubmissions(data.submissions ?? []);
    setLoading(false);
  }, [lesson.id]);

  useEffect(() => {
    const initialLoad = window.setTimeout(() => {
      void loadSubmissions();
    }, 0);
    return () => window.clearTimeout(initialLoad);
  }, [loadSubmissions]);

  useRealtime(
    `practical:${lesson.id}`,
    {
      table: "practical_submissions",
      filter: `lesson_id=eq.${lesson.id}`,
    },
    loadSubmissions,
  );

  async function submitWork(event: React.FormEvent) {
    event.preventDefault();
    if (!file) return;
    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.set("file", file);
    formData.set("notes", notes);

    const response = await fetch(`/api/student/practical/${lesson.id}/submit`, {
      method: "POST",
      body: formData,
    });
    const data = await response.json();
    setUploading(false);

    if (!response.ok) {
      setError(data.error ?? "Could not upload submission.");
      return;
    }

    setFile(null);
    setNotes("");
    await loadSubmissions();
  }

  const latest = submissions[0];

  return (
    <Card className="rounded-lg bg-white">
      <CardHeader>
        <CardTitle>{lesson.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {latest ? (
          <Alert>
            <AlertTitle className="flex items-center gap-2">
              Latest submission
              <Badge variant={latest.status === "rejected" ? "destructive" : "secondary"}>
                {latest.status}
              </Badge>
            </AlertTitle>
            <AlertDescription>
              Attempt {latest.attempt_number}: {latest.file_name}
              {latest.admin_feedback ? (
                <span className="mt-2 block">Feedback: {latest.admin_feedback}</span>
              ) : null}
            </AlertDescription>
          </Alert>
        ) : null}

        {error ? (
          <Alert variant="destructive">
            <AlertTitle>Upload failed</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        <form onSubmit={submitWork} className="space-y-4">
          <div className="rounded-lg border border-dashed p-6">
            <label className="flex cursor-pointer flex-col items-center gap-3 text-center">
              <UploadCloud className="h-8 w-8 text-muted-foreground" />
              <span className="font-medium">
                {file ? file.name : "Choose PDF, image, Word, or ZIP file"}
              </span>
              <span className="text-sm text-muted-foreground">Maximum 50MB</span>
              <input
                type="file"
                className="sr-only"
                onChange={(event) => setFile(event.target.files?.[0] ?? null)}
              />
            </label>
          </div>
          <Textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Optional note for the reviewer..."
          />
          <Button type="submit" disabled={!file || uploading}>
            {uploading ? "Uploading..." : "Submit for review"}
          </Button>
        </form>

        {loading ? <p className="text-sm text-muted-foreground">Loading submissions...</p> : null}
        {submissions.length > 1 ? (
          <div className="space-y-2">
            <h3 className="font-medium">Submission history</h3>
            {submissions.slice(1).map((submission) => (
              <div key={submission.id} className="flex items-center justify-between rounded-md border p-3 text-sm">
                <span>{submission.file_name}</span>
                <Badge variant="secondary">{submission.status}</Badge>
              </div>
            ))}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmailTemplate } from "@/types/settings";
import { useState, useEffect, useRef, useCallback } from "react";
import { Eye, Code2, Pencil, Info, AlertCircle } from "lucide-react";

// ─── Constants ───────────────────────────────────────────────────────────────

const TRIGGER_EVENTS = [
  { value: "none", label: "No auto-trigger (manual only)" },
  { value: "user_registered", label: "User Registered" },
  { value: "course_purchased", label: "Course Purchased" },
  { value: "payment_failed", label: "Payment Failed" },
  { value: "lesson_completed", label: "Lesson Completed" },
  { value: "password_reset", label: "Password Reset" },
  { value: "otp_verification", label: "OTP Verification" },
  { value: "course_completed", label: "Course Completed" },
];

const PREVIEW_VARS: Record<string, string> = {
  "user.name": "John Doe",
  "user.email": "john@example.com",
  "course.title": "Web Development Bootcamp",
  "course.id": "abc123",
  "invoice.amount": "$99.00",
  "invoice.date": new Date().toLocaleDateString(),
  "lesson.title": "Introduction to JavaScript",
  link: "#",
  otp: "482916",
  platform_name: "HBM Academy",
  platform_url: "#",
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function renderPreview(html: string): string {
  return html.replace(/\{\{([^}]+)\}\}/g, (_, key) => {
    const k = key.trim();
    return (
      PREVIEW_VARS[k] ??
      `<span style="background:#fef9c3;color:#92400e;padding:0 3px;border-radius:3px;font-size:11px;">${k}</span>`
    );
  });
}

function extractVariables(text: string): string[] {
  const matches = text.match(/\{\{([^}]+)\}\}/g) ?? [];
  return [...new Set(matches.map((m) => m.replace(/\{\{|\}\}/g, "").trim()))];
}

function toKey(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
}

/** Build the full HTML from simple content fields */
function buildHTML(fields: ContentFields): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <style>
    body { font-family: Arial, sans-serif; background: #f9fafb; margin: 0; padding: 0; }
    .container { max-width: 520px; margin: 40px auto; background: #fff; border-radius: 12px; border: 1px solid #e5e7eb; overflow: hidden; }
    .header { background: linear-gradient(135deg, #2563eb, #1d4ed8); padding: 32px; text-align: center; }
    .header h1 { color: #fff; font-size: 24px; margin: 0; }
    .body { padding: 32px; color: #374151; line-height: 1.6; }
    .body h2 { color: #111827; margin-top: 0; }
    .footer { background: #f9fafb; padding: 16px 32px; text-align: center; font-size: 12px; color: #9ca3af; border-top: 1px solid #e5e7eb; }
    .btn { display: inline-block; background: #2563eb; color: #fff !important; padding: 12px 28px; border-radius: 8px; text-decoration: none; margin-top: 20px; font-weight: 600; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>{{platform_name}}</h1>
    </div>
    <div class="body">
      ${fields.title ? `<h2>${fields.title}</h2>` : ""}
      ${fields.greeting ? `<p>Hello {{user.name}},</p>` : ""}
      ${fields.body ? `<p>${fields.body.replace(/\n/g, "<br/>")}</p>` : ""}
      ${fields.buttonText && fields.buttonUrl ? `<a href="${fields.buttonUrl}" class="btn">${fields.buttonText}</a>` : ""}
      ${fields.extraNote ? `<p style="color:#6b7280;font-size:13px;margin-top:20px;">${fields.extraNote}</p>` : ""}
    </div>
    <div class="footer">{{platform_name}} &middot; Automated message, do not reply.</div>
  </div>
</body>
</html>`;
}

interface ContentFields {
  title: string;
  greeting: boolean;
  body: string;
  buttonText: string;
  buttonUrl: string;
  extraNote: string;
}

const DEFAULT_FIELDS: ContentFields = {
  title: "Welcome!",
  greeting: true,
  body: "Thank you for joining us. Your account is now active and ready to use.",
  buttonText: "Get Started",
  buttonUrl: "{{link}}",
  extraNote: "",
};

// ─── Component ────────────────────────────────────────────────────────────────

type Tab = "content" | "html" | "preview";

interface CreateEmailTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: Omit<EmailTemplate, "id" | "created_at" | "updated_at">) => Promise<boolean>;
}

export function CreateEmailTemplateModal({
  isOpen,
  onClose,
  onCreate,
}: CreateEmailTemplateModalProps) {
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [triggerEvent, setTriggerEvent] = useState("none");
  const [fields, setFields] = useState<ContentFields>(DEFAULT_FIELDS);
  const [html, setHtml] = useState(() => buildHTML(DEFAULT_FIELDS));
  const [tab, setTab] = useState<Tab>("content");
  const [htmlManuallyEdited, setHtmlManuallyEdited] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const templateKey = toKey(name);
  const isValid = name.trim().length > 0 && subject.trim().length > 0 && html.trim().length > 0;

  const updateField = useCallback(<K extends keyof ContentFields>(key: K, val: ContentFields[K]) => {
    setFields((prev) => {
      const next = { ...prev, [key]: val };
      if (!htmlManuallyEdited) setHtml(buildHTML(next));
      return next;
    });
  }, [htmlManuallyEdited]);

  // Update iframe on preview
  useEffect(() => {
    if (tab === "preview" && iframeRef.current) {
      const doc = iframeRef.current.contentDocument;
      if (doc) { doc.open(); doc.write(renderPreview(html)); doc.close(); }
    }
  }, [tab, html]);

  // Reset on close
  useEffect(() => {
    if (!isOpen) {
      setName(""); setSubject(""); setTriggerEvent("none");
      setFields(DEFAULT_FIELDS); setHtml(buildHTML(DEFAULT_FIELDS));
      setTab("content"); setHtmlManuallyEdited(false);
    }
  }, [isOpen]);

  const handleCreate = async () => {
    if (!isValid) return;
    setIsSaving(true);
    const variables = extractVariables(subject + " " + html);
    const success = await onCreate({
      name: name.trim(),
      template_key: templateKey,
      subject: subject.trim(),
      template_html: html,
      template_text: undefined,
      trigger_event: triggerEvent === "none" ? undefined : triggerEvent,
      variables,
      is_active: true,
    } as any);
    setIsSaving(false);
    if (success) onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl w-full max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Email Template</DialogTitle>
          <DialogDescription>
            Fill in the details below. No coding required.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Name + Key */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="ct-name">Template Name *</Label>
              <Input id="ct-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Welcome Email" />
            </div>
            <div className="grid gap-2">
              <Label className="flex items-center gap-1">
                Template ID
                <span className="text-xs font-normal text-muted-foreground">(auto)</span>
              </Label>
              <Input value={templateKey} readOnly className="font-mono text-sm bg-muted/50 text-muted-foreground" />
            </div>
          </div>

          {/* Subject + Trigger */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="ct-subject">Email Subject *</Label>
              <Input id="ct-subject" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Welcome to our platform!" />
            </div>
            <div className="grid gap-2">
              <Label>Send Automatically When</Label>
              <Select value={triggerEvent} onValueChange={setTriggerEvent}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TRIGGER_EVENTS.map((e) => (
                    <SelectItem key={e.value} value={e.value}>{e.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Tab bar */}
          <div className="flex items-center gap-1 border-b">
            {([
              { id: "content", icon: Pencil, label: "Content" },
              { id: "html", icon: Code2, label: "HTML" },
              { id: "preview", icon: Eye, label: "Preview" },
            ] as const).map(({ id, icon: Icon, label }) => (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  tab === id
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            ))}
          </div>

          {/* CONTENT tab — friendly fields */}
          {tab === "content" && (
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="ct-title">Email Heading</Label>
                <Input
                  id="ct-title"
                  value={fields.title}
                  onChange={(e) => updateField("title", e.target.value)}
                  placeholder="e.g. Welcome aboard!"
                />
                <p className="text-xs text-muted-foreground">The big heading shown at the top of the email body.</p>
              </div>

              <div className="flex items-center gap-3">
                <input
                  id="ct-greeting"
                  type="checkbox"
                  checked={fields.greeting}
                  onChange={(e) => updateField("greeting", e.target.checked)}
                  className="w-4 h-4 accent-blue-600"
                />
                <Label htmlFor="ct-greeting" className="cursor-pointer font-normal">
                  Start with "Hello, [user's name],"
                </Label>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="ct-body">Message *</Label>
                <Textarea
                  id="ct-body"
                  value={fields.body}
                  onChange={(e) => updateField("body", e.target.value)}
                  className="min-h-[100px] resize-y"
                  placeholder="Write the main message here..."
                />
                <p className="text-xs text-muted-foreground">The main paragraph the recipient will read.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="ct-btn-text">Button Label</Label>
                  <Input
                    id="ct-btn-text"
                    value={fields.buttonText}
                    onChange={(e) => updateField("buttonText", e.target.value)}
                    placeholder="e.g. Get Started"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="ct-btn-url">Button Link</Label>
                  <Input
                    id="ct-btn-url"
                    value={fields.buttonUrl}
                    onChange={(e) => updateField("buttonUrl", e.target.value)}
                    placeholder="https://... or {{link}}"
                  />
                  <p className="text-xs text-muted-foreground">Use <code className="font-mono">{"{{link}}"}</code> to insert a dynamic URL.</p>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="ct-note">Small Note at Bottom <span className="text-muted-foreground font-normal">(optional)</span></Label>
                <Input
                  id="ct-note"
                  value={fields.extraNote}
                  onChange={(e) => updateField("extraNote", e.target.value)}
                  placeholder="e.g. If you didn't request this, ignore this email."
                />
              </div>
            </div>
          )}

          {/* HTML tab */}
          {tab === "html" && (
            <div className="space-y-2">
              {htmlManuallyEdited && (
                <div className="flex items-center gap-2 p-2 bg-amber-50 border border-amber-200 rounded text-xs text-amber-800">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  You've manually edited the HTML. Changes in the Content tab will no longer auto-update the HTML.
                </div>
              )}
              <Textarea
                value={html}
                onChange={(e) => { setHtml(e.target.value); setHtmlManuallyEdited(true); }}
                className="font-mono text-xs min-h-[320px] resize-y"
              />
            </div>
          )}

          {/* Preview tab */}
          {tab === "preview" && (
            <div className="border rounded-lg overflow-hidden bg-white" style={{ height: 380 }}>
              <iframe ref={iframeRef} title="Email preview" className="w-full h-full border-0" sandbox="allow-same-origin" />
            </div>
          )}

          {/* Hint */}
          <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-md text-sm text-blue-800">
            <Info className="w-4 h-4 mt-0.5 shrink-0" />
            <p>
              The academy name is automatically added to every email.
              In the Button Link field, <code className="font-mono text-xs">{"{{link}}"}</code> will
              be replaced with the actual URL when the email is sent.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSaving}>Cancel</Button>
          <Button onClick={handleCreate} disabled={isSaving || !isValid}>
            {isSaving ? "Creating…" : "Create Template"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

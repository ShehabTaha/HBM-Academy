"use client";

import { PlatformSettings, EmailTemplate } from "@/types/settings";
import { useEmailTemplates } from "@/hooks/useEmailTemplates";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Mail,
  Edit2,
  PlayCircle,
  Loader2,
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  Send,
  Eye,
  EyeOff,
  RefreshCw,
  BarChart2,
  Clock,
  AlertCircle,
  Zap,
} from "lucide-react";
import { useState, useEffect } from "react";
import { EditEmailTemplateModal } from "../modals/EditEmailTemplateModal";
import { CreateEmailTemplateModal } from "../modals/CreateEmailTemplateModal";

interface EmailTabProps {
  settings: Partial<PlatformSettings>;
  updateSetting: (key: keyof PlatformSettings, value: any) => void;
}

const TRIGGER_EVENT_LABELS: Record<string, { label: string; color: string }> = {
  user_registered:  { label: "User Registered",  color: "bg-blue-100 text-blue-700 border-blue-200" },
  course_purchased: { label: "Course Purchased",  color: "bg-green-100 text-green-700 border-green-200" },
  payment_failed:   { label: "Payment Failed",    color: "bg-red-100 text-red-700 border-red-200" },
  lesson_completed: { label: "Lesson Completed",  color: "bg-purple-100 text-purple-700 border-purple-200" },
  password_reset:   { label: "Password Reset",    color: "bg-orange-100 text-orange-700 border-orange-200" },
  otp_verification: { label: "OTP Verification",  color: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  welcome:          { label: "Welcome",            color: "bg-teal-100 text-teal-700 border-teal-200" },
  course_completed: { label: "Course Completed",  color: "bg-indigo-100 text-indigo-700 border-indigo-200" },
};

export function EmailTab({ settings, updateSetting }: EmailTabProps) {
  const {
    templates,
    logs,
    loading,
    logsLoading,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    sendTestEmail,
    refreshTemplates,
    fetchLogs,
  } = useEmailTemplates();

  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [testEmailTo, setTestEmailTo] = useState("");
  const [isSendingProviderTest, setIsSendingProviderTest] = useState(false);
  const [testSendingId, setTestSendingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<"templates" | "logs">("templates");

  useEffect(() => {
    if (activeSection === "logs") {
      fetchLogs();
    }
  }, [activeSection, fetchLogs]);

  const handleEdit = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setIsEditModalOpen(true);
  };

  const handleTestProviderEmail = async () => {
    if (!testEmailTo) return;
    setIsSendingProviderTest(true);
    try {
      const res = await fetch("/api/admin/email/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: testEmailTo }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsSendingProviderTest(false);
    }
  };

  const handleTemplateTest = async (templateId: string) => {
    setTestSendingId(templateId);
    await sendTestEmail(templateId);
    setTestSendingId(null);
  };

  const handleToggleActive = async (template: EmailTemplate) => {
    await updateTemplate(template.id, { is_active: !template.is_active });
  };

  const handleDelete = async (id: string) => {
    if (confirmDeleteId === id) {
      await deleteTemplate(id);
      setConfirmDeleteId(null);
    } else {
      setConfirmDeleteId(id);
      setTimeout(() => setConfirmDeleteId(null), 3000);
    }
  };

  const smtpProvider = settings.email_provider === "smtp";

  // Stats
  const sentCount = logs.filter((l) => l.status === "sent").length;
  const failedCount = logs.filter((l) => l.status === "failed").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Email Configuration</h2>
          <p className="text-muted-foreground mt-1">
            Configure your email provider, manage templates, and monitor deliveries.
          </p>
        </div>
      </div>

      {/* ── 1. Provider Configuration ─────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" /> Email Provider
          </CardTitle>
          <CardDescription>
            Configure the service used to send system emails.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Left column */}
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label>Service Provider</Label>
                <Select
                  value={settings.email_provider ?? "smtp"}
                  onValueChange={(val) => updateSetting("email_provider", val as any)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select provider" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sendgrid">SendGrid</SelectItem>
                    <SelectItem value="smtp">SMTP (Gmail, custom)</SelectItem>
                    <SelectItem value="resend">Resend</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* API key (SendGrid / Resend) */}
              {!smtpProvider && (
                <div className="grid gap-2">
                  <Label>API Key</Label>
                  <div className="relative">
                    <Input
                      type={showApiKey ? "text" : "password"}
                      value={settings.email_api_key ?? ""}
                      onChange={(e) => updateSetting("email_api_key", e.target.value)}
                      placeholder={
                        settings.email_provider === "sendgrid" ? "SG...." : "re_..."
                      }
                      className="pr-10 font-mono text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}

              {/* SMTP Fields */}
              {smtpProvider && (
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-2 grid gap-2">
                      <Label>SMTP Host</Label>
                      <Input
                        value={settings.email_smtp_host ?? ""}
                        onChange={(e) => updateSetting("email_smtp_host", e.target.value)}
                        placeholder="smtp.gmail.com"
                        className="font-mono text-sm"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Port</Label>
                      <Input
                        type="number"
                        value={settings.email_smtp_port ?? 465}
                        onChange={(e) => updateSetting("email_smtp_port", Number(e.target.value))}
                        className="font-mono text-sm"
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label>SMTP Username</Label>
                    <Input
                      value={settings.email_smtp_user ?? ""}
                      onChange={(e) => updateSetting("email_smtp_user", e.target.value)}
                      placeholder="user@gmail.com"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>SMTP Password / App Password</Label>
                    <div className="relative">
                      <Input
                        type={showApiKey ? "text" : "password"}
                        value={settings.email_smtp_pass ?? ""}
                        onChange={(e) => updateSetting("email_smtp_pass", e.target.value)}
                        placeholder="••••••••••••••"
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowApiKey(!showApiKey)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right column – Sender identity */}
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label>From Name</Label>
                <Input
                  value={settings.email_from_name ?? ""}
                  onChange={(e) => updateSetting("email_from_name", e.target.value)}
                  placeholder="HBM Academy"
                />
              </div>
              <div className="grid gap-2">
                <Label>From Email Address</Label>
                <Input
                  type="email"
                  value={settings.email_from_address ?? ""}
                  onChange={(e) => updateSetting("email_from_address", e.target.value)}
                  placeholder="noreply@hbmacademy.com"
                />
              </div>

              {/* Test send */}
              <div className="grid gap-2 pt-2">
                <Label>Send Test Email</Label>
                <div className="flex gap-2">
                  <Input
                    type="email"
                    value={testEmailTo}
                    onChange={(e) => setTestEmailTo(e.target.value)}
                    placeholder="admin@example.com"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleTestProviderEmail}
                    disabled={!testEmailTo || isSendingProviderTest}
                    id="email-test-send"
                  >
                    {isSendingProviderTest ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Verifies your provider is properly configured.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── 2. Templates & Logs Tab switcher ─────────────────── */}
      <div className="flex items-center gap-1 border-b">
        <button
          onClick={() => setActiveSection("templates")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeSection === "templates"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Templates ({templates.length})
        </button>
        <button
          onClick={() => setActiveSection("logs")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeSection === "logs"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Send Logs
        </button>
      </div>

      {/* ── 3. Templates List ────────────────────────────────── */}
      {activeSection === "templates" && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Email Templates</CardTitle>
                <CardDescription>
                  Templates are automatically triggered by platform events.
                  Use <code className="font-mono text-xs bg-muted px-1 rounded">{"{{variable}}"}</code> syntax for dynamic content.
                </CardDescription>
              </div>
              <Button
                size="sm"
                onClick={() => setIsCreateModalOpen(true)}
                id="create-template-btn"
              >
                <Plus className="w-4 h-4 mr-1" /> Create Template
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center p-12 text-muted-foreground">
                <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading templates...
              </div>
            ) : templates.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Mail className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p>No templates yet. Create your first one.</p>
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-4"
                  onClick={() => setIsCreateModalOpen(true)}
                >
                  <Plus className="w-4 h-4 mr-1" /> Create Template
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {templates.map((template) => {
                  const trigger = template.trigger_event
                    ? TRIGGER_EVENT_LABELS[template.trigger_event]
                    : null;

                  return (
                    <div
                      key={template.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/30 transition-colors group"
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <div
                          className={`p-2 rounded-full mt-0.5 shrink-0 ${
                            template.is_active
                              ? "bg-blue-50 text-blue-600"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          <Mail className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-medium text-sm">
                              {template.name ||
                                template.template_key
                                  .split("_")
                                  .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                                  .join(" ")}
                            </h4>
                            <Badge
                              variant="outline"
                              className={`text-xs font-normal ${
                                template.is_active
                                  ? "border-green-200 text-green-700 bg-green-50"
                                  : "border-gray-200 text-gray-500"
                              }`}
                            >
                              {template.is_active ? "Active" : "Inactive"}
                            </Badge>
                            {trigger && (
                              <Badge
                                variant="outline"
                                className={`text-xs font-normal flex items-center gap-1 ${trigger.color}`}
                              >
                                <Zap className="w-2.5 h-2.5" />
                                {trigger.label}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-0.5 truncate max-w-md">
                            {template.subject}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0 ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="sm"
                          title="Send test email"
                          onClick={() => handleTemplateTest(template.id)}
                          disabled={testSendingId === template.id}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          {testSendingId === template.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <PlayCircle className="w-4 h-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          title={template.is_active ? "Deactivate" : "Activate"}
                          onClick={() => handleToggleActive(template)}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          {template.is_active ? (
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                          ) : (
                            <XCircle className="w-4 h-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          title="Edit template"
                          onClick={() => handleEdit(template)}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          title={confirmDeleteId === template.id ? "Confirm delete" : "Delete"}
                          onClick={() => handleDelete(template.id)}
                          className={`${
                            confirmDeleteId === template.id
                              ? "text-red-600 bg-red-50"
                              : "text-muted-foreground hover:text-red-600"
                          }`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ── 4. Email Logs ────────────────────────────────────── */}
      {activeSection === "logs" && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <BarChart2 className="w-5 h-5" /> Send Logs
                </CardTitle>
                <CardDescription>History of all emails sent by the platform.</CardDescription>
              </div>
              <div className="flex items-center gap-3">
                {logs.length > 0 && (
                  <>
                    <Badge variant="outline" className="border-green-200 text-green-700 bg-green-50">
                      <CheckCircle2 className="w-3 h-3 mr-1" /> {sentCount} sent
                    </Badge>
                    {failedCount > 0 && (
                      <Badge variant="outline" className="border-red-200 text-red-700 bg-red-50">
                        <XCircle className="w-3 h-3 mr-1" /> {failedCount} failed
                      </Badge>
                    )}
                  </>
                )}
                <Button variant="outline" size="sm" onClick={() => fetchLogs()}>
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {logsLoading ? (
              <div className="flex justify-center p-12 text-muted-foreground">
                <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading logs...
              </div>
            ) : logs.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <BarChart2 className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p>No email logs yet.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {logs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-center gap-4 p-3 border rounded-lg text-sm"
                  >
                    <div className="shrink-0">
                      {log.status === "sent" ? (
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-red-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{log.subject}</p>
                      <p className="text-muted-foreground text-xs truncate">To: {log.recipient}</p>
                      {log.error_message && (
                        <p className="text-red-500 text-xs mt-0.5">{log.error_message}</p>
                      )}
                    </div>
                    <div className="shrink-0 text-right">
                      {log.template_key && (
                        <Badge variant="secondary" className="text-xs font-mono mb-1">
                          {log.template_key}
                        </Badge>
                      )}
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {new Date(log.sent_at).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Modals */}
      {selectedTemplate && (
        <EditEmailTemplateModal
          template={selectedTemplate}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSave={updateTemplate}
        />
      )}
      <CreateEmailTemplateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={createTemplate}
      />
    </div>
  );
}

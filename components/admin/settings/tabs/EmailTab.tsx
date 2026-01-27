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
import { Mail, Edit2, PlayCircle, Loader2 } from "lucide-react";
import { useState } from "react";
import { EditEmailTemplateModal } from "../modals/EditEmailTemplateModal";

interface EmailTabProps {
  settings: Partial<PlatformSettings>;
  updateSetting: (key: keyof PlatformSettings, value: any) => void;
}

export function EmailTab({ settings, updateSetting }: EmailTabProps) {
  const { templates, loading, updateTemplate } = useEmailTemplates();
  const [selectedTemplate, setSelectedTemplate] =
    useState<EmailTemplate | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleEdit = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Email Configuration
          </h2>
          <p className="text-muted-foreground">
            Set up email delivery and templates.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Email Provider</CardTitle>
          <CardDescription>
            Configure the service used to send system emails.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label>Service Provider</Label>
                <Select
                  value={settings.email_provider || "sendgrid"}
                  onValueChange={(val) => updateSetting("email_provider", val)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select provider" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sendgrid">SendGrid</SelectItem>
                    <SelectItem value="smtp">SMTP</SelectItem>
                    <SelectItem value="aws_ses">AWS SES</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label>API Key</Label>
                <Input
                  type="password"
                  value={settings.sendgrid_api_key || ""}
                  onChange={(e) =>
                    updateSetting("sendgrid_api_key", e.target.value)
                  }
                  placeholder="SG....."
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid gap-2">
                <Label>From Name</Label>
                <Input
                  value={settings.email_from_name || ""}
                  onChange={(e) =>
                    updateSetting("email_from_name", e.target.value)
                  }
                  placeholder="HBM Academy"
                />
              </div>
              <div className="grid gap-2">
                <Label>From Email Address</Label>
                <Input
                  value={settings.email_from_address || ""}
                  onChange={(e) =>
                    updateSetting("email_from_address", e.target.value)
                  }
                  placeholder="noreply@hbm.example.com"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Email Templates</CardTitle>
          <CardDescription>
            Manage the content of automated emails.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center p-8 text-muted-foreground">
              <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading
              templates...
            </div>
          ) : (
            <div className="space-y-4">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-primary/10 rounded-full text-primary mt-1">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-medium text-sm flex items-center gap-2">
                        {template.template_key
                          .split("_")
                          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                          .join(" ")}
                        {template.is_active ? (
                          <Badge
                            variant="outline"
                            className="text-xs font-normal border-green-200 text-green-700 bg-green-50"
                          >
                            Active
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="text-xs font-normal"
                          >
                            Inactive
                          </Badge>
                        )}
                      </h4>
                      <p className="text-sm text-muted-foreground truncate max-w-md">
                        {template.subject}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        // Logic to test send could go here
                      }}
                    >
                      <PlayCircle className="w-4 h-4 text-muted-foreground mr-1" />
                      <span className="sr-only sm:not-sr-only">Test</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(template)}
                    >
                      <Edit2 className="w-3 h-3 mr-1" /> Edit
                    </Button>
                  </div>
                </div>
              ))}
              {templates.length === 0 && (
                <div className="text-center p-8 text-muted-foreground">
                  No templates found.
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {selectedTemplate && (
        <EditEmailTemplateModal
          template={selectedTemplate}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={updateTemplate}
        />
      )}
    </div>
  );
}

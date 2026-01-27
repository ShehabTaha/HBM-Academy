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
import { EmailTemplate } from "@/types/settings";
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";

interface EditEmailTemplateModalProps {
  template: EmailTemplate;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, updates: Partial<EmailTemplate>) => Promise<boolean>;
}

export function EditEmailTemplateModal({
  template,
  isOpen,
  onClose,
  onSave,
}: EditEmailTemplateModalProps) {
  const [subject, setSubject] = useState(template.subject);
  const [htmlContent, setHtmlContent] = useState(template.template_html);
  const [textContent, setTextContent] = useState(template.template_text);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setSubject(template.subject);
    setHtmlContent(template.template_html);
    setTextContent(template.template_text);
  }, [template, isOpen]);

  const handleSave = async () => {
    setIsSaving(true);
    const success = await onSave(template.id, {
      subject,
      template_html: htmlContent,
      template_text: textContent,
    });
    setIsSaving(false);
    if (success) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Edit Email Template: {template.template_key}
          </DialogTitle>
          <DialogDescription>
            Modify the content of this email template.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid gap-2">
            <Label htmlFor="subject">Subject Line *</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label>Available Variables</Label>
            <div className="flex flex-wrap gap-2">
              {template.variables?.map((v) => (
                <Badge
                  key={v}
                  variant="secondary"
                  className="font-mono text-xs"
                >
                  {`{${v}}`}
                </Badge>
              )) || (
                <span className="text-muted-foreground text-sm">
                  No variables defined
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Click to copy not implemented, but you can type these in the
              content.
            </p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="html">Email Body (HTML)</Label>
            <Textarea
              id="html"
              value={htmlContent}
              onChange={(e) => setHtmlContent(e.target.value)}
              className="font-mono min-h-[300px]"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="text">Email Text Version (Plain Text)</Label>
            <Textarea
              id="text"
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
              className="font-mono min-h-[100px]"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

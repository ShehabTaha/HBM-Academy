import { PlatformSettings } from "@/types/settings";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

interface ModerationTabProps {
  settings: Partial<PlatformSettings>;
  updateSetting: (key: keyof PlatformSettings, value: any) => void;
}

export function ModerationTab({ settings, updateSetting }: ModerationTabProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Content Moderation
          </h2>
          <p className="text-muted-foreground">
            Manage user-generated content policies.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Content Review</CardTitle>
          <CardDescription>Rules for publishing new content.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable Content Moderation</Label>
              <p className="text-sm text-muted-foreground">
                Require approval for sensitive actions.
              </p>
            </div>
            <Switch
              checked={settings.enable_content_moderation}
              onCheckedChange={(val) =>
                updateSetting("enable_content_moderation", val)
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Auto-approve Courses</Label>
              <p className="text-sm text-muted-foreground">
                Automatically publish courses without manual review.
              </p>
            </div>
            <Switch
              checked={settings.auto_approve_courses}
              onCheckedChange={(val) =>
                updateSetting("auto_approve_courses", val)
              }
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Automated Scanning</CardTitle>
          <CardDescription>
            (Mock) Configure automated content checks.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Profanity Filter</Label>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <Label>Copyright Detection</Label>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <Label>Malware Scanning</Label>
            <Switch defaultChecked disabled />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

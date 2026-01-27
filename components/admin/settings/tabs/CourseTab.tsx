import { PlatformSettings } from "@/types/settings";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

interface CourseTabProps {
  settings: Partial<PlatformSettings>;
  updateSetting: (key: keyof PlatformSettings, value: any) => void;
}

export function CourseTab({ settings, updateSetting }: CourseTabProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Course Settings</h2>
          <p className="text-muted-foreground">
            Configure learning experience defaults.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Defaults</CardTitle>
          <CardDescription>Default settings for new courses.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label>Default Course Level</Label>
            <Select
              value={settings.default_course_level}
              onValueChange={(val) =>
                updateSetting("default_course_level", val)
              }
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Course Features</CardTitle>
          <CardDescription>
            Enable or disable specific course functionality.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable Course Ratings</Label>
              <p className="text-sm text-muted-foreground">
                Allow students to rate courses.
              </p>
            </div>
            <Switch
              checked={settings.enable_course_ratings}
              onCheckedChange={(val) =>
                updateSetting("enable_course_ratings", val)
              }
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable Discussions</Label>
              <p className="text-sm text-muted-foreground">
                Allow students to discuss in lessons.
              </p>
            </div>
            <Switch
              checked={settings.enable_course_discussions}
              onCheckedChange={(val) =>
                updateSetting("enable_course_discussions", val)
              }
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable Certificates</Label>
              <p className="text-sm text-muted-foreground">
                Issue certificates upon completion.
              </p>
            </div>
            <Switch
              checked={settings.enable_certificates}
              onCheckedChange={(val) =>
                updateSetting("enable_certificates", val)
              }
            />
          </div>

          {settings.enable_certificates && (
            <div className="mt-4 border-l-2 pl-4 ml-2 space-y-2">
              <Label>Certificate Validity (Days)</Label>
              <Input
                type="number"
                className="w-[150px]"
                value={settings.certificate_validity_days ?? ""}
                onChange={(e) =>
                  updateSetting(
                    "certificate_validity_days",
                    parseInt(e.target.value),
                  )
                }
                placeholder="0 = Forever"
              />
              <p className="text-xs text-muted-foreground">
                Set to 0 for no expiration.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

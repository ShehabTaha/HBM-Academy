import { PlatformSettings } from "@/types/settings";
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
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, Database, Server, ShieldCheck } from "lucide-react";

interface AdvancedTabProps {
  settings: Partial<PlatformSettings>;
  updateSetting: (key: keyof PlatformSettings, value: any) => void;
}

export function AdvancedTab({ settings, updateSetting }: AdvancedTabProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Advanced Settings
          </h2>
          <p className="text-muted-foreground">
            System configuration and maintenance.
          </p>
        </div>
      </div>

      <Card className="border-l-4 border-l-red-500">
        <CardHeader>
          <CardTitle className="text-red-700 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" /> Maintenance Mode
          </CardTitle>
          <CardDescription>
            When enabled, the platform will be inaccessible to non-admin users.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-md bg-red-50">
            <div className="space-y-0.5">
              <Label className="text-red-900">Enable Maintenance Mode</Label>
              <p className="text-sm text-red-700">
                Only admins will be able to access the dashboard.
              </p>
            </div>
            <Switch
              checked={settings.maintenance_mode}
              onCheckedChange={(val) => updateSetting("maintenance_mode", val)}
              className="data-[state=checked]:bg-red-600"
            />
          </div>

          {settings.maintenance_mode && (
            <div className="space-y-2">
              <Label>Maintenance Message</Label>
              <Textarea
                value={
                  settings.maintenance_message ??
                  "We are currently undergoing scheduled maintenance. Please check back later."
                }
                onChange={(e) =>
                  updateSetting("maintenance_message", e.target.value)
                }
              />
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-4 h-4" /> Database
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status</span>
              <span className="text-green-600 font-medium">✓ Healthy</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Used Storage</span>
              <span>450 MB</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Last Backup</span>
              <span>2 hours ago</span>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" size="sm" className="w-full">
              Create Backup Now
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="w-4 h-4" /> System Info
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Next.js Version</span>
              <span>16.0.1</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Environment</span>
              <span>Production</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Region</span>
              <span>us-east-1</span>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" size="sm" className="w-full">
              View Logs
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

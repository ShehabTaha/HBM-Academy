import { PlatformSettings } from "@/types/settings";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface GeneralTabProps {
  settings: Partial<PlatformSettings>;
  updateSetting: (key: keyof PlatformSettings, value: unknown) => void;
}

export function GeneralTab({ settings, updateSetting }: GeneralTabProps) {
  const [stats, setStats] = useState({ totalUsers: 0, activeCourses: 0 });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/admin/stats/general");
        if (res.ok) {
          const data = await res.json();
          setStats({
            totalUsers: data.totalUsers,
            activeCourses: data.activeCourses,
          });
        }
      } catch (error) {
        console.error("Failed to fetch stats", error);
      } finally {
        setLoadingStats(false);
      }
    }

    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            General Settings
          </h2>
          <p className="text-muted-foreground">
            Platform information and branding configuration.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Platform Identity</CardTitle>
          <CardDescription>
            Configure basic platform details visible to users.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="platform_name">Platform Name *</Label>
            <Input
              id="platform_name"
              value={settings.platform_name || ""}
              onChange={(e) => updateSetting("platform_name", e.target.value)}
              placeholder="e.g. HBM Academy"
            />
          </div>



        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
          <CardDescription>How users can reach support.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="support_email">Support Email *</Label>
              <Input
                id="support_email"
                type="email"
                value={settings.support_email || ""}
                onChange={(e) =>
                  updateSetting("support_email", e.target.value)
                }
                placeholder="support@example.com"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="support_url">Support URL (Optional)</Label>
              <Input
                id="support_url"
                value={settings.support_url || ""}
                onChange={(e) => updateSetting("support_url", e.target.value)}
                placeholder="support.example.com"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Legal Documents</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="tos_url">Terms of Service URL</Label>
            <Input
              id="tos_url"
              value={settings.terms_of_service_url || ""}
              onChange={(e) =>
                updateSetting("terms_of_service_url", e.target.value)
              }
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="privacy_url">Privacy Policy URL</Label>
            <Input
              id="privacy_url"
              value={settings.privacy_policy_url || ""}
              onChange={(e) =>
                updateSetting("privacy_policy_url", e.target.value)
              }
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loadingStats ? "..." : stats.totalUsers.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Active Courses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loadingStats ? "..." : stats.activeCourses.toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

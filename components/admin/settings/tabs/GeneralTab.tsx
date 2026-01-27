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
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

interface GeneralTabProps {
  settings: Partial<PlatformSettings>;
  updateSetting: (key: keyof PlatformSettings, value: any) => void;
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

          <div className="grid gap-2">
            <Label htmlFor="platform_url">Platform URL *</Label>
            <Input
              id="platform_url"
              value={settings.platform_url || ""}
              onChange={(e) => updateSetting("platform_url", e.target.value)}
              placeholder="https://example.com"
            />
            <p className="text-xs text-muted-foreground">
              Used for email links and sharing.
            </p>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Platform Logo</Label>
              <div className="flex items-center gap-4">
                <div className="h-12 w-48 bg-muted rounded-md flex items-center justify-center text-muted-foreground text-xs overflow-hidden border">
                  {settings.platform_logo_url ? (
                    <img
                      src={settings.platform_logo_url}
                      alt="Logo"
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    "No Logo"
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <Button variant="outline" size="sm" className="w-full">
                    <Upload className="w-4 h-4 mr-2" /> Upload Logo
                  </Button>
                  <Input
                    placeholder="Or enter URL"
                    className="h-8 text-xs"
                    value={settings.platform_logo_url || ""}
                    onChange={(e) =>
                      updateSetting("platform_logo_url", e.target.value)
                    }
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Recommended: 200x50px, PNG or SVG
              </p>
            </div>

            <div className="space-y-2">
              <Label>Platform Favicon</Label>
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 bg-muted rounded-md flex items-center justify-center text-muted-foreground text-xs border">
                  {settings.platform_favicon_url ? (
                    <img
                      src={settings.platform_favicon_url}
                      alt="Favicon"
                      className="h-8 w-8 object-contain"
                    />
                  ) : (
                    "Icon"
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <Button variant="outline" size="sm" className="w-full">
                    <Upload className="w-4 h-4 mr-2" /> Upload
                  </Button>
                  <Input
                    placeholder="Or enter URL"
                    className="h-8 text-xs"
                    value={settings.platform_favicon_url || ""}
                    onChange={(e) =>
                      updateSetting("platform_favicon_url", e.target.value)
                    }
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Recommended: 32x32px
              </p>
            </div>
          </div>

          <div className="grid gap-2 mt-4">
            <Label htmlFor="theme_color">Theme Color</Label>
            <div className="flex gap-2">
              <Input
                type="color"
                className="w-12 h-10 p-1 cursor-pointer"
                value={settings.theme_color || "#0066FF"}
                onChange={(e) => updateSetting("theme_color", e.target.value)}
              />
              <Input
                value={settings.theme_color || "#0066FF"}
                onChange={(e) => updateSetting("theme_color", e.target.value)}
                className="w-32"
              />
            </div>
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
                onChange={(e) => updateSetting("support_email", e.target.value)}
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

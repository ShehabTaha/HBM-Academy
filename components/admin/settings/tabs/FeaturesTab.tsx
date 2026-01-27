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

interface FeaturesTabProps {
  settings: Partial<PlatformSettings>;
  updateSetting: (key: keyof PlatformSettings, value: any) => void;
}

export function FeaturesTab({ settings, updateSetting }: FeaturesTabProps) {
  const features = [
    {
      key: "enable_live_classes",
      label: "Live Classes",
      desc: "Enable Zoom/Meet integrations for live sessions.",
    },
    {
      key: "enable_forums",
      label: "Discussion Forums",
      desc: "Enable global community forums.",
    },
    {
      key: "enable_user_referrals",
      label: "User Referrals",
      desc: "Allow users to refer others for rewards.",
    },
    {
      key: "enable_affiliate_program",
      label: "Affiliate Program",
      desc: "Enable affiliate tracking and dashboard.",
    },
    {
      key: "enable_api_access",
      label: "API Access",
      desc: "Allow developers to generate API keys.",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Feature Management
          </h2>
          <p className="text-muted-foreground">
            Enable or disable platform capabilities.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Platform Features</CardTitle>
          <CardDescription>Toggle features on or off globally.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {features.map((feature, index) => (
            <div key={feature.key}>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{feature.label}</Label>
                  <p className="text-sm text-muted-foreground">
                    {feature.desc}
                  </p>
                </div>
                <Switch
                  checked={!!settings[feature.key as keyof PlatformSettings]}
                  onCheckedChange={(val) =>
                    updateSetting(feature.key as keyof PlatformSettings, val)
                  }
                />
              </div>
              {index < features.length - 1 && <Separator className="mt-4" />}
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="bg-blue-50 text-blue-800 p-4 rounded-md text-sm">
        Note: Disabling a feature will hide it from the user interface
        immediately, but database data will be preserved.
      </div>
    </div>
  );
}

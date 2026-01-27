import { PlatformSettings } from "@/types/settings";
import { usePaymentStatus } from "@/hooks/usePaymentStatus";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Eye,
  EyeOff,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  RefreshCw,
} from "lucide-react";
import { useState } from "react";

interface PaymentTabProps {
  settings: Partial<PlatformSettings>;
  updateSetting: (key: keyof PlatformSettings, value: any) => void;
}

export function PaymentTab({ settings, updateSetting }: PaymentTabProps) {
  const { status, loading: statusLoading } = usePaymentStatus();
  const [showSecret, setShowSecret] = useState(false);
  const [showWebhook, setShowWebhook] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Payment Settings
          </h2>
          <p className="text-muted-foreground">
            Configure payment processing and pricing.
          </p>
        </div>
      </div>

      {/* Stripe Configuration */}
      <Card className="border-l-4 border-l-blue-600">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center gap-2">
                Stripe Configuration
                {status?.connected && (
                  <Badge
                    variant="default"
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Connected
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                Main payment processor for credit cards.
              </CardDescription>
            </div>
            {status?.account && (
              <div className="text-right text-sm text-muted-foreground">
                <div className="flex items-center gap-1 justify-end text-green-600 font-medium">
                  <CheckCircle2 className="w-4 h-4" /> Verified
                </div>
                <div>ID: {status.account.type}</div>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="stripe_pk">Public Key (Publishable)</Label>
            <Input
              id="stripe_pk"
              value={settings.stripe_public_key || ""}
              onChange={(e) =>
                updateSetting("stripe_public_key", e.target.value)
              }
              placeholder="pk_live_..."
              className="font-mono text-sm"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="stripe_sk">Secret Key (Server Side)</Label>
            <div className="relative">
              <Input
                id="stripe_sk"
                type={showSecret ? "text" : "password"}
                value={settings.stripe_secret_key || ""}
                onChange={(e) =>
                  updateSetting("stripe_secret_key", e.target.value)
                }
                placeholder="sk_live_..."
                className="font-mono text-sm pr-10"
              />
              <button
                type="button"
                onClick={() => setShowSecret(!showSecret)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showSecret ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="stripe_wh">Webhook Secret</Label>
            <div className="relative">
              <Input
                id="stripe_wh"
                type={showWebhook ? "text" : "password"}
                value={settings.stripe_webhook_secret || ""}
                onChange={(e) =>
                  updateSetting("stripe_webhook_secret", e.target.value)
                }
                placeholder="whsec_..."
                className="font-mono text-sm pr-10"
              />
              <button
                type="button"
                onClick={() => setShowWebhook(!showWebhook)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showWebhook ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              Endpoint:{" "}
              <code className="bg-muted px-1 py-0.5 rounded">
                https://your-domain.com/api/webhooks/stripe
              </code>
            </p>
          </div>
        </CardContent>
        <CardFooter className="bg-muted/50 border-t flex justify-between">
          <Button variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" /> Test Connection
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground flex items-center"
            onClick={() =>
              window.open("https://dashboard.stripe.com", "_blank")
            }
          >
            Go to Stripe Dashboard <ExternalLink className="w-3 h-3 ml-1" />
          </Button>
        </CardFooter>
      </Card>

      {/* Currency & Pricing */}
      <Card>
        <CardHeader>
          <CardTitle>Currency & Pricing</CardTitle>
          <CardDescription>Set base currency and tax rules.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Primary Currency</Label>
              <Select
                value={settings.payment_currency}
                onValueChange={(val) => updateSetting("payment_currency", val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD - US Dollar</SelectItem>
                  <SelectItem value="EUR">EUR - Euro</SelectItem>
                  <SelectItem value="EGP">EGP - Egyptian Pound</SelectItem>
                  <SelectItem value="GBP">GBP - British Pound</SelectItem>
                  <SelectItem value="SAR">SAR - Saudi Riyal</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>Default Tax Rate (%)</Label>
              <div className="relative">
                <Input
                  type="number"
                  value={settings.tax_rate ?? ""}
                  onChange={(e) =>
                    updateSetting("tax_rate", parseFloat(e.target.value))
                  }
                  className="pr-6"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  %
                </span>
              </div>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Minimum Course Price</Label>
              <Input
                type="number"
                value={settings.minimum_course_price ?? ""}
                onChange={(e) =>
                  updateSetting(
                    "minimum_course_price",
                    parseFloat(e.target.value),
                  )
                }
              />
            </div>
            <div className="grid gap-2">
              <Label>Maximum Course Price</Label>
              <Input
                type="number"
                value={settings.maximum_course_price ?? ""}
                onChange={(e) =>
                  updateSetting(
                    "maximum_course_price",
                    parseFloat(e.target.value),
                  )
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Disclaimer */}
      <div className="flex items-start gap-2 text-sm text-amber-600 bg-amber-50 p-4 rounded-md border border-amber-200">
        <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
        <p>
          Changing payment providers or currency settings affects all future
          transactions. It typically does not affect existing subscriptions
          until they renew.
        </p>
      </div>
    </div>
  );
}

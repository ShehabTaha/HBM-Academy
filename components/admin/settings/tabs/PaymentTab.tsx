"use client";

import { PlatformSettings } from "@/types/settings";
import { useStripeConnection } from "@/hooks/useStripeConnection";
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
  Eye,
  EyeOff,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  RefreshCw,
  Loader2,
  Shield,
  Zap,
  Info,
  XCircle,
  Webhook,
} from "lucide-react";
import { useState, useEffect } from "react";

interface PaymentTabProps {
  settings: Partial<PlatformSettings>;
  updateSetting: (key: keyof PlatformSettings, value: unknown) => void;
}

const KEY_PATTERNS = {
  publishable: /^pk_(test|live)_/,
  secret: /^sk_(test|live)_/,
  webhook: /^whsec_/,
};

interface ValidationState {
  publishable: "valid" | "invalid" | "empty";
  secret: "valid" | "invalid" | "empty";
  webhook: "valid" | "invalid" | "empty";
}

export function PaymentTab({ settings, updateSetting }: PaymentTabProps) {
  const { status, loading: statusLoading, testing, fetchStatus, testConnection } =
    useStripeConnection();

  const [showSecret, setShowSecret] = useState(false);
  const [showWebhook, setShowWebhook] = useState(false);
  // Derive validation status
  const pk = settings.stripe_publishable_key ?? "";
  const sk = settings.stripe_secret_key ?? "";
  const wh = settings.stripe_webhook_secret ?? "";

  const validation: ValidationState = {
    publishable: pk === "" ? "empty" : KEY_PATTERNS.publishable.test(pk) ? "valid" : "invalid",
    secret: sk === "" || sk.startsWith("****") ? "empty" : KEY_PATTERNS.secret.test(sk) ? "valid" : "invalid",
    webhook: wh === "" || wh.startsWith("****") ? "empty" : KEY_PATTERNS.webhook.test(wh) ? "valid" : "invalid",
  };

  // Load status on mount
  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const handleTestConnection = async () => {
    const sk = settings.stripe_secret_key;
    // Only pass the key if it's a real (non-masked) value
    const keyToTest =
      sk && !sk.startsWith("****") ? sk : undefined;
    await testConnection(keyToTest);
  };

  const isLiveMode =
    (settings.stripe_publishable_key ?? "").startsWith("pk_live_") ||
    (settings.stripe_secret_key ?? "").startsWith("sk_live_");

  const webhookEndpoint =
    typeof window !== "undefined"
      ? `${window.location.origin}/api/webhooks/stripe`
      : "https://your-domain.com/api/webhooks/stripe";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Payment Settings</h2>
          <p className="text-muted-foreground mt-1">
            Configure Stripe payment processing for course purchases.
          </p>
        </div>
        {isLiveMode && (
          <Badge className="bg-green-600 hover:bg-green-700 gap-1">
            <Zap className="w-3 h-3" /> Live Mode
          </Badge>
        )}
      </div>

      {/* Connection Status Banner */}
      {!statusLoading && status && (
        <div
          className={`flex items-center gap-3 p-4 rounded-lg border ${
            status.connected
              ? "bg-green-50 border-green-200 text-green-800"
              : "bg-amber-50 border-amber-200 text-amber-800"
          }`}
        >
          {status.connected ? (
            <CheckCircle2 className="w-5 h-5 shrink-0 text-green-600" />
          ) : (
            <AlertTriangle className="w-5 h-5 shrink-0 text-amber-600" />
          )}
          <div className="flex-1 text-sm">
            {status.connected ? (
              <>
                <span className="font-medium">Stripe is connected</span>
                {" · "}
                Running in{" "}
                <span className="font-medium">
                  {status.test_mode ? "Test" : "Live"} mode
                </span>
                {status.has_webhook && " · Webhook configured"}
              </>
            ) : (
              <span>
                {status.message ?? status.error ?? "Stripe is not connected. Enter your API keys below."}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Stripe API Keys */}
      <Card className="border-l-4 border-l-blue-600">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-600" />
                Stripe API Keys
              </CardTitle>
              <CardDescription className="mt-1">
                Get your keys from the{" "}
                <a
                  href="https://dashboard.stripe.com/apikeys"
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 hover:underline inline-flex items-center gap-0.5"
                >
                  Stripe Dashboard <ExternalLink className="w-3 h-3" />
                </a>
              </CardDescription>
            </div>
            {statusLoading && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
          </div>
        </CardHeader>

        <CardContent className="space-y-5">
          {/* Publishable Key */}
          <div className="grid gap-2">
            <Label htmlFor="stripe_pk" className="flex items-center gap-2">
              Publishable Key
              <span className="text-xs font-normal text-muted-foreground">(safe to expose in frontend)</span>
            </Label>
            <div className="relative">
              <Input
                id="stripe_pk"
                value={settings.stripe_publishable_key ?? ""}
                onChange={(e) => updateSetting("stripe_publishable_key", e.target.value)}
                placeholder="pk_test_... or pk_live_..."
                autoComplete="off"
                data-1p-ignore
                className={`font-mono text-sm pr-8 ${
                  validation.publishable === "invalid"
                    ? "border-red-400 focus-visible:ring-red-400"
                    : validation.publishable === "valid"
                    ? "border-green-400 focus-visible:ring-green-400"
                    : ""
                }`}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {validation.publishable === "valid" && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                {validation.publishable === "invalid" && <XCircle className="w-4 h-4 text-red-500" />}
              </div>
            </div>
            {validation.publishable === "invalid" && (
              <p className="text-xs text-red-500">Must start with pk_test_ or pk_live_</p>
            )}
          </div>

          {/* Secret Key */}
          <div className="grid gap-2">
            <Label htmlFor="stripe_sk" className="flex items-center gap-2">
              Secret Key
              <Badge variant="outline" className="text-xs font-normal border-red-200 text-red-700 bg-red-50">
                Server only — never expose
              </Badge>
            </Label>
            <div className="relative">
              <Input
                id="stripe_sk"
                type={showSecret ? "text" : "password"}
                value={settings.stripe_secret_key ?? ""}
                onChange={(e) => updateSetting("stripe_secret_key", e.target.value)}
                placeholder="sk_test_... or sk_live_..."
                autoComplete="new-password"
                data-1p-ignore
                className={`font-mono text-sm pr-16 ${
                  validation.secret === "invalid"
                    ? "border-red-400 focus-visible:ring-red-400"
                    : validation.secret === "valid"
                    ? "border-green-400 focus-visible:ring-green-400"
                    : ""
                }`}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                {validation.secret === "valid" && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                {validation.secret === "invalid" && <XCircle className="w-4 h-4 text-red-500" />}
                <button
                  type="button"
                  onClick={() => setShowSecret(!showSecret)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            {validation.secret === "invalid" && (
              <p className="text-xs text-red-500">Must start with sk_test_ or sk_live_</p>
            )}
          </div>

          {/* Webhook Secret */}
          <div className="grid gap-2">
            <Label htmlFor="stripe_wh" className="flex items-center gap-2">
              <Webhook className="w-4 h-4" />
              Webhook Signing Secret
            </Label>
            <div className="relative">
              <Input
                id="stripe_wh"
                type={showWebhook ? "text" : "password"}
                value={settings.stripe_webhook_secret ?? ""}
                onChange={(e) => updateSetting("stripe_webhook_secret", e.target.value)}
                placeholder="whsec_..."
                autoComplete="new-password"
                data-1p-ignore
                className={`font-mono text-sm pr-16 ${
                  validation.webhook === "invalid"
                    ? "border-red-400 focus-visible:ring-red-400"
                    : validation.webhook === "valid"
                    ? "border-green-400 focus-visible:ring-green-400"
                    : ""
                }`}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                {validation.webhook === "valid" && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                {validation.webhook === "invalid" && <XCircle className="w-4 h-4 text-red-500" />}
                <button
                  type="button"
                  onClick={() => setShowWebhook(!showWebhook)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  {showWebhook ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            {validation.webhook === "invalid" && (
              <p className="text-xs text-red-500">Must start with whsec_</p>
            )}

            {/* Webhook endpoint info */}
            <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-md border border-dashed">
              <Info className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
              <div className="text-xs text-muted-foreground space-y-1">
                <p className="font-medium text-foreground">Register this webhook URL in Stripe:</p>
                <code className="block bg-background px-2 py-1 rounded border font-mono text-xs select-all">
                  {webhookEndpoint}
                </code>
                <p>Events to listen for: <span className="font-mono">checkout.session.completed, payment_intent.succeeded, payment_intent.payment_failed</span></p>
              </div>
            </div>
          </div>
        </CardContent>

        <CardFooter className="bg-muted/30 border-t flex justify-between gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleTestConnection}
            disabled={testing}
            id="stripe-test-connection"
          >
            {testing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Testing...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" /> Test Connection
              </>
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground"
            onClick={() => window.open("https://dashboard.stripe.com", "_blank")}
          >
            Stripe Dashboard <ExternalLink className="w-3 h-3 ml-1" />
          </Button>
        </CardFooter>
      </Card>

      {/* Currency & Pricing */}
      <Card>
        <CardHeader>
          <CardTitle>Currency &amp; Pricing</CardTitle>
          <CardDescription>Set base currency and price limits for courses.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Primary Currency</Label>
              <Select
                value={settings.payment_currency ?? "USD"}
                onValueChange={(val) => updateSetting("payment_currency", val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD – US Dollar</SelectItem>
                  <SelectItem value="EUR">EUR – Euro</SelectItem>
                  <SelectItem value="EGP">EGP – Egyptian Pound</SelectItem>
                  <SelectItem value="GBP">GBP – British Pound</SelectItem>
                  <SelectItem value="SAR">SAR – Saudi Riyal</SelectItem>
                  <SelectItem value="AED">AED – UAE Dirham</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>Default Tax Rate (%)</Label>
              <div className="relative">
                <Input
                  type="number"
                  min={0}
                  max={100}
                  step={0.1}
                  value={settings.tax_rate ?? ""}
                  onChange={(e) => updateSetting("tax_rate", parseFloat(e.target.value))}
                  className="pr-6"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">%</span>
              </div>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Minimum Course Price</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                <Input
                  type="number"
                  min={0}
                  step={0.01}
                  value={settings.minimum_course_price ?? ""}
                  onChange={(e) => updateSetting("minimum_course_price", parseFloat(e.target.value))}
                  className="pl-6"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Maximum Course Price</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                <Input
                  type="number"
                  min={0}
                  step={0.01}
                  value={settings.maximum_course_price ?? ""}
                  onChange={(e) => updateSetting("maximum_course_price", parseFloat(e.target.value))}
                  className="pl-6"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Notice */}
      <div className="flex items-start gap-3 text-sm bg-amber-50 text-amber-800 p-4 rounded-lg border border-amber-200">
        <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
        <p>
          <strong>Security reminder:</strong> Secret keys and webhook secrets are stored encrypted and never
          returned in full after saving. Switching between test and live mode requires updating all three keys.
        </p>
      </div>
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { LibrarySettings } from "@/types/video-library";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DEFAULT_SETTINGS: LibrarySettings = {
  default_privacy: "private",
  auto_generate_thumbnails: true,
  notify_on_storage_limit: true,
  storage_limit_threshold: 80,
};

const SettingsModal: React.FC<SettingsModalProps> = ({
  open,
  onOpenChange,
}) => {
  const [settings, setSettings] = useState<LibrarySettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      fetchSettings();
    }
  }, [open]);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/video-library/settings");
      if (res.ok) {
        const data = await res.json();
        setSettings(data || DEFAULT_SETTINGS);
      }
    } catch (error) {
      console.error("Failed to fetch settings", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/video-library/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (!res.ok) throw new Error("Failed to save settings");

      toast({
        title: "Settings Saved",
        description: "Library preferences have been updated.",
      });
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save settings",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Library Settings</DialogTitle>
          <DialogDescription>
            Configure your video library defaults and notifications.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid gap-6 py-4">
            {/* Default Privacy */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="privacy">Default Visibility</Label>
              <Select
                value={settings.default_privacy}
                onValueChange={(value: "public" | "private") =>
                  setSettings({ ...settings, default_privacy: value })
                }
              >
                <SelectTrigger id="privacy">
                  <SelectValue placeholder="Select visibility" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                New uploads will use this visibility by default.
              </p>
            </div>

            {/* Auto Thumbnails */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto-generate Thumbnails</Label>
                <p className="text-xs text-muted-foreground">
                  Capture a preview frame on upload.
                </p>
              </div>
              <Switch
                checked={settings.auto_generate_thumbnails}
                onCheckedChange={(checked) =>
                  setSettings({
                    ...settings,
                    auto_generate_thumbnails: checked,
                  })
                }
              />
            </div>

            {/* Storage Notifications */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Storage Alerts</Label>
                <p className="text-xs text-muted-foreground">
                  Notify me when storage is almost full.
                </p>
              </div>
              <Switch
                checked={settings.notify_on_storage_limit}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, notify_on_storage_limit: checked })
                }
              />
            </div>

            {settings.notify_on_storage_limit && (
              <div className="space-y-4 pt-2">
                <div className="flex justify-between">
                  <Label>Alert Threshold</Label>
                  <span className="text-xs font-medium">
                    {settings.storage_limit_threshold}%
                  </span>
                </div>
                <Slider
                  value={[settings.storage_limit_threshold]}
                  max={100}
                  step={5}
                  onValueChange={(vals) =>
                    setSettings({
                      ...settings,
                      storage_limit_threshold: vals[0],
                    })
                  }
                />
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Settings
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsModal;

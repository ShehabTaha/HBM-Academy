"use client";

import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface RememberMeProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

export function RememberMe({ checked, onCheckedChange }: RememberMeProps) {
  return (
    <div className="flex items-center space-x-2">
      <Checkbox
        id="remember-me"
        checked={checked}
        onCheckedChange={(checked) => onCheckedChange(checked as boolean)}
      />
      <Label
        htmlFor="remember-me"
        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
      >
        Remember me for 30 days
      </Label>
    </div>
  );
}

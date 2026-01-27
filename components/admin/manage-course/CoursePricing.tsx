"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Loader2, DollarSign, Info } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { CourseWithDetails } from "./types";
import { CourseService } from "@/lib/services/courses.service";

// Inline Radio Group if not available in UI components yet, checking file list...
// I don't see radio-group.tsx in components/ui list from previous steps.
// I will implement a simple styled radio group inline or create a component if needed.
// For speed and reliability without checking file existence which costs a step, I'll use standard HTML inputs styled with Tailwind.

import Link from "next/link";

interface CoursePricingProps {
  course: CourseWithDetails;
  onUpdate: () => void;
}

export function CoursePricing({ course, onUpdate }: CoursePricingProps) {
  const { toast } = useToast();

  const draftKey = `hbm_course_pricing_draft_${course.id}`;

  const [paymentType, setPaymentType] = useState<
    "free" | "one-time" | "subscription" | "installment"
  >(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(draftKey);
      if (saved) {
        try {
          return JSON.parse(saved).paymentType;
        } catch (e) {}
      }
    }
    return (
      (course.payment_type as any) || (course.price > 0 ? "one-time" : "free")
    );
  });

  const [price, setPrice] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(draftKey);
      if (saved) {
        try {
          return JSON.parse(saved).price;
        } catch (e) {}
      }
    }
    return course.price > 0 ? course.price.toString() : "";
  });

  const [recurringInterval, setRecurringInterval] = useState<"month" | "year">(
    () => {
      if (typeof window !== "undefined") {
        const saved = localStorage.getItem(draftKey);
        if (saved) {
          try {
            return JSON.parse(saved).recurringInterval;
          } catch (e) {}
        }
      }
      return (course.recurring_interval as any) || "month";
    },
  );
  const [recurringPrice, setRecurringPrice] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(draftKey);
      if (saved) {
        try {
          return JSON.parse(saved).recurringPrice;
        } catch (e) {}
      }
    }
    return course.recurring_price ? course.recurring_price.toString() : "";
  });

  const [installmentCount, setInstallmentCount] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(draftKey);
      if (saved) {
        try {
          return JSON.parse(saved).installmentCount;
        } catch (e) {}
      }
    }
    return course.installment_count ? course.installment_count.toString() : "3";
  });
  const [totalInstallmentPrice, setTotalInstallmentPrice] = useState<string>(
    () => {
      if (typeof window !== "undefined") {
        const saved = localStorage.getItem(draftKey);
        if (saved) {
          try {
            return JSON.parse(saved).totalInstallmentPrice;
          } catch (e) {}
        }
      }
      return course.price > 0 ? course.price.toString() : "";
    },
  );

  const [isSaving, setIsSaving] = useState(false);

  // Sync state to localStorage
  useEffect(() => {
    const draftData = {
      paymentType,
      price,
      recurringInterval,
      recurringPrice,
      installmentCount,
      totalInstallmentPrice,
    };

    const isChanged =
      paymentType !==
        (course.payment_type || (course.price > 0 ? "one-time" : "free")) ||
      price !== (course.price > 0 ? course.price.toString() : "") ||
      recurringInterval !== (course.recurring_interval || "month") ||
      recurringPrice !==
        (course.recurring_price ? course.recurring_price.toString() : "") ||
      installmentCount !==
        (course.installment_count
          ? course.installment_count.toString()
          : "3") ||
      totalInstallmentPrice !==
        (course.price > 0 ? course.price.toString() : "");

    if (isChanged) {
      localStorage.setItem(draftKey, JSON.stringify(draftData));
    } else {
      localStorage.removeItem(draftKey);
    }
  }, [
    paymentType,
    price,
    recurringInterval,
    recurringPrice,
    installmentCount,
    totalInstallmentPrice,
    course,
    draftKey,
  ]);

  // Sync state when course data updates from parent
  useEffect(() => {
    if (!localStorage.getItem(draftKey)) {
      setPaymentType(
        (course.payment_type as any) ||
          (course.price > 0 ? "one-time" : "free"),
      );
      setPrice(course.price > 0 ? course.price.toString() : "");
      setRecurringInterval((course.recurring_interval as any) || "month");
      setRecurringPrice(
        course.recurring_price ? course.recurring_price.toString() : "",
      );
      setInstallmentCount(
        course.installment_count ? course.installment_count.toString() : "3",
      );
      setTotalInstallmentPrice(course.price > 0 ? course.price.toString() : "");
    }
  }, [course, draftKey]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updateData: any = {
        payment_type: paymentType,
      };

      if (paymentType === "free") {
        updateData.price = 0;
        updateData.recurring_price = null;
        updateData.recurring_interval = null;
        updateData.installment_count = null;
      } else if (paymentType === "one-time") {
        const finalPrice = Number(price);
        if (isNaN(finalPrice) || finalPrice < 0)
          throw new Error("Please enter a valid price");
        updateData.price = finalPrice;
        updateData.recurring_price = null;
        updateData.recurring_interval = null;
        updateData.installment_count = null;
      } else if (paymentType === "subscription") {
        const finalRecPrice = Number(recurringPrice);
        if (isNaN(finalRecPrice) || finalRecPrice < 0)
          throw new Error("Please enter a valid subscription price");
        updateData.recurring_price = finalRecPrice;
        updateData.recurring_interval = recurringInterval;
        updateData.price = 0; // Or null, depending on schema. Using 0 for main price.
        updateData.installment_count = null;
      } else if (paymentType === "installment") {
        const finalTotalPrice = Number(totalInstallmentPrice);
        const count = Number(installmentCount);
        if (isNaN(finalTotalPrice) || finalTotalPrice < 0)
          throw new Error("Please enter a valid total price");
        if (isNaN(count) || count < 2)
          throw new Error("Installment count must be at least 2");

        updateData.price = finalTotalPrice;
        updateData.installment_count = count;
        updateData.recurring_price = null;
        updateData.recurring_interval = null;
      }

      const { error } = await CourseService.updateCourse(course.id, updateData);

      if (error) throw new Error(error);

      toast({ title: "Success", description: "Pricing updated successfully" });

      // Clear draft on successful save
      localStorage.removeItem(draftKey);

      onUpdate();
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to update pricing",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold tracking-tight">Pricing</h2>
        <p className="text-muted-foreground">
          Set the initial pricing option that will be displayed on the course
          landing page.
        </p>
      </div>

      {/* Warning Card mimicking the screenshot */}
      {/* Info Card */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4 flex gap-3 text-blue-900">
        <div className="mt-0.5">
          <Info className="h-5 w-5 text-blue-600" />
        </div>
        <div className="space-y-2">
          <h4 className="font-semibold text-sm">
            Set up payments to activate checkout
          </h4>
          <p className="text-sm opacity-90">
            Products can&apos;t be purchased if payments setup isn&apos;t
            complete.
          </p>
          <Button
            size="sm"
            variant="default"
            className="bg-blue-700 hover:bg-blue-800 text-white h-8 text-xs"
            asChild
          >
            <Link href="/dashboard/settings">Set up payments ↗</Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Primary Pricing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Free Option */}
          <div className="flex items-start space-x-3">
            <input
              id="pricing-free"
              type="radio"
              name="pricing"
              value="free"
              checked={paymentType === "free"}
              onChange={() => setPaymentType("free")}
              className="mt-1 h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-600"
            />
            <div className="space-y-1">
              <label
                htmlFor="pricing-free"
                className="text-sm font-medium leading-none cursor-pointer"
              >
                Free
              </label>
              <p className="text-sm text-muted-foreground">
                Offer free content to your subscribers.
              </p>
            </div>
          </div>

          <Separator />

          {/* One-time Payment Option */}
          <div className="flex items-start space-x-3">
            <input
              id="pricing-one-time"
              type="radio"
              name="pricing"
              value="one-time"
              checked={paymentType === "one-time"}
              onChange={() => setPaymentType("one-time")}
              className="mt-1 h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-600"
            />
            <div className="space-y-4 w-full">
              <div className="space-y-1">
                <label
                  htmlFor="pricing-one-time"
                  className="text-sm font-medium leading-none cursor-pointer"
                >
                  One-time payment
                </label>
                <p className="text-sm text-muted-foreground">
                  Charge students a one-time fee to access the content.
                </p>
              </div>

              {paymentType === "one-time" && (
                <div className="ml-0 pl-0 pt-2 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="flex flex-wrap gap-8">
                    <div className="w-40 space-y-2">
                      <label className="text-xs font-semibold text-gray-700">
                        Price
                      </label>
                      <div className="relative">
                        <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                        <Input
                          type="number"
                          className="pl-8"
                          placeholder="0.00"
                          value={price}
                          onChange={(e) => setPrice(e.target.value)}
                          min="0"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Subscription Option */}
          <div className="flex items-start space-x-3">
            <input
              id="pricing-subscription"
              type="radio"
              name="pricing"
              value="subscription"
              checked={paymentType === "subscription"}
              onChange={() => setPaymentType("subscription")}
              className="mt-1 h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-600"
            />
            <div className="space-y-4 w-full">
              <div className="space-y-1">
                <label
                  htmlFor="pricing-subscription"
                  className="text-sm font-medium leading-none cursor-pointer"
                >
                  Subscription / Membership
                </label>
                <p className="text-sm text-muted-foreground">
                  Charge students recurring monthly fees.
                </p>
              </div>

              {paymentType === "subscription" && (
                <div className="ml-0 pl-0 pt-2 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="flex flex-wrap gap-6">
                    <div className="w-40 space-y-2">
                      <label className="text-xs font-semibold text-gray-700">
                        Recurring Price
                      </label>
                      <div className="relative">
                        <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                        <Input
                          type="number"
                          className="pl-8"
                          placeholder="0.00"
                          value={recurringPrice}
                          onChange={(e) => setRecurringPrice(e.target.value)}
                          min="0"
                        />
                      </div>
                    </div>
                    <div className="w-40 space-y-2">
                      <label className="text-xs font-semibold text-gray-700">
                        Interval
                      </label>
                      <select
                        className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
                        value={recurringInterval}
                        onChange={(e) =>
                          setRecurringInterval(e.target.value as any)
                        }
                      >
                        <option value="month">Monthly</option>
                        <option value="year">Yearly</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Installment / Payment Plan Option */}
          <div className="flex items-start space-x-3">
            <input
              id="pricing-installment"
              type="radio"
              name="pricing"
              value="installment"
              checked={paymentType === "installment"}
              onChange={() => setPaymentType("installment")}
              className="mt-1 h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-600"
            />
            <div className="space-y-4 w-full">
              <div className="space-y-1">
                <label
                  htmlFor="pricing-installment"
                  className="text-sm font-medium leading-none cursor-pointer"
                >
                  Monthly Payment Plan
                </label>
                <p className="text-sm text-muted-foreground">
                  Divide the full price of your course into monthly payments.
                </p>
              </div>

              {paymentType === "installment" && (
                <div className="ml-0 pl-0 pt-2 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="flex flex-wrap gap-6">
                    <div className="w-40 space-y-2">
                      <label className="text-xs font-semibold text-gray-700">
                        Total Price
                      </label>
                      <div className="relative">
                        <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                        <Input
                          type="number"
                          className="pl-8"
                          placeholder="0.00"
                          value={totalInstallmentPrice}
                          onChange={(e) =>
                            setTotalInstallmentPrice(e.target.value)
                          }
                          min="0"
                        />
                      </div>
                    </div>
                    <div className="w-40 space-y-2">
                      <label className="text-xs font-semibold text-gray-700">
                        Number of Months
                      </label>
                      <Input
                        type="number"
                        placeholder="3"
                        value={installmentCount}
                        onChange={(e) => setInstallmentCount(e.target.value)}
                        min="2"
                        max="12"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="pt-4">
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-blue-700 hover:bg-blue-800"
            >
              {isSaving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Save primary pricing
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

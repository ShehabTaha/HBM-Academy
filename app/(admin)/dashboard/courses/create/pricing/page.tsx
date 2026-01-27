"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { DollarSign, Info } from "lucide-react";
import { useCourse } from "@/contexts/CourseContext";
import Link from "next/link";

export default function CreatePricingPage() {
  const { metadata, updateMetadata } = useCourse();

  // Local state initialized from context
  const [paymentType, setPaymentType] = useState(
    metadata.paymentType || "one-time",
  );
  const [price, setPrice] = useState(metadata.price?.toString() || "");
  const [recurringPrice, setRecurringPrice] = useState(
    metadata.recurringPrice?.toString() || "",
  );
  const [recurringInterval, setRecurringInterval] = useState(
    metadata.recurringInterval || "month",
  );
  const [installmentCount, setInstallmentCount] = useState(
    metadata.installmentCount?.toString() || "3",
  );
  const [totalInstallmentPrice, setTotalInstallmentPrice] = useState(
    metadata.price?.toString() || "",
  );

  // Update context when local state changes
  useEffect(() => {
    const finalPrice =
      paymentType === "free"
        ? 0
        : paymentType === "one-time"
          ? Number(price)
          : paymentType === "installment"
            ? Number(totalInstallmentPrice)
            : 0;

    updateMetadata({
      paymentType,
      price: isNaN(finalPrice) ? 0 : finalPrice,
      recurringPrice:
        paymentType === "subscription" ? Number(recurringPrice) : null,
      recurringInterval:
        paymentType === "subscription" ? recurringInterval : null,
      installmentCount:
        paymentType === "installment" ? Number(installmentCount) : null,
    });
  }, [
    paymentType,
    price,
    recurringPrice,
    recurringInterval,
    installmentCount,
    totalInstallmentPrice,
  ]);

  return (
    <div className="w-full max-w-3xl py-8 space-y-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold tracking-tight">Pricing</h2>
        <p className="text-muted-foreground">
          Set the initial pricing option for your new course.
        </p>
      </div>

      {/* Info Card */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4 flex gap-3 text-blue-900">
        <Info className="h-5 w-5 mt-0.5 text-blue-600" />
        <div className="space-y-1">
          <h4 className="font-semibold text-sm">Payment Settings</h4>
          <p className="text-sm opacity-90">
            You can configure your global payment providers and currency in the
            <Link
              href="/dashboard/settings"
              className="font-medium underline ml-1"
            >
              Settings
            </Link>{" "}
            page.
          </p>
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
                  <div className="w-40 space-y-2">
                    <label className="text-xs font-semibold text-gray-700">
                      Price (USD)
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
        </CardContent>
      </Card>

      <div className="flex justify-end pt-4">
        <Button asChild className="bg-blue-600 hover:bg-blue-700">
          <Link href="/dashboard/courses/create/landing">
            Continue to Landing Page
          </Link>
        </Button>
      </div>
    </div>
  );
}

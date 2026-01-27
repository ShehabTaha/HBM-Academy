"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash, ChevronDown, ChevronUp, Star } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface Review {
  id: string;
  name: string;
  avatar?: string;
  rating: number;
  comment: string;
  date?: string;
}

interface StudentReviewsEditorProps {
  settings: any; // Using any temporarily to avoid strict type issues during transition, or strictly typed as LandingPageSettings
  updateSettings: (updates: any) => void;
}

export default function StudentReviewsEditor({
  settings,
  updateSettings,
}: StudentReviewsEditorProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const reviewsSource = settings.reviews_source || "database";
  const manualReviews = (settings.manual_reviews as Review[]) || [];

  const addReview = () => {
    const newId = Math.random().toString(36).substring(2, 9);
    const newReview: Review = {
      id: newId,
      name: "Student Name",
      rating: 5,
      comment: "This course Changed my career! Highly recommended.",
      date: new Date().toISOString().split("T")[0],
    };
    updateSettings({ manual_reviews: [...manualReviews, newReview] });
    setExpandedId(newId);
  };

  const removeReview = (id: string) => {
    updateSettings({
      manual_reviews: manualReviews.filter((r) => r.id !== id),
    });
    if (expandedId === id) setExpandedId(null);
  };

  const updateReview = (id: string, updates: Partial<Review>) => {
    updateSettings({
      manual_reviews: manualReviews.map((r) =>
        r.id === id ? { ...r, ...updates } : r,
      ),
    });
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Source Selection */}
      <div className="flex flex-col gap-3">
        <label className="text-sm font-medium text-gray-700">
          Reviews Source
        </label>
        <RadioGroup
          value={reviewsSource}
          onValueChange={(value) => updateSettings({ reviews_source: value })}
          className="flex space-x-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="database" id="source-database" />
            <Label htmlFor="source-database" className="cursor-pointer">
              From Database (Real Students)
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="manual" id="source-manual" />
            <Label htmlFor="source-manual" className="cursor-pointer">
              Manual Custom Reviews
            </Label>
          </div>
        </RadioGroup>
        <p className="text-xs text-muted-foreground">
          {reviewsSource === "database"
            ? "Automatically display reviews from enrolled students."
            : "Manually add and curate reviews to display on the landing page."}
        </p>
      </div>

      {/* Database Settings */}
      {reviewsSource === "database" && (
        <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg border">
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-600">Sort By</label>
            <Select
              value={settings.reviews_sort_by || "newest"}
              onValueChange={(val) => updateSettings({ reviews_sort_by: val })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sort order" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="highest_rating">Highest Rating</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-600">
              Max Reviews to Show
            </label>
            <Select
              value={String(settings.reviews_count || 5)}
              onValueChange={(val) =>
                updateSettings({ reviews_count: Number(val) })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Count" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3">3 Reviews</SelectItem>
                <SelectItem value="5">5 Reviews</SelectItem>
                <SelectItem value="10">10 Reviews</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* Manual Reviews Editor */}
      {reviewsSource === "manual" && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3">
            {manualReviews.map((review) => (
              <div
                key={review.id}
                className="overflow-hidden rounded-lg border border-gray-200"
              >
                <div
                  className={`flex cursor-pointer items-center justify-between p-3 transition-colors ${
                    expandedId === review.id
                      ? "bg-gray-50 border-b"
                      : "bg-white hover:bg-gray-50"
                  }`}
                  onClick={() =>
                    setExpandedId(expandedId === review.id ? null : review.id)
                  }
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
                      {review.name.charAt(0)}
                    </div>
                    <div className="flex flex-col overflow-hidden">
                      <span className="truncate text-sm font-medium text-gray-700">
                        {review.name}
                      </span>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={10}
                            className={
                              i < review.rating
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300"
                            }
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeReview(review.id);
                      }}
                      className="text-gray-400 hover:text-red-500 p-1"
                    >
                      <Trash size={14} />
                    </button>
                    {expandedId === review.id ? (
                      <ChevronUp size={16} />
                    ) : (
                      <ChevronDown size={16} />
                    )}
                  </div>
                </div>

                {expandedId === review.id && (
                  <div className="bg-white p-4 flex flex-col gap-4 animate-in slide-in-from-top-1">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-medium text-gray-600">
                          Student Name
                        </label>
                        <Input
                          value={review.name}
                          onChange={(e) =>
                            updateReview(review.id, { name: e.target.value })
                          }
                          className="text-sm"
                          placeholder="e.g. John Doe"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-medium text-gray-600">
                          Rating (1-5)
                        </label>
                        <Input
                          type="number"
                          min="1"
                          max="5"
                          value={review.rating}
                          onChange={(e) =>
                            updateReview(review.id, {
                              rating: Math.min(
                                5,
                                Math.max(1, parseInt(e.target.value) || 5),
                              ),
                            })
                          }
                          className="text-sm"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-medium text-gray-600">
                        Review Comment
                      </label>
                      <textarea
                        value={review.comment}
                        onChange={(e) =>
                          updateReview(review.id, { comment: e.target.value })
                        }
                        className="min-h-[80px] w-full rounded-md border border-gray-300 p-2 text-sm outline-none focus:border-primary-blue"
                        placeholder="Enter the review text..."
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={addReview}
            className="w-full border-dashed border-2 hover:bg-blue-50 hover:border-primary-blue hover:text-primary-blue transition-all"
          >
            <Plus size={16} className="mr-2" /> Add Custom Review
          </Button>
        </div>
      )}
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash, ChevronDown, ChevronUp, Star, Loader2, Upload } from "lucide-react";
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
  role?: string;
}

interface StudentReviewsEditorProps {
  settings: any; // Using any temporarily to avoid strict type issues during transition, or strictly typed as LandingPageSettings
  updateSettings: (updates: any) => void;
  uploadReviewAvatar?: (file: File) => Promise<{ url: string; path: string }>;
}

export default function StudentReviewsEditor({
  settings,
  updateSettings,
  uploadReviewAvatar,
}: StudentReviewsEditorProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [uploadingId, setUploadingId] = useState<string | null>(null);

  const showRealReviews = settings.show_real_reviews ?? true;
  const showCustomReviews = settings.show_custom_reviews ?? false;
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

  const handleAvatarUpload = async (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !uploadReviewAvatar) return;

    setUploadingId(id);
    try {
      const result = await uploadReviewAvatar(file);
      updateReview(id, { avatar: result.url });
    } catch (err) {
      console.error("Avatar upload error:", err);
    } finally {
      setUploadingId(null);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Source Selection */}
      <div className="flex flex-col gap-3">
        <label className="text-sm font-medium text-gray-700">
          Reviews Source Options
        </label>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="show_real_reviews"
              checked={showRealReviews}
              onChange={(e) =>
                updateSettings({ show_real_reviews: e.target.checked })
              }
              className="h-4 w-4 rounded border-gray-300 text-primary-blue focus:ring-primary-blue"
            />
            <label
              htmlFor="show_real_reviews"
              className="text-sm text-gray-700 cursor-pointer"
            >
              From Database (Real Students)
            </label>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="show_custom_reviews"
              checked={showCustomReviews}
              onChange={(e) =>
                updateSettings({ show_custom_reviews: e.target.checked })
              }
              className="h-4 w-4 rounded border-gray-300 text-primary-blue focus:ring-primary-blue"
            />
            <label
              htmlFor="show_custom_reviews"
              className="text-sm text-gray-700 cursor-pointer"
            >
              Manual Custom Reviews
            </label>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          You can enable one or both sources. If both are enabled, they will be combined.
        </p>
      </div>

      {/* Database Settings */}
      {showRealReviews && (
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
      {showCustomReviews && (
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
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 text-xs font-bold overflow-hidden">
                      {review.avatar ? (
                        <img src={review.avatar} alt={review.name} className="w-full h-full object-cover" />
                      ) : (
                        review.name.charAt(0)
                      )}
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
                          Role/Title (Optional)
                        </label>
                        <Input
                          value={review.role || ""}
                          onChange={(e) =>
                            updateReview(review.id, { role: e.target.value })
                          }
                          className="text-sm"
                          placeholder="e.g. UX Designer"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5 col-span-2 md:col-span-1">
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
                      <div className="flex flex-col gap-1.5 col-span-2 md:col-span-1">
                        <label className="text-xs font-medium text-gray-600">
                          Reviewer Photo
                        </label>
                        <div className="flex items-center gap-3">
                          {review.avatar && (
                            <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full border">
                              <img src={review.avatar} alt="Avatar" className="h-full w-full object-cover" />
                            </div>
                          )}
                          <label className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-gray-300 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 hover:text-primary-blue hover:border-primary-blue transition-colors">
                            {uploadingId === review.id ? (
                              <Loader2 className="h-4 w-4 animate-spin text-primary-blue" />
                            ) : (
                              <>
                                <Upload size={14} />
                                {review.avatar ? "Change Photo" : "Upload Photo"}
                              </>
                            )}
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handleAvatarUpload(review.id, e)}
                            />
                          </label>
                          {review.avatar && (
                            <button
                              onClick={() => updateReview(review.id, { avatar: "" })}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-md transition-colors"
                              title="Remove Photo"
                            >
                              <Trash size={14} />
                            </button>
                          )}
                        </div>
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

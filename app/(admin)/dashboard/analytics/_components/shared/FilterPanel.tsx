/**
 * FilterPanel Component
 * Date, course, and cohort filtering controls
 */

"use client";

import { Calendar, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AnalyticsFilters, DateRange } from "@/lib/analytics/types";

export interface CourseOption {
  id: string;
  title: string;
}

interface FilterPanelProps {
  filters: AnalyticsFilters;
  courses?: CourseOption[];
  onDateRangeChange: (range: DateRange) => void;
  onCustomDateRangeChange: (start: Date, end: Date) => void;
  onCoursesChange: (courses: string[]) => void;
  onCohortsChange: (cohorts: string[]) => void;
  onReset: () => void;
  hasActiveFilters: boolean;
}

export function FilterPanel({
  filters,
  courses = [],
  onDateRangeChange,
  onCoursesChange,
  onCohortsChange,
  onReset,
  hasActiveFilters,
}: FilterPanelProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-semibold flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Filters
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Refine analytics by date range, course, or cohort
            </p>
          </div>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={onReset}>
              <X className="h-4 w-4 mr-1" />
              Reset
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Date Range */}
          <div className="space-y-2">
            <Label htmlFor="dateRange">Date Range</Label>
            <Select
              value={filters.dateRange}
              onValueChange={(value) => onDateRangeChange(value as DateRange)}
            >
              <SelectTrigger id="dateRange">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={DateRange.LAST_7_DAYS}>
                  Last 7 Days
                </SelectItem>
                <SelectItem value={DateRange.LAST_30_DAYS}>
                  Last 30 Days
                </SelectItem>
                <SelectItem value={DateRange.LAST_90_DAYS}>
                  Last 90 Days
                </SelectItem>
                <SelectItem value={DateRange.LAST_6_MONTHS}>
                  Last 6 Months
                </SelectItem>
                <SelectItem value={DateRange.LAST_YEAR}>Last Year</SelectItem>
                <SelectItem value={DateRange.CUSTOM}>Custom Range</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Course Filter */}
          <div className="space-y-2">
            <Label htmlFor="courses">Courses</Label>
            <Select
              onValueChange={(val) =>
                onCoursesChange(val === "all" ? [] : [val])
              }
            >
              <SelectTrigger id="courses">
                <SelectValue placeholder="All Courses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Courses</SelectItem>
                {courses.length > 0 ? (
                  courses.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.title}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="loading" disabled>
                    Loading courses...
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Cohort Filter - Placeholder */}
          <div className="space-y-2">
            <Label htmlFor="cohorts">Cohorts</Label>
            <Select
              onValueChange={(val) =>
                onCohortsChange(val === "all" ? [] : [val])
              }
            >
              <SelectTrigger id="cohorts">
                <SelectValue placeholder="All Cohorts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cohorts</SelectItem>
                {/* Cohorts would be loaded dynamically */}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

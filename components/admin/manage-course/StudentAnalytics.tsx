"use client";

import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import {
  BarChart,
  Search,
  TrendingUp,
  Users,
  Clock,
  Star,
  Download,
  MoreVertical,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { createClient } from "@/lib/supabase/client";
import { CourseWithDetails } from "./types";
import { Database } from "@/types/database.types";

interface StudentAnalyticsProps {
  course: CourseWithDetails;
}

type EnrollmentWithStudent =
  Database["public"]["Tables"]["enrollments"]["Row"] & {
    student: Database["public"]["Tables"]["users"]["Row"];
  };

export function StudentAnalytics({ course }: StudentAnalyticsProps) {
  const [enrollments, setEnrollments] = useState<EnrollmentWithStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchEnrollments = async () => {
      setLoading(true);
      const supabase = createClient();
      const { data, error } = await supabase
        .from("enrollments")
        .select(
          `
            *,
            student:users(*)
        `,
        )
        .eq("course_id", course.id)
        .order("enrolled_at", { ascending: false });

      if (!error && data) {
        setEnrollments(data as unknown as EnrollmentWithStudent[]);
      }
      setLoading(false);
    };

    fetchEnrollments();
  }, [course.id]);

  const filteredEnrollments = enrollments.filter(
    (enrollment) =>
      enrollment.student.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      enrollment.student.email
        .toLowerCase()
        .includes(searchQuery.toLowerCase()),
  );

  const totalStudents = enrollments.length;
  const avgCompletion =
    totalStudents > 0
      ? Math.round(
          enrollments.reduce((acc, curr) => acc + curr.progress_percentage, 0) /
            totalStudents,
        )
      : 0;

  // Mock data for hours watched since we don't track seconds watched in enrollment directly easily without summing progress table
  const totalWatchTime = Math.round(
    (((avgCompletion * course.duration) / 100) * totalStudents) / 60,
  );

  return (
    <div className="space-y-6">
      {/* Metrics Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Enrollments
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStudents}</div>
            <p className="text-xs text-muted-foreground">
              +
              {
                enrollments.filter(
                  (e) =>
                    new Date(e.enrolled_at) >
                    new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                ).length
              }{" "}
              in last 7 days
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Completion Rate
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgCompletion}%</div>
            <Progress value={avgCompletion} className="h-2 mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avg. Engagement
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalWatchTime}h</div>
            <p className="text-xs text-muted-foreground">
              Est. Total Watch Time
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Course Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.8</div>{" "}
            {/* Mock rating for now, fetching reviews is separate */}
            <div className="flex items-center text-xs text-muted-foreground">
              <Star className="h-3 w-3 fill-current text-yellow-500 mr-1" />
              <span>from 120 reviews</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Students Table */}
        <Card className="col-span-4 lg:col-span-7">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Enrolled Students</CardTitle>
                <CardDescription>
                  Manage and track student progress.
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search students..."
                    className="pl-8 w-[200px] lg:w-[300px]"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button variant="outline" size="icon">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-4">Loading students...</div>
              ) : filteredEnrollments.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">
                  No students found.
                </div>
              ) : (
                <div className="border rounded-lg">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-muted/50 text-muted-foreground font-medium">
                      <tr>
                        <th className="px-4 py-3">Student</th>
                        <th className="px-4 py-3">Enrolled</th>
                        <th className="px-4 py-3">Progress</th>
                        <th className="px-4 py-3">Last Active</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {filteredEnrollments.map((enrollment) => (
                        <tr key={enrollment.id} className="hover:bg-muted/50">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage
                                  src={enrollment.student?.avatar || undefined}
                                />
                                <AvatarFallback>
                                  {enrollment.student?.name?.[0] || "U"}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium text-gray-900">
                                  {enrollment.student?.name}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {enrollment.student?.email}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-gray-500">
                            {new Date(
                              enrollment.enrolled_at,
                            ).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2 max-w-[140px]">
                              <Progress
                                value={enrollment.progress_percentage}
                                className="h-2"
                              />
                              <span className="text-xs w-8">
                                {enrollment.progress_percentage}%
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-gray-500">
                            {/* Mock last active, or use updated_at if available on progress table */}
                            2 days ago
                          </td>
                          <td className="px-4 py-3 text-right">
                            <Button variant="ghost" size="sm">
                              View
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

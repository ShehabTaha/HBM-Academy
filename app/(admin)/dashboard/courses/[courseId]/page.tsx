"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft, Clock, Users, Star, User } from "lucide-react";
import Image from "next/image";

interface Course {
  id: string | number;
  title: string;
  image: string;
  rating: number;
  description: string;
  duration: string;
  students: number;
  instructor: string;
}

const CourseDetailsPage = () => {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourse = async () => {
      if (!params.courseId) return;

      setLoading(true);
      const { data, error } = await supabase
        .from("courses" as any)
        .select("*")
        .eq("id", params.courseId)
        .single();

      if (error) {
        toast({
          title: "Error fetching course",
          description: error.message,
          variant: "destructive",
        });
      } else if (data) {
        // Transform data to match Course interface
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const d = data as any;
        setCourse({
          id: d.id,
          title: d.title,
          image: d.image || "/placeholder-course.jpg",
          rating: 0, // Data from separate table, defaulting to 0
          description: d.description,
          duration: `${d.duration} min`,
          students: 0, // Data from separate table, defaulting to 0
          instructor: "Instructor", // Needs join to fetch name
        });
      }
      setLoading(false);
    };

    fetchCourse();
  }, [params.courseId, toast, router]);

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <Button variant="ghost" disabled>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Courses
        </Button>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-[400px] w-full rounded-xl" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-[200px] w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
        <h2 className="text-2xl font-bold">Course not found</h2>
        <Button onClick={() => router.push("/dashboard/courses")}>
          Back to Courses
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <Button
        variant="ghost"
        onClick={() => router.push("/dashboard/courses")}
        className="mb-4"
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Courses
      </Button>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              {course.title}
            </h1>
            <p className="text-slate-500 flex items-center gap-2">
              <User className="h-4 w-4" />
              Instructor:{" "}
              <span className="font-medium text-slate-900">
                {course.instructor}
              </span>
            </p>
          </div>

          <div className="relative aspect-video w-full overflow-hidden rounded-xl border bg-slate-100">
            <Image
              src={course.image}
              alt={course.title}
              fill
              className="object-cover"
              priority
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>About this course</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 leading-relaxed">
                {course.description}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-2 text-slate-600">
                  <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                  <span className="font-medium">Rating</span>
                </div>
                <span className="font-bold text-slate-900">
                  {course.rating}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-2 text-slate-600">
                  <Clock className="h-5 w-5" />
                  <span className="font-medium">Duration</span>
                </div>
                <span className="font-bold text-slate-900">
                  {course.duration}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-2 text-slate-600">
                  <Users className="h-5 w-5" />
                  <span className="font-medium">Students</span>
                </div>
                <span className="font-bold text-slate-900">
                  {course.students.toLocaleString()}
                </span>
              </div>

              <Button className="w-full text-lg py-6 mt-4">Enroll Now</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CourseDetailsPage;

"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import CourseCard from "@/components/admin/CourseCard";
import EmptyState from "@/components/admin/EmptyCourses";
import CreateCourse from "@/components/admin/CreateCourse";

interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  image: string | null;
  instructor_id: string;
  category: string | null;
  level: string | null;
  price: number;
  is_published: boolean;
  duration: number;
  created_at: string;
  updated_at: string;
}

const CoursesPage = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);

      // Import the service dynamically
      const { CourseService } = await import("@/lib/services/courses.service");

      const { courses: data, error } = await CourseService.listCourses(
        {},
        { page: 1, limit: 100 },
      );

      if (error) {
        toast({
          title: "Error fetching courses",
          description: error,
          variant: "destructive",
        });
      } else {
        setCourses(data);
      }
      setLoading(false);
    };

    fetchCourses();
  }, [toast]);

  return (
    <>
      <header className="mt-10 flex justify-between items-center w-full">
        <h1 className="text-5xl font-normal ">My Courses</h1>
        <CreateCourse />
      </header>
      <main className="pt-6 pb-20 w-full">
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <div className="h-48 bg-slate-200 animate-pulse"></div>
                <CardContent className="p-6">
                  <div className="h-6 w-3/4 bg-slate-200 rounded animate-pulse mb-4"></div>
                  <div className="h-4 w-full bg-slate-200 rounded animate-pulse mb-2"></div>
                  <div className="h-4 w-5/6 bg-slate-200 rounded animate-pulse"></div>
                </CardContent>
                <CardFooter className="p-6 pt-0">
                  <div className="h-10 w-full bg-slate-200 rounded animate-pulse"></div>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : courses.length !== 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course, index) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <CourseCard course={course} />
              </motion.div>
            ))}
          </div>
        ) : (
          <EmptyState />
        )}
      </main>
    </>
  );
};

export default CoursesPage;

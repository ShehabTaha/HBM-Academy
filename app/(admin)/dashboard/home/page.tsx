"use client";

import EmptyState from "@/components/admin/EmptyCourses";

import { Card, CardContent, CardFooter } from "@/components/ui/card";

import CourseCard from "@/components/admin/CourseCard";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";
import { useEffect } from "react";
import CreateCourse from "@/components/admin/CreateCourse";

const cardData = [
  { title: "Revenue", value: "$0" },
  { title: "Leads", value: "1" },
  { title: "New Accounts", value: "0" },
];

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

const DashboardHome = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      const { data, error } = await supabase.from("courses").select("*");

      if (error) {
        toast({
          title: "Error fetching courses",
          description: error.message,
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
        <h1 className="text-5xl font-normal ">Welcome, Ahmed 👋</h1>
        <CreateCourse />
      </header>
      <main className="mt-1 w-full flex flex-col gap-10">
        <section className="flex flex-col w-full">
          <p className="text-gray-500">Past 30 Days</p>
          <div className="flex justify-between bg-white w-full">
            {cardData.map((card) => (
              <div
                key={card.title}
                className="flex flex-col p-6 max-sm:p-2 max-sm:m-0 rounded-lg w-1/3 m-4"
              >
                <p className="font-bold text-4xl max-sm:text-sm">
                  {card.value}
                </p>
                <p>{card.title}</p>
              </div>
            ))}
          </div>
        </section>
        <section className="flex  w-full">
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
            <div className="text-2xl font-medium mb-6 w-full">
              Your Courses
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {courses.map((course: Course, index: number) => (
                  <CourseCard course={course} key={index} />
                ))}
              </div>
            </div>
          ) : (
            <EmptyState />
          )}
        </section>
      </main>
    </>
  );
};

export default DashboardHome;

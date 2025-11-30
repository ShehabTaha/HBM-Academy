import React from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Clock, Users, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";
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

const CourseCard = ({ course }: { course: Course }) => {
  const { toast } = useToast();

  const handleDelete = async () => {
    const { error } = await supabase
      .from("courses")
      .delete()
      .eq("id", course.id);

    if (error) {
      toast({
        title: "Error deleting course",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Course deleted",
        description: "The course has been deleted successfully.",
        variant: "default",
      });
    }
  };

  return (
    <Card className="overflow-hidden group flex flex-col h-full py-0">
      <CardHeader className="p-0 relative">
        <div className="overflow-hidden h-48">
          <Image
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            alt={`${course.title} course thumbnail`}
            src={course.image}
            width={500}
            height={500}
          />
        </div>
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full flex items-center space-x-1 text-sm font-semibold">
          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
          <span>{course.rating}</span>
        </div>
      </CardHeader>

      <CardContent className="p-6 flex-grow">
        <h3 className="text-xl font-bold mb-2 text-slate-800">
          {course.title}
        </h3>
        <p className="text-slate-600 mb-4 line-clamp-2">{course.description}</p>

        <div className="flex items-center justify-between text-sm text-slate-500 mb-4">
          <div className="flex items-center space-x-1.5">
            <Clock className="w-4 h-4" />
            <span>{course.duration}</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <Users className="w-4 h-4" />
            <span>{course.students.toLocaleString()} students</span>
          </div>
        </div>

        <p className="text-sm text-slate-600">
          By <span className="font-semibold">{course.instructor}</span>
        </p>
      </CardContent>

      <CardFooter className="p-6 pt-0">
        <Button asChild className="w-full">
          <Link href={`/dashboard/courses/${course.id}`}>Manage Course</Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CourseCard;

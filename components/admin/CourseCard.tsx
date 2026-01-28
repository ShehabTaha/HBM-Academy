import React from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Clock, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useToast } from "@/components/ui/use-toast";
import Image from "next/image";

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

const CourseCard = ({ course }: { course: Course }) => {
  const { toast } = useToast();

  const handleDelete = async () => {
    const { CourseService } = await import("@/lib/services/courses.service");
    const { error } = await CourseService.deleteCourse(course.id);

    if (error) {
      toast({
        title: "Error deleting course",
        description: error,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Course deleted",
        description: "The course has been deleted successfully.",
        variant: "default",
      });
      // Reload the page to reflect changes
      window.location.reload();
    }
  };

  return (
    <Card className="overflow-hidden group flex flex-col h-full py-0">
      <CardHeader className="p-0 relative">
        <div className="overflow-hidden h-48">
          <Image
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            alt={`${course.title} course thumbnail`}
            src={course.image || "/thumbnail%20placeholder.jpg"}
            width={500}
            height={500}
          />
        </div>
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full flex items-center space-x-1 text-sm font-semibold">
          <span
            className={`px-2 py-0.5 rounded text-xs ${course.is_published ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}
          >
            {course.is_published ? "Published" : "Draft"}
          </span>
        </div>
      </CardHeader>

      <CardContent className="p-6 grow">
        <h3 className="text-xl font-bold mb-2 text-slate-800">
          {course.title}
        </h3>
        <p className="text-slate-600 mb-4 line-clamp-2">{course.description}</p>

        <div className="flex items-center justify-between text-sm text-slate-500 mb-4">
          <div className="flex items-center space-x-1.5">
            <Clock className="w-4 h-4" />
            <span>{course.duration} min</span>
          </div>
          {course.category && (
            <div className="flex items-center space-x-1.5">
              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                {course.category}
              </span>
            </div>
          )}
        </div>

        <p className="text-sm text-slate-600">
          Price: <span className="font-semibold">${course.price}</span>
        </p>
      </CardContent>

      <CardFooter className="p-6 pt-0 flex gap-2">
        <Button asChild className="flex-1">
          <Link href={`/dashboard/courses/${course.id}/manage`}>Manage</Link>
        </Button>
        <Button
          variant="destructive"
          size="icon"
          onClick={(e) => {
            e.preventDefault();
            if (confirm("Are you sure you want to delete this course?")) {
              handleDelete();
            }
          }}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CourseCard;

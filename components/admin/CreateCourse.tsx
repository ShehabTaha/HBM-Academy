import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const CreateCourse = () => {
  return (
    <Link href="/dashboard/courses/create">
      <Button>+ Create</Button>
    </Link>
  );
};

export default CreateCourse;

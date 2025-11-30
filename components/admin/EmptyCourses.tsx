import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "../ui/empty";
import Image from "next/image";
import CreateCourse from "@/components/admin/CreateCourse";
const EmptyState = () => {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia>
          <Image
            src="/Task_empty.png"
            alt="Empty Courses"
            width={300}
            height={300}
          />
        </EmptyMedia>
        <EmptyTitle>You don&apos;t have any courses</EmptyTitle>
        <EmptyDescription>
          Start by adding your first lesson to begin building your course
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <CreateCourse />
      </EmptyContent>
    </Empty>
  );
};

export default EmptyState;

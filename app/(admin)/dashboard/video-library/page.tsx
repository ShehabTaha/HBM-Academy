"use client";
import React from "react";
import Image from "next/image";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

const VideoLibraryPage = () => {
  return (
    <div className="w-full h-full">
      <Empty className="items-center self-start mt-10">
        <EmptyHeader>
          <EmptyMedia>
            <Image
              src="/Video_empty.png"
              alt="Empty Courses"
              width={200}
              height={200}
            />
          </EmptyMedia>
          <EmptyTitle>You don&apos;t have any Videos</EmptyTitle>
          <EmptyDescription>
            Start by adding your first video to begin building your Video
            library
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent></EmptyContent>
      </Empty>
    </div>
  );
};

export default VideoLibraryPage;

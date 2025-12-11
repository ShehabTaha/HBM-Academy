"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

export interface Lesson {
  id: string;
  title: string;
  type: "video" | "text" | "pdf" | "audio";
  videoUrl?: string;
  description?: string;
  settings?: {
    isFreePreview?: boolean;
    isPrerequisite?: boolean;
  };
}

export interface Chapter {
  id: string;
  title: string;
  lessons: Lesson[];
  isOpen?: boolean;
}

interface CourseContextType {
  chapters: Chapter[];
  setChapters: React.Dispatch<React.SetStateAction<Chapter[]>>;
  addChapter: () => void;
  deleteChapter: (chapterId: string) => void;
  updateChapterTitle: (chapterId: string, title: string) => void;
  toggleChapter: (chapterId: string) => void;
  addLesson: (chapterId: string, lessonType?: string) => void;
  deleteLesson: (chapterId: string, lessonId: string) => void;
  updateLessonTitle: (
    chapterId: string,
    lessonId: string,
    title: string
  ) => void;
  updateLesson: (
    chapterId: string,
    lessonId: string,
    lessonData: Lesson
  ) => void;
}

const CourseContext = createContext<CourseContextType | undefined>(undefined);

export function CourseProvider({ children }: { children: ReactNode }) {
  const [chapters, setChapters] = useState<Chapter[]>([]);

  const addChapter = () => {
    const newChapter: Chapter = {
      id: `chapter-${Date.now()}`,
      title: `Part ${chapters.length + 1}`,
      lessons: [],
      isOpen: true,
    };
    setChapters([...chapters, newChapter]);
  };

  const deleteChapter = (chapterId: string) => {
    setChapters(chapters.filter((ch) => ch.id !== chapterId));
  };

  const updateChapterTitle = (chapterId: string, title: string) => {
    setChapters(
      chapters.map((ch) => (ch.id === chapterId ? { ...ch, title } : ch))
    );
  };

  const toggleChapter = (chapterId: string) => {
    setChapters(
      chapters.map((ch) =>
        ch.id === chapterId ? { ...ch, isOpen: !ch.isOpen } : ch
      )
    );
  };

  const addLesson = (chapterId: string, lessonType: string = "video") => {
    setChapters(
      chapters.map((ch) => {
        if (ch.id === chapterId) {
          const newLesson: Lesson = {
            id: `lesson-${Date.now()}`,
            title: "How to mange a restaurant",
            type: lessonType as "video" | "text" | "pdf" | "audio",
            videoUrl: "",
            description: "",
            settings: {
              isFreePreview: false,
              isPrerequisite: false,
            },
          };
          return { ...ch, lessons: [...ch.lessons, newLesson] };
        }
        return ch;
      })
    );
  };

  const deleteLesson = (chapterId: string, lessonId: string) => {
    setChapters(
      chapters.map((ch) => {
        if (ch.id === chapterId) {
          return {
            ...ch,
            lessons: ch.lessons.filter((l) => l.id !== lessonId),
          };
        }
        return ch;
      })
    );
  };

  const updateLessonTitle = (
    chapterId: string,
    lessonId: string,
    title: string
  ) => {
    setChapters(
      chapters.map((ch) => {
        if (ch.id === chapterId) {
          return {
            ...ch,
            lessons: ch.lessons.map((l) =>
              l.id === lessonId ? { ...l, title } : l
            ),
          };
        }
        return ch;
      })
    );
  };

  const updateLesson = (
    chapterId: string,
    lessonId: string,
    lessonData: Lesson
  ) => {
    setChapters(
      chapters.map((ch) => {
        if (ch.id === chapterId) {
          return {
            ...ch,
            lessons: ch.lessons.map((l) =>
              l.id === lessonId ? { ...lessonData, id: lessonId } : l
            ),
          };
        }
        return ch;
      })
    );
  };

  return (
    <CourseContext.Provider
      value={{
        chapters,
        setChapters,
        addChapter,
        deleteChapter,
        updateChapterTitle,
        toggleChapter,
        addLesson,
        deleteLesson,
        updateLessonTitle,
        updateLesson,
      }}
    >
      {children}
    </CourseContext.Provider>
  );
}

export function useCourse() {
  const context = useContext(CourseContext);
  if (context === undefined) {
    throw new Error("useCourse must be used within a CourseProvider");
  }
  return context;
}

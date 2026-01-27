"use client";

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";

export interface Lesson {
  id: string;
  title: string;
  type: "video" | "text" | "pdf" | "audio" | "quiz" | "survey" | "assignment";
  content: string;
  description?: string;
  duration?: number;
  thumbnail?: string;
  downloadableFile?: string;
  settings: {
    isFreePreview: boolean;
    isPrerequisite: boolean;
    enableDiscussions: boolean;
    isDownloadable: boolean;
  };
}

export interface Chapter {
  id: string;
  title: string;
  lessons: Lesson[];
  isOpen?: boolean;
}

export interface CourseMetadata {
  title: string;
  description: string;
  image: string | null;
  category: string;
  level: string;
  price: number;
  isPublished: boolean;
  paymentType: string;
  recurringInterval: string | null;
  recurringPrice: number | null;
  installmentCount: number | null;
  settings: {
    isPublic: boolean;
    isHidden: boolean;
    tradeFileSource: boolean;
    enableRatings: boolean;
    enableDiscussions: boolean;
    enableCertificates: boolean;
    certificateValidityDays: number | null;
  };
}

interface CourseContextType {
  // Metadata
  metadata: CourseMetadata;
  updateMetadata: (data: Partial<CourseMetadata>) => void;

  // Chapters/Lessons
  chapters: Chapter[];
  setChapters: React.Dispatch<React.SetStateAction<Chapter[]>>;
  addChapter: () => void;
  deleteChapter: (chapterId: string) => void;
  updateChapterTitle: (chapterId: string, title: string) => void;
  toggleChapter: (chapterId: string) => void;
  addLesson: (chapterId: string, lessonType?: Lesson["type"]) => void;
  deleteLesson: (chapterId: string, lessonId: string) => void;
  updateLessonTitle: (
    chapterId: string,
    lessonId: string,
    title: string,
  ) => void;
  updateLesson: (
    chapterId: string,
    lessonId: string,
    lessonData: Lesson,
  ) => void;
  clearCache: () => void;
}

const CourseContext = createContext<CourseContextType | undefined>(undefined);

const DEFAULT_METADATA: CourseMetadata = {
  title: "",
  description: "",
  image: null,
  category: "",
  level: "beginner",
  price: 0,
  isPublished: false,
  paymentType: "one-time",
  recurringInterval: null,
  recurringPrice: null,
  installmentCount: null,
  settings: {
    isPublic: true,
    isHidden: false,
    tradeFileSource: false,
    enableRatings: false,
    enableDiscussions: false,
    enableCertificates: false,
    certificateValidityDays: null,
  },
};

export function CourseProvider({ children }: { children: ReactNode }) {
  // Metadata State
  const [metadata, setMetadata] = useState<CourseMetadata>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("hbm_course_metadata_draft");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error("Failed to parse saved metadata", e);
        }
      }
    }
    return DEFAULT_METADATA;
  });

  const [chapters, setChapters] = useState<Chapter[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("hbm_course_chapters_draft");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error("Failed to parse saved chapters", e);
        }
      }
    }
    return [];
  });

  // --- Persistence Logic ---

  // Save to localStorage on change
  useEffect(() => {
    localStorage.setItem("hbm_course_metadata_draft", JSON.stringify(metadata));
  }, [metadata]);

  useEffect(() => {
    localStorage.setItem("hbm_course_chapters_draft", JSON.stringify(chapters));
  }, [chapters]);

  const updateMetadata = (data: Partial<CourseMetadata>) => {
    setMetadata((prev) => ({ ...prev, ...data }));
  };

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
      chapters.map((ch) => (ch.id === chapterId ? { ...ch, title } : ch)),
    );
  };

  const toggleChapter = (chapterId: string) => {
    setChapters(
      chapters.map((ch) =>
        ch.id === chapterId ? { ...ch, isOpen: !ch.isOpen } : ch,
      ),
    );
  };

  const addLesson = (
    chapterId: string,
    lessonType: Lesson["type"] = "video",
  ) => {
    setChapters(
      chapters.map((ch) => {
        if (ch.id === chapterId) {
          const newLesson: Lesson = {
            id: `lesson-${Date.now()}`,
            title: "New Lesson",
            type: lessonType,
            content: "",
            description: "",
            downloadableFile: "",
            settings: {
              isFreePreview: false,
              isPrerequisite: false,
              enableDiscussions: false,
              isDownloadable: false,
            },
          };
          return { ...ch, lessons: [...ch.lessons, newLesson] };
        }
        return ch;
      }),
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
      }),
    );
  };

  const updateLessonTitle = (
    chapterId: string,
    lessonId: string,
    title: string,
  ) => {
    setChapters(
      chapters.map((ch) => {
        if (ch.id === chapterId) {
          return {
            ...ch,
            lessons: ch.lessons.map((l) =>
              l.id === lessonId ? { ...l, title } : l,
            ),
          };
        }
        return ch;
      }),
    );
  };

  const updateLesson = (
    chapterId: string,
    lessonId: string,
    lessonData: Lesson,
  ) => {
    setChapters(
      chapters.map((ch) => {
        if (ch.id === chapterId) {
          return {
            ...ch,
            lessons: ch.lessons.map((l) =>
              l.id === lessonId ? { ...lessonData, id: lessonId } : l,
            ),
          };
        }
        return ch;
      }),
    );
  };

  const clearCache = () => {
    localStorage.removeItem("hbm_course_metadata_draft");
    localStorage.removeItem("hbm_course_chapters_draft");
  };

  return (
    <CourseContext.Provider
      value={{
        metadata,
        updateMetadata,
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
        clearCache,
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

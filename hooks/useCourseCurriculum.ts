"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";

// Types
export type LessonType = "video" | "text" | "pdf";

export interface Lesson {
  id: string;
  title: string;
  type: LessonType;
  chapter_id: string;
}

export interface Chapter {
  id: string;
  title: string;
  info: string;
  lessons: Lesson[];
  isOpen?: boolean;
}

export const useCourseCurriculum = () => {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [courseTitle, setCourseTitle] = useState("Loading...");
  const [courseId, setCourseId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchCourseAndChapters = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Find a DRAFT course or create one
      let currentCourseId = localStorage.getItem("hbm_course_builder_v2");

      if (!currentCourseId) {
        // FORCE NEW COURSE CREATION
        const { data: newCourse, error: createError } = await supabase
          .from("courses")
          // @ts-ignore
          .insert([
            {
              title: "New Course",
              description: "Created via Content Uploader",
              status: "draft",
            },
          ])
          .select()
          .single();

        if (createError) throw createError;

        if (newCourse) {
          currentCourseId = newCourse.id;
          setCourseId(newCourse.id);
          localStorage.setItem(
            "hbm_course_builder_v2",
            newCourse.id.toString()
          );
          setCourseTitle(newCourse.title);
        }
      } else {
        const { data: course, error: fetchError } = await supabase
          .from("courses")
          .select("*")
          .eq("id", currentCourseId)
          .single();

        if (!fetchError && course) {
          setCourseId(course.id);
          setCourseTitle(course.title);
        } else {
          localStorage.removeItem("hbm_course_builder_v2");
          // Retry to trigger creation path (recursive call might be risky, better to just return and let effect re-run or handle it)
          // Ideally we need to reset the ID and creating a new one.
          // Simplified: Just set currentCourseId to null so the NEXT run would catch it, but here we can just create it immediately
          // For simplicity, let's just clear and throw error or let the user refresh, but better: create new one.
          const { data: newCourse, error: createError } = await supabase
            .from("courses")
            // @ts-ignore
            .insert([
              {
                title: "New Course",
                description: "Created via Content Uploader",
                status: "draft",
              },
            ])
            .select()
            .single();

          if (newCourse) {
            currentCourseId = newCourse.id;
            setCourseId(newCourse.id);
            localStorage.setItem(
              "hbm_course_builder_v2",
              newCourse.id.toString()
            );
            setCourseTitle(newCourse.title);
          }
        }
      }

      if (!currentCourseId) return;

      // 2. Fetch Chapters
      const { data: chaptersData, error: chaptersError } = await supabase
        .from("chapters")
        .select(`*, lessons (*)`)
        .eq("course_id", currentCourseId)
        .order("position", { ascending: true });

      if (chaptersError) throw chaptersError;

      const formattedChapters: Chapter[] = (chaptersData || []).map(
        (ch: any) => ({
          id: ch.id,
          title: ch.title,
          info: ch.info || "",
          isOpen: true,
          lessons: (ch.lessons || [])
            .sort((a: any, b: any) => (a.position || 0) - (b.position || 0))
            .map((l: any) => ({
              id: l.id,
              title: l.title,
              type: l.type || "video",
              chapter_id: l.chapter_id,
            })),
        })
      );

      setChapters(formattedChapters);
    } catch (error: any) {
      console.error("Error fetching data:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to load course data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchCourseAndChapters();
  }, [fetchCourseAndChapters]);

  // Actions
  const toggleChapter = (id: string) => {
    setChapters(
      chapters.map((ch) => (ch.id === id ? { ...ch, isOpen: !ch.isOpen } : ch))
    );
  };

  const addChapter = async () => {
    if (!courseId) return;
    try {
      const { data, error } = await supabase
        .from("chapters")
        .insert([
          {
            course_id: courseId,
            title: "New Chapter",
            position: chapters.length + 1,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      setChapters([
        ...chapters,
        {
          id: data.id,
          title: data.title,
          info: "",
          lessons: [],
          isOpen: true,
        },
      ]);
      toast({ title: "Success", description: "Chapter added." });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const deleteChapter = async (id: string) => {
    try {
      const { error } = await supabase.from("chapters").delete().eq("id", id);
      if (error) throw error;
      setChapters(chapters.filter((ch) => ch.id !== id));
      toast({ title: "Chapter deleted" });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const updateChapterTitle = async (id: string, newTitle: string) => {
    setChapters(
      chapters.map((ch) => (ch.id === id ? { ...ch, title: newTitle } : ch))
    );
    try {
      const { error } = await supabase
        .from("chapters")
        .update({ title: newTitle })
        .eq("id", id);
      if (error) throw error;
    } catch (error) {
      console.error("Failed to update title in DB", error);
    }
  };

  const addLesson = async (chapterId: string, type: LessonType = "video") => {
    try {
      const { data, error } = await supabase
        .from("lessons")
        .insert([
          {
            chapter_id: chapterId,
            title: "New Lesson",
            type: type,
            position: 999,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      setChapters(
        chapters.map((ch) => {
          if (ch.id === chapterId) {
            return {
              ...ch,
              lessons: [
                ...ch.lessons,
                {
                  id: data.id,
                  title: data.title,
                  type: data.type,
                  chapter_id: data.chapter_id,
                },
              ],
            };
          }
          return ch;
        })
      );
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const deleteLesson = async (chapterId: string, lessonId: string) => {
    try {
      const { error } = await supabase
        .from("lessons")
        .delete()
        .eq("id", lessonId);
      if (error) throw error;

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
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const updateLessonTitle = async (
    chapterId: string,
    lessonId: string,
    newTitle: string
  ) => {
    setChapters(
      chapters.map((ch) => {
        if (ch.id === chapterId) {
          return {
            ...ch,
            lessons: ch.lessons.map((l) =>
              l.id === lessonId ? { ...l, title: newTitle } : l
            ),
          };
        }
        return ch;
      })
    );

    try {
      const { error } = await supabase
        .from("lessons")
        .update({ title: newTitle })
        .eq("id", lessonId);
      if (error) throw error;
    } catch (error) {
      console.error("Failed to update lesson title", error);
    }
  };

  /* View State Management */
  type ViewState =
    | "empty"
    | "add_chapter"
    | "edit_chapter"
    | "add_lesson"
    | "edit_lesson"
    | "select_prompt";

  const [activeView, setActiveView] = useState<ViewState>("empty");
  const [activeChapterId, setActiveChapterId] = useState<string | null>(null);
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);

  // Sync initial view state
  useEffect(() => {
    if (!loading) {
      if (chapters.length === 0 && activeView !== "add_chapter") {
        setActiveView("empty");
      } else if (chapters.length > 0 && activeView === "empty") {
        setActiveView("select_prompt");
      }
    }
  }, [loading, chapters.length]);

  /* Navigation Helpers */
  const navigateToAddChapter = () => {
    setActiveView("add_chapter");
    setActiveChapterId(null);
    setActiveLessonId(null);
  };

  const navigateToEditChapter = (chapterId: string) => {
    setActiveView("edit_chapter");
    setActiveChapterId(chapterId);
    setActiveLessonId(null);
  };

  const navigateToAddLesson = (chapterId: string) => {
    setActiveView("add_lesson");
    setActiveChapterId(chapterId);
    setActiveLessonId(null);
  };

  const navigateToEditLesson = (chapterId: string, lessonId: string) => {
    setActiveView("edit_lesson");
    setActiveChapterId(chapterId);
    setActiveLessonId(lessonId);
  };

  return {
    chapters,
    courseTitle,
    loading,
    activeView,
    activeChapterId,
    activeLessonId,
    navigateToAddChapter,
    navigateToEditChapter,
    navigateToAddLesson,
    navigateToEditLesson,
    toggleChapter,
    addChapter,
    deleteChapter,
    updateChapterTitle,
    addLesson,
    deleteLesson,
    updateLessonTitle,
  };
};

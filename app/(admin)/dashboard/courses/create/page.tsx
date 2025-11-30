"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import Image from "next/image";
import {
  Plus,
  ChevronDown,
  ChevronRight,
  FileText,
  Video,
  File,
} from "lucide-react";
import LessonForm, { LessonData } from "@/components/admin/LessonForm";

interface Chapter {
  id: string;
  title: string;
  lessons: LessonData[];
  isOpen?: boolean;
}

export default function CreateCoursePage() {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [isAddingChapter, setIsAddingChapter] = useState(false);
  const [newChapterTitle, setNewChapterTitle] = useState("");

  // State for Lesson Management
  const [activeChapterId, setActiveChapterId] = useState<string | null>(null);
  const [isAddingLesson, setIsAddingLesson] = useState(false);
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);

  const handleAddChapter = () => {
    if (!newChapterTitle.trim()) return;
    const newChapter: Chapter = {
      id: Date.now().toString(),
      title: newChapterTitle,
      lessons: [],
      isOpen: true,
    };
    setChapters([...chapters, newChapter]);
    setNewChapterTitle("");
    setIsAddingChapter(false);
  };

  const handleCancelAddChapter = () => {
    setNewChapterTitle("");
    setIsAddingChapter(false);
  };

  const toggleChapter = (id: string) => {
    setChapters(
      chapters.map((ch) => (ch.id === id ? { ...ch, isOpen: !ch.isOpen } : ch))
    );
  };

  const handleAddLessonStart = (chapterId: string) => {
    setActiveChapterId(chapterId);
    setIsAddingLesson(true);
    setEditingLessonId(null);
  };

  const handleSaveLesson = (lessonData: LessonData) => {
    if (!activeChapterId) return;

    setChapters(
      chapters.map((ch) => {
        if (ch.id === activeChapterId) {
          if (editingLessonId) {
            // Update existing lesson
            return {
              ...ch,
              lessons: ch.lessons.map((l) =>
                l.id === editingLessonId ? lessonData : l
              ),
            };
          } else {
            // Add new lesson
            return {
              ...ch,
              lessons: [...ch.lessons, lessonData],
            };
          }
        }
        return ch;
      })
    );
    setIsAddingLesson(false);
    setEditingLessonId(null);
    setActiveChapterId(null);
  };

  const handleCancelLesson = () => {
    setIsAddingLesson(false);
    setEditingLessonId(null);
    setActiveChapterId(null);
  };

  const handleEditLesson = (chapterId: string, lesson: LessonData) => {
    setActiveChapterId(chapterId);
    setEditingLessonId(lesson.id);
    setIsAddingLesson(true);
  };

  // Helper to get current lesson data for editing
  const getCurrentLesson = () => {
    if (!activeChapterId || !editingLessonId) return undefined;
    const chapter = chapters.find((c) => c.id === activeChapterId);
    return chapter?.lessons.find((l) => l.id === editingLessonId);
  };

  return (
    <div className="flex justify-start items-start gap-6 h-full">
      {/* Left Pane: Chapter List or Empty State */}
      <aside className="w-1/4 flex flex-col h-full border-r pr-6 overflow-y-auto">
        {chapters.length === 0 ? (
          <div className="flex flex-col justify-between h-full">
            <Empty className="items-center self-start mt-10">
              <EmptyHeader>
                <EmptyMedia>
                  <Image
                    src="/Task_empty.png"
                    alt="Empty Courses"
                    width={200}
                    height={200}
                  />
                </EmptyMedia>
                <EmptyTitle>You don&apos;t have any lessons</EmptyTitle>
                <EmptyDescription>
                  Start by adding your first lesson to begin building your
                  course
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent></EmptyContent>
            </Empty>
            <Button
              variant={"outline"}
              className="w-full mt-auto mb-10"
              onClick={() => setIsAddingChapter(true)}
            >
              + Add Chapter
            </Button>
          </div>
        ) : (
          <div className="w-full pb-10">
            <div className="space-y-4">
              {chapters.map((chapter, index) => (
                <div key={chapter.id} className="border-b pb-4 last:border-0">
                  <div
                    className="flex items-center justify-between cursor-pointer py-2 hover:bg-gray-50 rounded px-2"
                    onClick={() => toggleChapter(chapter.id)}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-500">
                        {index + 1}. {chapter.title}
                      </span>
                    </div>
                    {chapter.isOpen ? (
                      <ChevronDown size={16} />
                    ) : (
                      <ChevronRight size={16} />
                    )}
                  </div>

                  {chapter.isOpen && (
                    <div className="pl-4 mt-2 space-y-2">
                      {chapter.lessons.map((lesson) => (
                        <div
                          key={lesson.id}
                          className={`flex items-center gap-2 p-2 text-sm border rounded hover:bg-gray-50 cursor-pointer ${
                            editingLessonId === lesson.id
                              ? "border-blue-500 bg-blue-50"
                              : ""
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditLesson(chapter.id, lesson);
                          }}
                        >
                          {lesson.type === "video" && (
                            <Video size={14} className="text-gray-500" />
                          )}
                          {lesson.type === "text" && (
                            <FileText size={14} className="text-gray-500" />
                          )}
                          {lesson.type === "pdf" && (
                            <File size={14} className="text-gray-500" />
                          )}
                          <span>{lesson.title}</span>
                        </div>
                      ))}

                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-start text-gray-500 mt-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddLessonStart(chapter.id);
                        }}
                      >
                        <Plus size={14} className="mr-2" /> Add lesson
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <Button
              variant={"outline"}
              className="w-full flex items-center gap-2 mt-6"
              onClick={() => setIsAddingChapter(true)}
            >
              <Plus size={16} /> Add Chapter
            </Button>
          </div>
        )}
      </aside>

      {/* Right Pane: Action Area */}
      <main className="flex-1 pl-6 h-full overflow-y-auto pb-10">
        {isAddingChapter ? (
          <div className="w-full max-w-md">
            <h2 className="text-xl font-semibold mb-6">New chapter</h2>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="chapterTitle"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Chapter title
                </label>
                <Input
                  id="chapterTitle"
                  placeholder="e.g. Introduction"
                  value={newChapterTitle}
                  onChange={(e) => setNewChapterTitle(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-3">
                <Button
                  onClick={handleAddChapter}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Save
                </Button>
                <Button
                  variant="ghost"
                  onClick={handleCancelAddChapter}
                  className="text-red-500 hover:text-red-600 hover:bg-red-50"
                >
                  Delete
                </Button>
              </div>
            </div>
          </div>
        ) : isAddingLesson ? (
          <LessonForm
            initialData={getCurrentLesson()}
            onSave={handleSaveLesson}
            onCancel={handleCancelLesson}
          />
        ) : chapters.length === 0 ? (
          <div className="mt-10">
            <p className="text-3xl font-normal mb-6 max-w-lg leading-tight">
              Add a first chapter to start building your course. You are off to
              a great start!
            </p>
            <Button onClick={() => setIsAddingChapter(true)}>
              + Add Chapter
            </Button>
          </div>
        ) : (
          <div className="mt-10 text-gray-500 flex flex-col items-center justify-center h-1/2">
            <p>Select a chapter to add a lesson, or select a lesson to edit.</p>
          </div>
        )}
      </main>
    </div>
  );
}

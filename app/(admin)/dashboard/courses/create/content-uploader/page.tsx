"use client";

import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Trash2,
  Video,
  FileText,
  Menu,
  GripVertical,
  File as FileIcon,
  Music,
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import VideoSelectionModal from "@/components/dashboard/courses/modals/VideoSelectionModal";
import { Video as LibraryVideo } from "@/types/video-library";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  useDroppable,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useCourse, Lesson, Chapter } from "@/contexts/CourseContext";

// Sortable Lesson Item Component
function SortableLesson({
  lesson,
  chapterId,
  onUpdateTitle,
  onDelete,
}: {
  lesson: Lesson;
  chapterId: string;
  onUpdateTitle: (title: string) => void;
  onDelete: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: lesson.id, data: { chapterId, lesson } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const getLessonIcon = () => {
    switch (lesson.type) {
      case "video":
        return <Video className="w-5 h-5" />;
      case "pdf":
        return <FileIcon className="w-5 h-5" />;
      case "audio":
        return <Music className="w-5 h-5" />;
      default:
        return <FileText className="w-5 h-5" />;
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 group"
    >
      <div className="flex-1 flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
        >
          <GripVertical className="w-5 h-5" />
        </div>
        <div className="text-gray-400">{getLessonIcon()}</div>
        <Input
          value={lesson.title}
          onChange={(e) => onUpdateTitle(e.target.value)}
          className="bg-transparent border-none shadow-none focus-visible:ring-0 p-0 h-auto text-sm text-gray-700"
        />
        <div className="ml-auto flex items-center gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-gray-400 hover:text-red-500"
            onClick={onDelete}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// Simplified Sidebar Component
function SimpleSidebar({
  chapters,
  onToggleChapter,
  onAddChapter,
}: {
  chapters: Chapter[];
  onToggleChapter: (id: string) => void;
  onAddChapter: () => void;
}) {
  return (
    <div className="flex flex-col h-screen bg-gray-50/50 border-r border-gray-200">
      <div className="px-5 pt-6 pb-4">
        <h3 className="text-xl font-semibold text-gray-900 mb-1">New Course</h3>
      </div>

      <div className="flex-1 overflow-y-auto px-4 space-y-4 min-h-0">
        {chapters.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-12 px-4">
            <p className="text-sm font-medium text-gray-900 mb-1">
              You don&apos;t have any lessons
            </p>
            <p className="text-xs text-gray-500 leading-tight">
              Start by adding your first chapter
            </p>
          </div>
        ) : (
          chapters.map((chapter, index) => (
            <div key={chapter.id} className="group">
              <div
                className="flex items-center justify-between mb-2 cursor-pointer p-2 rounded hover:bg-white hover:shadow-sm transition-all text-gray-700"
                onClick={() => onToggleChapter(chapter.id)}
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-5 h-5 rounded-full bg-gray-100 text-[10px] font-bold text-gray-500">
                    {index + 1}
                  </div>
                  <span className="text-sm font-medium truncate max-w-[160px]">
                    {chapter.title}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="px-4 pt-4 pb-4 border-t border-gray-100 bg-white shrink-0">
        <Button
          variant="outline"
          className="w-full py-6 text-gray-600 border-gray-200 hover:bg-gray-50 hover:text-gray-900"
          onClick={onAddChapter}
        >
          <Plus className="w-4 h-4 mr-2" /> Add chapter
        </Button>
      </div>
    </div>
  );
}

// Empty Chapter Drop Zone Component
function EmptyChapterDropZone({ chapterId }: { chapterId: string }) {
  const { setNodeRef, isOver } = useDroppable({
    id: `empty-${chapterId}`,
    data: { chapterId, isEmpty: true },
  });

  return (
    <div
      ref={setNodeRef}
      className={`border-2 border-dashed rounded-lg p-8 text-center text-sm transition-colors ${
        isOver
          ? "border-blue-400 bg-blue-50 text-blue-600"
          : "border-gray-200 text-gray-400"
      }`}
    >
      Drop lessons here or upload content below
    </div>
  );
}

export default function ContentUploaderPage() {
  const {
    chapters,
    setChapters,
    addChapter,
    deleteChapter,
    updateChapterTitle,
    toggleChapter,
    deleteLesson,
    updateLessonTitle,
  } = useCourse();

  const [activeId, setActiveId] = useState<string | null>(null);
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});
  const [pendingUpload, setPendingUpload] = useState<{
    chapterId: string;
    file: File;
    type: "video" | "text" | "pdf" | "audio";
  } | null>(null);
  const [libraryPickerOpen, setLibraryPickerOpen] = useState(false);
  const [activeChapterForLibrary, setActiveChapterForLibrary] = useState<
    string | null
  >(null);
  const [lessonName, setLessonName] = useState("");

  const getFileType = (file: File): "video" | "text" | "pdf" | "audio" => {
    const extension = file.name.split(".").pop()?.toLowerCase();

    if (["mp4", "mov", "avi", "mkv", "webm"].includes(extension || "")) {
      return "video";
    } else if (["pdf"].includes(extension || "")) {
      return "pdf";
    } else if (["mp3", "wav", "ogg", "m4a"].includes(extension || "")) {
      return "audio";
    } else {
      return "text";
    }
  };

  const getFileIcon = (type: "video" | "text" | "pdf" | "audio") => {
    switch (type) {
      case "video":
        return <Video className="w-5 h-5" />;
      case "pdf":
        return <FileIcon className="w-5 h-5" />;
      case "audio":
        return <Music className="w-5 h-5" />;
      default:
        return <FileText className="w-5 h-5" />;
    }
  };

  const handleConfirmUpload = () => {
    if (!pendingUpload || !lessonName.trim()) return;

    const { chapterId, type } = pendingUpload;

    // Use setChapters directly to add the lesson with the correct title in one operation
    setChapters((prevChapters) =>
      prevChapters.map((ch) => {
        if (ch.id === chapterId) {
          const newLesson: Lesson = {
            id: `lesson-${Date.now()}`,
            title: lessonName,
            type: type,
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

    setPendingUpload(null);
    setLessonName("");
  };

  const handleCancelUpload = () => {
    setPendingUpload(null);
    setLessonName("");
  };

  const handleLibraryVideoSelect = (video: LibraryVideo) => {
    if (!activeChapterForLibrary) return;

    setChapters((prevChapters) =>
      prevChapters.map((ch) => {
        if (ch.id === activeChapterForLibrary) {
          const newLesson: Lesson = {
            id: `library-${video.id}-${Date.now()}`,
            title: video.title,
            type: "video",
            content: video.file_url,
            description: video.description || "",
            duration: video.duration,
            thumbnail: video.thumbnail_url || undefined,
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

    setLibraryPickerOpen(false);
    setActiveChapterForLibrary(null);
  };

  const handleBrowseClick = (chapterId: string) => {
    fileInputRefs.current[chapterId]?.click();
  };

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    chapterId: string,
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      const fileType = getFileType(file);
      const defaultName = file.name.replace(/\.[^/.]+$/, ""); // Remove extension
      setPendingUpload({ chapterId, file, type: fileType });
      setLessonName(defaultName);
      // Reset the input
      event.target.value = "";
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeData = active.data.current;
    const overData = over.data.current;

    if (!activeData || !overData) return;

    const activeChapterId = activeData.chapterId;
    const activeLesson = activeData.lesson;

    // Check if dropping into an empty chapter
    const overChapterId = overData.isEmpty
      ? overData.chapterId
      : overData.chapterId;

    // Moving within the same chapter
    if (activeChapterId === overChapterId && !overData.isEmpty) {
      setChapters((chapters) =>
        chapters.map((chapter) => {
          if (chapter.id === activeChapterId) {
            const oldIndex = chapter.lessons.findIndex(
              (l) => l.id === active.id,
            );
            const newIndex = chapter.lessons.findIndex((l) => l.id === over.id);
            return {
              ...chapter,
              lessons: arrayMove(chapter.lessons, oldIndex, newIndex),
            };
          }
          return chapter;
        }),
      );
    } else {
      // Moving to a different chapter or empty chapter
      setChapters((chapters) => {
        const newChapters = chapters.map((chapter) => {
          // Remove from source chapter
          if (chapter.id === activeChapterId) {
            return {
              ...chapter,
              lessons: chapter.lessons.filter((l) => l.id !== active.id),
            };
          }
          // Add to target chapter
          if (chapter.id === overChapterId) {
            if (overData.isEmpty) {
              // Adding to empty chapter - just append
              return {
                ...chapter,
                lessons: [activeLesson],
              };
            } else {
              // Adding to non-empty chapter - insert at position
              const targetIndex = chapter.lessons.findIndex(
                (l) => l.id === over.id,
              );
              const newLessons = [...chapter.lessons];
              newLessons.splice(targetIndex + 1, 0, activeLesson);
              return {
                ...chapter,
                lessons: newLessons,
              };
            }
          }
          return chapter;
        });
        return newChapters;
      });
    }
  };

  const activeLessonData = activeId
    ? chapters
        .flatMap((ch) =>
          ch.lessons.map((l) => ({ lesson: l, chapterId: ch.id })),
        )
        .find((item) => item.lesson.id === activeId)
    : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex h-screen relative">
        {/* Mobile Toggle */}
        <div className="md:hidden absolute top-4 left-4 z-20">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-80">
              <SimpleSidebar
                chapters={chapters}
                onToggleChapter={toggleChapter}
                onAddChapter={addChapter}
              />
            </SheetContent>
          </Sheet>
        </div>

        {/* Desktop Sidebar */}
        <aside className="hidden md:flex w-80 border-r border-gray-200 bg-white flex-col h-[calc(100vh-16rem)] sticky top-0">
          <SimpleSidebar
            chapters={chapters}
            onToggleChapter={toggleChapter}
            onAddChapter={addChapter}
          />
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 bg-gray-50 p-4 md:p-10 pt-16 md:pt-10">
          <div className="max-w-3xl mx-auto space-y-8">
            {chapters.length === 0 ? (
              <div className="text-center py-20">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Start building your course
                </h3>
                <p className="text-gray-500 mb-6">
                  Add your first chapter to get started.
                </p>
                <Button onClick={addChapter}>
                  <Plus className="w-4 h-4 mr-2" /> Add Chapter
                </Button>
              </div>
            ) : (
              chapters.map((chapter, index) => (
                <div
                  key={chapter.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
                >
                  {/* Chapter Header */}
                  <div className="flex items-center gap-4 mb-6">
                    <span className="text-lg font-medium text-gray-900 border border-gray-200 rounded px-2 py-1 min-w-[32px] text-center bg-gray-50">
                      {index + 1}.
                    </span>
                    <div className="flex-1">
                      <Input
                        value={chapter.title}
                        onChange={(e) =>
                          updateChapterTitle(chapter.id, e.target.value)
                        }
                        className="text-lg font-medium border-none shadow-none focus-visible:ring-0 p-0 h-auto"
                        placeholder="Chapter Title"
                      />
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-gray-400 hover:text-red-500"
                      onClick={() => deleteChapter(chapter.id)}
                    >
                      <Trash2 className="w-5 h-5" />
                    </Button>
                  </div>

                  {/* Lessons List with Drag and Drop */}
                  <SortableContext
                    items={chapter.lessons.map((l) => l.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-3">
                      {chapter.lessons.length === 0 ? (
                        <EmptyChapterDropZone chapterId={chapter.id} />
                      ) : (
                        chapter.lessons.map((lesson) => (
                          <SortableLesson
                            key={lesson.id}
                            lesson={lesson}
                            chapterId={chapter.id}
                            onUpdateTitle={(title) =>
                              updateLessonTitle(chapter.id, lesson.id, title)
                            }
                            onDelete={() => deleteLesson(chapter.id, lesson.id)}
                          />
                        ))
                      )}
                    </div>
                  </SortableContext>

                  {/* Upload Section */}
                  <div className="mt-8 border-2 border-dashed border-gray-200 rounded-xl p-8 bg-linear-to-br from-gray-50/50 to-white hover:border-blue-300 transition-all duration-200">
                    <div className="flex flex-col items-center justify-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center">
                        <Plus className="w-8 h-8 text-blue-600" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium text-gray-900 mb-1">
                          Upload content to create a new lesson
                        </p>
                        <p className="text-xs text-gray-500">
                          Supports PDF, videos (MP4, MOV), and audio files
                        </p>
                      </div>
                      <input
                        type="file"
                        ref={(el) => {
                          fileInputRefs.current[chapter.id] = el;
                        }}
                        className="hidden"
                        accept="video/*,audio/*,.pdf,.doc,.docx"
                        onChange={(e) => handleFileChange(e, chapter.id)}
                      />
                      <Button
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                        onClick={() => handleBrowseClick(chapter.id)}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Browse Files
                      </Button>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">
                          or
                        </span>
                      </div>
                      <Button
                        variant="link"
                        size="sm"
                        className="text-blue-600 font-medium h-auto p-0"
                        onClick={() => {
                          setActiveChapterForLibrary(chapter.id);
                          setLibraryPickerOpen(true);
                        }}
                      >
                        Select from Video Library
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </main>

        {/* Lesson Naming Dialog */}
        {pendingUpload && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                  {getFileIcon(pendingUpload.type)}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Name your lesson
                  </h3>
                  <p className="text-sm text-gray-500">
                    {pendingUpload.file.name}
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <label
                  htmlFor="lessonName"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Lesson title
                </label>
                <Input
                  id="lessonName"
                  value={lessonName}
                  onChange={(e) => setLessonName(e.target.value)}
                  placeholder="Enter lesson name"
                  className="w-full"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && lessonName.trim()) {
                      handleConfirmUpload();
                    }
                  }}
                />
              </div>

              <div className="flex gap-3 justify-end">
                <Button variant="outline" onClick={handleCancelUpload}>
                  Cancel
                </Button>
                <Button
                  onClick={handleConfirmUpload}
                  disabled={!lessonName.trim()}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Add Lesson
                </Button>
              </div>
            </div>
          </div>
        )}

        <VideoSelectionModal
          open={libraryPickerOpen}
          onOpenChange={setLibraryPickerOpen}
          onSelect={handleLibraryVideoSelect}
        />

        {/* Drag Overlay */}
        <DragOverlay>
          {activeId && activeLessonData ? (
            <div className="flex items-center gap-3 bg-white border-2 border-blue-500 rounded-lg px-4 py-3 shadow-lg">
              <GripVertical className="w-5 h-5 text-gray-400" />
              <div className="text-gray-400">
                {activeLessonData.lesson.type === "video" ? (
                  <Video className="w-5 h-5" />
                ) : (
                  <FileText className="w-5 h-5" />
                )}
              </div>
              <span className="text-sm text-gray-700">
                {activeLessonData.lesson.title}
              </span>
            </div>
          ) : null}
        </DragOverlay>
      </div>
    </DndContext>
  );
}

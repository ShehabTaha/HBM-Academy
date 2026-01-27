"use client";

import { useEffect, useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
// Accordion removed as we implemented custom draggable sections
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Loader2,
  Plus,
  GripVertical,
  Trash2,
  Edit2,
  MoreVertical,
  Eye,
  Video,
  FileText,
  File as FileIcon,
  Mic,
  HelpCircle,
  ClipboardList,
  FileSpreadsheet,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";

import { CourseWithDetails, SectionWithLessons, Lesson } from "./types";
import { SectionService } from "@/lib/services/sections.service";
import { LessonService } from "@/lib/services/lessons.service";
import LessonForm, { LessonData } from "../LessonForm";

// Helper components for Sortable items defined below/inline to avoid prop threading hell

interface CourseStructureProps {
  course: CourseWithDetails;
  onUpdate: () => void; // Trigger refetch
}

export function CourseStructure({ course, onUpdate }: CourseStructureProps) {
  const { toast } = useToast();
  const [sections, setSections] = useState<SectionWithLessons[]>(
    course.sections,
  );
  const [isUpdating, setIsUpdating] = useState(false);

  // Dialog states
  const [isAddSectionOpen, setIsAddSectionOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<{
    id: string;
    title: string;
  } | null>(null);
  const [newSectionTitle, setNewSectionTitle] = useState("");

  const [editingLessonId, setEditingLessonId] = useState<string | null>(null); // If null, adding new
  const [activeSectionIdForLesson, setActiveSectionIdForLesson] = useState<
    string | null
  >(null);
  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);

  // Sync sections when course changes
  useEffect(() => {
    setSections(course.sections.sort((a, b) => a.order - b.order));
  }, [course.sections]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  // --- Section Handlers ---

  const handleCreateSection = async () => {
    if (!newSectionTitle.trim()) return;
    setIsUpdating(true);
    try {
      const order =
        sections.length > 0 ? Math.max(...sections.map((s) => s.order)) + 1 : 0;
      const { error } = await SectionService.createSection({
        course_id: course.id,
        title: newSectionTitle,
        order,
      });

      if (error) throw new Error(error);

      toast({ title: "Success", description: "Section created" });
      setNewSectionTitle("");
      setIsAddSectionOpen(false);
      onUpdate();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create section",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdateSection = async () => {
    if (!editingSection || !editingSection.title.trim()) return;
    setIsUpdating(true);
    try {
      const { error } = await SectionService.updateSection(editingSection.id, {
        title: editingSection.title,
      });
      if (error) throw new Error(error);

      toast({ title: "Success", description: "Section updated" });
      setEditingSection(null);
      onUpdate();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update section",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteSection = async (id: string) => {
    if (!confirm("Delete this section and all its lessons?")) return;
    setIsUpdating(true);
    try {
      const { error } = await SectionService.deleteSection(id);
      if (error) throw new Error(error);
      toast({ title: "Success", description: "Section deleted" });
      onUpdate();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete section",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDragEndSection = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = sections.findIndex((s) => s.id === active.id);
      const newIndex = sections.findIndex((s) => s.id === over?.id);

      const newSections = arrayMove(sections, oldIndex, newIndex);
      setSections(newSections); // Optimistic

      // Persist
      const ids = newSections.map((s) => s.id);
      await SectionService.reorderSections(course.id, ids);
    }
  };

  // --- Lesson Handlers ---

  const handleSaveLesson = async (data: LessonData) => {
    // Check if we are editing or creating
    // The LessonForm passes full data.
    setIsUpdating(true);
    try {
      if (editingLessonId) {
        // Update
        const { error } = await LessonService.updateLesson(editingLessonId, {
          title: data.title,
          type: data.type,
          content: data.content,
          description: data.description,
          downloadable_file: data.downloadableFile,
          duration: 0,
          is_free_preview: data.settings.isFreePreview,
          is_prerequisite: data.settings.isPrerequisite,
          enable_discussions: data.settings.enableDiscussions,
          is_downloadable: data.settings.isDownloadable,
        });
        if (error) throw new Error(error);
        toast({ title: "Success", description: "Lesson updated" });
      } else {
        // Create
        if (!activeSectionIdForLesson) return;
        const section = sections.find((s) => s.id === activeSectionIdForLesson);
        const currentLessons = section?.lessons || [];
        const order =
          currentLessons.length > 0
            ? Math.max(...currentLessons.map((l) => l.order)) + 1
            : 0;

        const { error } = await LessonService.createLesson({
          section_id: activeSectionIdForLesson,
          title: data.title,
          type: data.type,
          content: data.content,
          description: data.description,
          downloadable_file: data.downloadableFile,
          order,
          duration: 0,
          is_free_preview: data.settings.isFreePreview,
          is_prerequisite: data.settings.isPrerequisite,
          enable_discussions: data.settings.enableDiscussions,
          is_downloadable: data.settings.isDownloadable,
        });
        if (error) throw new Error(error);
        toast({ title: "Success", description: "Lesson created" });
      }
      setIsLessonModalOpen(false);
      onUpdate();
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to save lesson",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteLesson = async (id: string) => {
    if (!confirm("Delete this lesson?")) return;
    setIsUpdating(true);
    try {
      const { error } = await LessonService.deleteLesson(id);
      if (error) throw new Error(error);
      toast({ title: "Success", description: "Lesson deleted" });
      onUpdate();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete lesson",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // --- Render Helpers ---

  const getLessonIcon = (type: string) => {
    switch (type) {
      case "video":
        return <Video size={16} className="text-blue-500" />;
      case "text":
        return <FileText size={16} className="text-gray-500" />;
      case "audio":
        return <Mic size={16} className="text-purple-500" />;
      case "quiz":
        return <HelpCircle size={16} className="text-orange-500" />;
      case "survey":
        return <ClipboardList size={16} className="text-green-500" />;
      case "assignment":
        return <FileSpreadsheet size={16} className="text-green-600" />;
      case "pdf":
        return <FileIcon size={16} className="text-red-500" />;
      default:
        return <FileIcon size={16} />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Course Modules</h3>
        <Button onClick={() => setIsAddSectionOpen(true)}>
          <Plus className="h-4 w-4 mr-2" /> Add Section
        </Button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEndSection}
        id="sections-dnd"
      >
        <SortableContext
          items={sections.map((s) => s.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-4">
            {sections.length === 0 ? (
              <div className="text-center p-8 border border-dashed rounded-lg text-gray-500">
                No sections yet. Create one to get started.
              </div>
            ) : (
              sections.map((section) => (
                <SortableSection
                  key={section.id}
                  section={section}
                  onEdit={() =>
                    setEditingSection({ id: section.id, title: section.title })
                  }
                  onDelete={() => handleDeleteSection(section.id)}
                  onAddLesson={() => {
                    setActiveSectionIdForLesson(section.id);
                    setEditingLessonId(null);
                    setIsLessonModalOpen(true);
                  }}
                  onEditLesson={(lesson) => {
                    setActiveSectionIdForLesson(section.id);
                    setEditingLessonId(lesson.id);
                    setIsLessonModalOpen(true);
                  }}
                  onDeleteLesson={handleDeleteLesson}
                  getLessonIcon={getLessonIcon}
                />
              ))
            )}
          </div>
        </SortableContext>
      </DndContext>

      {/* Stats Footer */}
      <div className="flex gap-6 pt-4 border-t text-sm text-gray-500">
        <div>Total Sections: {sections.length}</div>
        <div>
          Total Lessons:{" "}
          {sections.reduce((acc, s) => acc + s.lessons.length, 0)}
        </div>
        {/* Duration calculation could go here */}
      </div>

      {/* Add Section Dialog */}
      <Dialog open={isAddSectionOpen} onOpenChange={setIsAddSectionOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Section</DialogTitle>
          </DialogHeader>
          <Input
            value={newSectionTitle}
            onChange={(e) => setNewSectionTitle(e.target.value)}
            placeholder="Section Title, e.g. Introduction"
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAddSectionOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateSection}
              disabled={isUpdating || !newSectionTitle.trim()}
            >
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Section Dialog */}
      <Dialog
        open={!!editingSection}
        onOpenChange={(open) => !open && setEditingSection(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Section</DialogTitle>
          </DialogHeader>
          <Input
            value={editingSection?.title || ""}
            onChange={(e) =>
              setEditingSection((prev) =>
                prev ? { ...prev, title: e.target.value } : null,
              )
            }
            placeholder="Section Title"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingSection(null)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateSection} disabled={isUpdating}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Lesson Modal (Full Screen or Large Dialog) */}
      {isLessonModalOpen && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-background w-full max-w-5xl h-[90vh] overflow-y-auto rounded-lg border shadow-lg relative">
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-4 z-10"
              onClick={() => setIsLessonModalOpen(false)}
            >
              <span className="sr-only">Close</span>✕
            </Button>
            <div className="p-2">
              <LessonForm
                initialData={
                  editingLessonId
                    ? (() => {
                        const l = sections
                          .flatMap((s) => s.lessons)
                          .find((l) => l.id === editingLessonId);
                        if (!l) return undefined;
                        return {
                          id: l.id,
                          title: l.title,
                          type: l.type,
                          content:
                            typeof l.content === "string"
                              ? l.content
                              : JSON.stringify(l.content), // Adapter
                          description: l.description || undefined,
                          downloadableFile: l.downloadable_file || undefined,
                          settings: {
                            isFreePreview: l.is_free_preview,
                            isPrerequisite: l.is_prerequisite,
                            enableDiscussions: l.enable_discussions,
                            isDownloadable: l.is_downloadable,
                          },
                        } as LessonData;
                      })()
                    : undefined
                }
                onSave={handleSaveLesson}
                onCancel={() => setIsLessonModalOpen(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Sub-component for Sortable Section
function SortableSection({
  section,
  onEdit,
  onDelete,
  onAddLesson,
  onEditLesson,
  onDeleteLesson,
  getLessonIcon,
}: {
  section: SectionWithLessons;
  onEdit: () => void;
  onDelete: () => void;
  onAddLesson: () => void;
  onEditLesson: (l: Lesson) => void;
  onDeleteLesson: (id: string) => void;
  getLessonIcon: (t: string) => any;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white border rounded-lg shadow-sm"
    >
      <div className="flex items-center p-4 gap-3 bg-gray-50/50 rounded-t-lg">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab text-gray-400 hover:text-gray-600"
        >
          <GripVertical size={20} />
        </div>

        <div
          className="flex-1 flex items-center justify-between cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div>
            <h4 className="font-medium text-gray-900 flex items-center gap-2">
              Section {section.order + 1}: {section.title}
            </h4>
            <span className="text-xs text-muted-foreground">
              {section.lessons.length} Lessons
            </span>
          </div>
          <div className="flex items-center gap-2">
            {/* We avoid nested buttons click propagation issues */}
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
            >
              <Edit2 size={14} className="text-gray-500" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
            >
              <Trash2 size={14} className="text-red-500" />
            </Button>
          </div>
        </div>
      </div>

      {/* Expanded Content (Lessons) */}
      {isExpanded && (
        <div className="p-4 border-t bg-white">
          <div className="space-y-2">
            {section.lessons
              .sort((a, b) => a.order - b.order)
              .map((lesson) => (
                <div
                  key={lesson.id}
                  className="flex items-center gap-3 p-3 rounded-md hover:bg-gray-50 border border-transparent hover:border-gray-200 group"
                >
                  <div className="cursor-grab text-gray-300 hover:text-gray-500">
                    <GripVertical size={16} />
                  </div>
                  <div className="text-gray-500">
                    {getLessonIcon(lesson.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {lesson.title}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>
                        {lesson.duration > 0
                          ? `${Math.round(lesson.duration / 60)} min`
                          : "0 min"}
                      </span>
                      {lesson.is_free_preview && (
                        <span className="flex items-center gap-1 text-green-600 bg-green-50 px-1.5 py-0.5 rounded">
                          <Eye size={10} /> Preview
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEditLesson(lesson)}
                      className="h-8 w-8"
                    >
                      <Edit2 size={14} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDeleteLesson(lesson.id)}
                      className="h-8 w-8 text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              ))}
          </div>
          <div className="mt-4 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onAddLesson}
              className="w-full border-dashed"
            >
              <Plus size={14} className="mr-2" /> Add Lesson
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

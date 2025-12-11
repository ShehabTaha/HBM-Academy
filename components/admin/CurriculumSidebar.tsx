import {
  Plus,
  Video,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  Layout,
  FileText,
} from "lucide-react";

interface SidebarProps {
  courseTitle: string;
  chapters: any[];
  loading: boolean;
  activeView: string;
  activeChapterId: string | null;
  activeLessonId: string | null;
  toggleChapter: (id: string) => void;
  navigateToAddChapter: () => void;
  navigateToEditChapter: (id: string) => void;
  navigateToAddLesson: (chapterId: string) => void;
  navigateToEditLesson: (chapterId: string, lessonId: string) => void;
}

export function CurriculumSidebar({
  courseTitle,
  chapters,
  loading,
  activeView,
  activeChapterId,
  activeLessonId,
  toggleChapter,
  navigateToAddChapter,
  navigateToEditChapter,
  navigateToAddLesson,
  navigateToEditLesson,
}: SidebarProps) {
  return (
    <div className="flex flex-col h-full pt-6 pb-6 bg-gray-50/50 border-r border-gray-200">
      <div className="px-5 mb-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-1 line-clamp-1">
          {courseTitle}
        </h3>
      </div>

      <div className="flex-1 overflow-y-auto px-4 space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <p className="text-xs text-gray-400 mt-2">Loading...</p>
          </div>
        ) : chapters.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center h-64 px-4">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <ClipboardList className="w-8 h-8 text-gray-300" />
            </div>
            <p className="text-sm font-medium text-gray-900 mb-1">
              You don't have any lessons
            </p>
            <p className="text-xs text-gray-500 leading-tight">
              Start by adding your first lesson to begin building your course
            </p>
          </div>
        ) : (
          chapters.map((chapter, index) => (
            <div key={chapter.id} className="group">
              <div
                className={`flex items-center justify-between mb-2 cursor-pointer p-2 rounded transition-all ${
                  activeChapterId === chapter.id &&
                  activeView === "edit_chapter"
                    ? "bg-blue-50 text-blue-700 shadow-sm"
                    : "text-gray-700 hover:bg-white hover:shadow-sm"
                }`}
                onClick={() => toggleChapter(chapter.id)}
              >
                <div
                  className="flex items-center gap-3 flex-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    // If we want to allow editing chapter details by clicking title
                    navigateToEditChapter(chapter.id);
                    if (!chapter.isOpen) toggleChapter(chapter.id);
                  }}
                >
                  <div
                    className={`flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold ${
                      activeChapterId === chapter.id &&
                      activeView === "edit_chapter"
                        ? "bg-blue-200 text-blue-800"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {index + 1}
                  </div>
                  <span className="text-sm font-medium truncate max-w-[160px]">
                    {chapter.title}
                  </span>
                </div>
                {chapter.isOpen ? (
                  <ChevronDown
                    className="w-4 h-4 text-gray-400 opacity-50 hover:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleChapter(chapter.id);
                    }}
                  />
                ) : (
                  <ChevronRight
                    className="w-4 h-4 text-gray-400 opacity-50 hover:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleChapter(chapter.id);
                    }}
                  />
                )}
              </div>

              {chapter.isOpen && (
                <div className="pl-9 pr-1 space-y-1">
                  {chapter.lessons &&
                    chapter.lessons.map((lesson: any) => (
                      <div
                        key={lesson.id}
                        className={`text-xs pl-2 py-2 flex items-center gap-2 cursor-pointer rounded ${
                          activeLessonId === lesson.id
                            ? "bg-blue-50 text-blue-700 font-medium"
                            : "text-gray-500 hover:bg-gray-100"
                        }`}
                        onClick={() =>
                          navigateToEditLesson(chapter.id, lesson.id)
                        }
                      >
                        {lesson.type === "video" ? (
                          <Video className="w-3 h-3" />
                        ) : (
                          <FileText className="w-3 h-3" />
                        )}
                        <span className="truncate">{lesson.title}</span>
                      </div>
                    ))}

                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-xs h-8 text-gray-400 hover:text-gray-700 hover:bg-transparent px-2 mt-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigateToAddLesson(chapter.id);
                    }}
                  >
                    <Plus className="w-3 h-3 mr-2" /> Add lesson
                  </Button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <div className="px-4 mt-auto pt-4 border-t border-gray-100 bg-white pb-4">
        <Button
          variant="outline"
          className="w-full py-6 text-gray-600 border-gray-200 hover:bg-gray-50 hover:text-gray-900"
          onClick={navigateToAddChapter}
          disabled={loading}
        >
          <Plus className="w-4 h-4 mr-2" /> Add chapter
        </Button>
      </div>
    </div>
  );
}

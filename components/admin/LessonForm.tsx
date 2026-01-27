"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Video,
  FileText,
  Type,
  Mic,
  FileQuestion,
  ClipboardList,
  FileSpreadsheet,
  Plus,
  Trash2,
  FileAudio,
  Circle,
  CheckCircle2,
  X,
  Library,
} from "lucide-react";
import VideoSelectionModal from "@/components/dashboard/courses/modals/VideoSelectionModal";
import type { Video as LibraryVideo } from "@/types/video-library";
import Image from "next/image";

export type LessonType =
  | "video"
  | "text"
  | "pdf"
  | "audio"
  | "quiz"
  | "survey"
  | "assignment";

export interface LessonData {
  id: string;
  title: string;
  type: LessonType;
  content: string; // URL for video/pdf, HTML/Markdown for text, JSON for quiz/survey
  description?: string; // Optional description for all lesson types
  duration?: number;
  thumbnail?: string;
  downloadableFile?: string; // Optional downloadable file for all lesson types
  settings: {
    isFreePreview: boolean;
    isPrerequisite: boolean;
    enableDiscussions: boolean;
    isDownloadable: boolean;
  };
}

interface Option {
  id: string;
  text: string;
}

interface Question {
  id: string;
  text: string;
  options: Option[];
  correctOptionId?: string;
}

interface LessonFormProps {
  initialData?: LessonData;
  onSave: (data: LessonData) => void;
  onCancel: () => void;
}

const lessonTypes: {
  type: LessonType;
  label: string;
  icon: React.ReactNode;
}[] = [
  { type: "video", label: "Video", icon: <Video size={20} /> },
  { type: "text", label: "Text", icon: <Type size={20} /> },
  { type: "pdf", label: "PDF", icon: <FileText size={20} /> },
  { type: "audio", label: "Audio", icon: <Mic size={20} /> },
  { type: "quiz", label: "Quiz", icon: <FileQuestion size={20} /> },
  { type: "survey", label: "Survey", icon: <ClipboardList size={20} /> },
  {
    type: "assignment",
    label: "Assignment",
    icon: <FileSpreadsheet size={20} />,
  },
];

export default function LessonForm({
  initialData,
  onSave,
  onCancel,
}: LessonFormProps) {
  const [title, setTitle] = useState(initialData?.title || "");
  const [type, setType] = useState<LessonType>(initialData?.type || "video");
  const [content, setContent] = useState(initialData?.content || "");
  const [description, setDescription] = useState(
    initialData?.description || "",
  );
  const [settings, setSettings] = useState(
    initialData?.settings || {
      isFreePreview: false,
      isPrerequisite: false,
      enableDiscussions: false,
      isDownloadable: false,
    },
  );

  // --- Persistence Logic ---
  const draftKey = `hbm_lesson_draft_${initialData?.id || "new"}`;

  useEffect(() => {
    const saved = localStorage.getItem(draftKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.title) setTitle(parsed.title);
        if (parsed.type) setType(parsed.type);
        if (parsed.content) setContent(parsed.content);
        if (parsed.description) setDescription(parsed.description);
        if (parsed.settings) setSettings(parsed.settings);
      } catch (e) {
        console.error("Failed to load lesson draft", e);
      }
    }
  }, [draftKey]);

  useEffect(() => {
    const draftData = { title, type, content, description, settings };
    // Only save if it's actually changed from initialData
    const isDifferent =
      JSON.stringify(draftData) !==
      JSON.stringify({
        title: initialData?.title || "",
        type: initialData?.type || "video",
        content: initialData?.content || "",
        description: initialData?.description || "",
        settings: initialData?.settings || {
          isFreePreview: false,
          isPrerequisite: false,
          enableDiscussions: false,
          isDownloadable: false,
        },
      });

    if (isDifferent) {
      localStorage.setItem(draftKey, JSON.stringify(draftData));
    } else {
      localStorage.removeItem(draftKey);
    }
  }, [title, type, content, description, settings, draftKey, initialData]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const downloadableFileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFileName, setSelectedFileName] = useState(
    ["video", "audio", "pdf"].includes(initialData?.type || "") &&
      initialData?.content
      ? initialData.content
      : "",
  );

  const [selectedDownloadableFileName, setSelectedDownloadableFileName] =
    useState(initialData?.downloadableFile || "");

  const [isEncoding, setIsEncoding] = useState(false);
  const [encodingProgress, setEncodingProgress] = useState(0);

  // For video preview - handle both new uploads (blob URLs) and existing videos (storage URLs)
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(() => {
    if (initialData?.type === "video" && initialData?.content) {
      // Check if it's a valid URL (from storage) or just a filename
      if (
        initialData.content.startsWith("http") ||
        initialData.content.startsWith("blob:")
      ) {
        return initialData.content;
      }
      // If it's just a filename, we can't preview it without uploading to storage first
      // In a real implementation, you'd fetch it from Supabase Storage here
      return null;
    }
    return null;
  });

  const [audioPreviewUrl, setAudioPreviewUrl] = useState<string | null>(() => {
    if (initialData?.type === "audio" && initialData?.content) {
      if (
        initialData.content.startsWith("http") ||
        initialData.content.startsWith("blob:")
      ) {
        return initialData.content;
      }
      return null;
    }
    return null;
  });

  const [libraryModalOpen, setLibraryModalOpen] = useState(false);
  const [thumbnail, setThumbnail] = useState(initialData?.thumbnail || "");
  const [duration, setDuration] = useState(initialData?.duration || 0);

  // Quiz/Survey State
  const [questions, setQuestions] = useState<Question[]>([]);

  // Validation State
  const [errors, setErrors] = useState<{
    title?: string;
    content?: string;
    questions?: string;
  }>({});

  // Initialize questions if editing a quiz/survey
  useEffect(() => {
    if ((type === "quiz" || type === "survey") && initialData?.content) {
      try {
        const parsed = JSON.parse(initialData.content);
        if (Array.isArray(parsed)) {
          setQuestions(parsed);
        }
      } catch (e) {
        // Fallback if content isn't JSON
        console.error("Failed to parse quiz content", e);
      }
    } else {
      setQuestions([]);
    }
  }, [type, initialData]);

  // Simulate encoding when a file is "uploaded"
  useEffect(() => {
    if (isEncoding && encodingProgress < 100) {
      const timer = setTimeout(() => {
        setEncodingProgress((prev) => Math.min(prev + 5, 100));
      }, 500);
      return () => clearTimeout(timer);
    } else if (encodingProgress === 100) {
      setIsEncoding(false);
    }
  }, [isEncoding, encodingProgress]);

  // Cleanup object URLs
  useEffect(() => {
    return () => {
      if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl);
      if (audioPreviewUrl) URL.revokeObjectURL(audioPreviewUrl);
    };
  }, [videoPreviewUrl, audioPreviewUrl]);

  const handleSave = async () => {
    // Reset errors
    const newErrors: {
      title?: string;
      content?: string;
      questions?: string;
    } = {};

    // Validate title
    if (!title.trim()) {
      newErrors.title = "Lesson title is required";
    }

    // Validate content based on lesson type
    if (type === "video") {
      if (!content.trim() && !selectedFileName) {
        newErrors.content = "Please search for a video or upload a video file";
      }
    } else if (type === "text" || type === "assignment") {
      if (!content.trim()) {
        newErrors.content =
          type === "assignment"
            ? "Assignment instructions are required"
            : "Content is required";
      }
    } else if (type === "pdf" || type === "audio") {
      if (!selectedFileName && !initialData?.content) {
        newErrors.content = `Please upload a ${
          type === "pdf" ? "PDF" : "audio"
        } file`;
      }
    } else if (type === "quiz" || type === "survey") {
      // Validate questions
      if (questions.length === 0) {
        newErrors.questions = `Please add at least one question to your ${type}`;
      } else {
        // Validate each question
        for (let i = 0; i < questions.length; i++) {
          const q = questions[i];
          if (!q.text.trim()) {
            newErrors.questions = `Question ${i + 1} text is required`;
            break;
          }
          if (q.options.length < 2) {
            newErrors.questions = `Question ${
              i + 1
            } must have at least 2 options`;
            break;
          }
          // Check if all options have text
          const emptyOption = q.options.findIndex((opt) => !opt.text.trim());
          if (emptyOption !== -1) {
            newErrors.questions = `Question ${i + 1}, Option ${
              emptyOption + 1
            } text is required`;
            break;
          }
          // For quizzes, validate that a correct answer is selected
          if (type === "quiz" && !q.correctOptionId) {
            newErrors.questions = `Question ${
              i + 1
            } must have a correct answer selected`;
            break;
          }
        }
      }
    }

    // If there are errors, set them and return
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Clear errors and proceed with save
    setErrors({});

    // Import upload functions dynamically
    const { uploadVideo, uploadAudio, uploadCourseMaterial } =
      await import("@/lib/services/storage.service");

    let finalContent = content;
    let finalDownloadableFile = selectedDownloadableFileName;
    const lessonId = initialData?.id || Date.now().toString();

    try {
      setIsEncoding(true);
      setEncodingProgress(10); // Start progress

      // Handle Main Content File Upload
      if (fileInputRef.current?.files?.[0]) {
        const file = fileInputRef.current.files[0];

        let result;
        if (type === "video") {
          result = await uploadVideo(lessonId, file, (progress) =>
            setEncodingProgress(progress),
          );
        } else if (type === "audio") {
          result = await uploadAudio(lessonId, file);
        } else if (type === "pdf") {
          result = await uploadCourseMaterial(lessonId, file);
        }

        if (result && result.success && result.url) {
          finalContent = result.url;
        } else {
          setErrors({ ...errors, content: result?.error || "Upload failed" });
          setIsEncoding(false);
          return;
        }
      }

      // Handle Downloadable File Upload
      if (downloadableFileInputRef.current?.files?.[0]) {
        const file = downloadableFileInputRef.current.files[0];
        // Use generic material upload for attachments
        const result = await uploadCourseMaterial(lessonId, file);

        if (result && result.success && result.url) {
          finalDownloadableFile = result.url;
        } else {
          // Non-blocking error for optional file, but good to log
          console.error("Downloadable file upload failed", result?.error);
        }
      }

      setEncodingProgress(100);
      setEncodingProgress(100);
    } catch (e) {
      console.error("Upload error details:", e);

      // If bucket is missing or other storage error, we should still allow saving the lesson
      // potentially without the file URL or just fail gracefully
      const errorMessage = e instanceof Error ? e.message : "Unknown error";

      if (
        errorMessage.includes("Bucket not found") ||
        errorMessage.includes("storage")
      ) {
        alert(
          "Warning: Storage buckets are missing. File cannot be uploaded. Using placeholder data.",
        );
        // Fallback: Use filename as content if upload fails, or empty?
        // We'll leave finalContent as is, but maybe set error?
        // Actually, let's just proceed so user isn't stuck.
      } else {
        setErrors({
          ...errors,
          content: "File upload failed: " + errorMessage,
        });
        setIsEncoding(false);
        return;
      }
    }

    if (type === "quiz" || type === "survey") {
      finalContent = JSON.stringify(questions);
    }

    onSave({
      id: lessonId,
      title,
      type,
      content: finalContent,
      description: description.trim() || undefined,
      duration,
      thumbnail: thumbnail || undefined,
      downloadableFile: finalDownloadableFile || undefined,
      settings,
    });

    // Clear draft after successful save
    localStorage.removeItem(draftKey);

    setIsEncoding(false);
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFileName(file.name);

      // Temporarily set preview URLs for immediate feedback
      if (type === "video") {
        const url = URL.createObjectURL(file);
        setVideoPreviewUrl(url);
        setIsEncoding(false); // Can't properly mock encoding with real upload pending
      } else if (type === "audio") {
        const url = URL.createObjectURL(file);
        setAudioPreviewUrl(url);
      } else if (type === "pdf") {
        // Just show name
        setContent(file.name);
      }

      // Clear content error when file is selected
      if (errors.content) {
        setErrors({ ...errors, content: undefined });
      }
    }
  };

  const handleCancelUpload = () => {
    setSelectedFileName("");
    setContent("");
    setIsEncoding(false);
    setEncodingProgress(0);
    if (videoPreviewUrl) {
      URL.revokeObjectURL(videoPreviewUrl);
      setVideoPreviewUrl(null);
    }
    if (audioPreviewUrl) {
      URL.revokeObjectURL(audioPreviewUrl);
      setAudioPreviewUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const addQuestion = () => {
    setQuestions([
      ...questions,
      { id: Date.now().toString(), text: "", options: [] },
    ]);
    // Clear questions error when adding a question
    if (errors.questions) {
      setErrors({ ...errors, questions: undefined });
    }
  };

  const updateQuestion = (id: string, text: string) => {
    setQuestions(questions.map((q) => (q.id === id ? { ...q, text } : q)));
  };

  const removeQuestion = (id: string) => {
    setQuestions(questions.filter((q) => q.id !== id));
  };

  const addOption = (questionId: string) => {
    setQuestions(
      questions.map((q) => {
        if (q.id === questionId) {
          return {
            ...q,
            options: [...q.options, { id: Date.now().toString(), text: "" }],
          };
        }
        return q;
      }),
    );
  };

  const updateOption = (questionId: string, optionId: string, text: string) => {
    setQuestions(
      questions.map((q) => {
        if (q.id === questionId) {
          return {
            ...q,
            options: q.options.map((opt) =>
              opt.id === optionId ? { ...opt, text } : opt,
            ),
          };
        }
        return q;
      }),
    );
  };

  const removeOption = (questionId: string, optionId: string) => {
    setQuestions(
      questions.map((q) => {
        if (q.id === questionId) {
          return {
            ...q,
            options: q.options.filter((opt) => opt.id !== optionId),
          };
        }
        return q;
      }),
    );
  };

  const setCorrectOption = (questionId: string, optionId: string) => {
    setQuestions(
      questions.map((q) => {
        if (q.id === questionId) {
          return { ...q, correctOptionId: optionId };
        }
        return q;
      }),
    );
  };

  const renderRichTextEditor = () => (
    <div className="border rounded-md shadow-sm">
      <div className="flex items-center gap-1 p-2 border-b bg-gray-50 flex-wrap">
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Bold size={16} />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Italic size={16} />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Underline size={16} />
        </Button>
        <div className="w-px h-4 bg-gray-300 mx-1" />
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <List size={16} />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <ListOrdered size={16} />
        </Button>
      </div>
      <textarea
        className="w-full p-4 min-h-[300px] outline-none resize-y text-sm"
        placeholder="Enter content here..."
        value={content}
        onChange={(e) => {
          setContent(e.target.value);
          if (errors.content) {
            setErrors({ ...errors, content: undefined });
          }
        }}
      />
    </div>
  );

  return (
    <div className="w-full max-w-4xl bg-white p-8 rounded-lg border shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">New Lesson</h2>
      </div>

      <div className="space-y-8">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Title
          </label>
          <Input
            placeholder="Enter a lesson title"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (errors.title) {
                setErrors({ ...errors, title: undefined });
              }
            }}
            className={`w-full ${
              errors.title ? "border-red-500 focus:ring-red-500" : ""
            }`}
          />
          {errors.title && (
            <p className="text-red-500 text-sm mt-1">{errors.title}</p>
          )}
        </div>

        {/* Lesson Type Grid */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Lesson Type
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {lessonTypes.map((item) => (
              <button
                key={item.type}
                onClick={() => {
                  setType(item.type);
                  setContent("");
                  setSelectedFileName("");
                  setQuestions([]);
                  setErrors({});
                }}
                className={`flex items-center gap-3 p-3 rounded-lg border text-sm font-medium transition-colors ${
                  type === item.type
                    ? "border-blue-600 bg-blue-50 text-blue-700"
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700"
                }`}
              >
                <span
                  className={
                    type === item.type ? "text-blue-600" : "text-gray-500"
                  }
                >
                  {item.icon}
                </span>
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content Editors */}
        {type === "video" && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Video Content
              </label>

              {content && content.startsWith("http") ? (
                <div className="flex items-center gap-4 p-4 border rounded-lg bg-blue-50/30 border-blue-100">
                  <div className="relative w-32 aspect-video bg-muted rounded overflow-hidden shadow-sm">
                    {thumbnail ? (
                      <Image
                        src={thumbnail}
                        alt="Thumbnail"
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Video className="text-blue-300" size={24} />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-blue-900 truncate">
                      {title || "Selected Video"}
                    </p>
                    <p className="text-xs text-blue-600 truncate opacity-70">
                      External Video source
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-blue-600 hover:text-blue-800 shrink-0"
                    onClick={() => setLibraryModalOpen(true)}
                  >
                    Change
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 px-4 border-2 border-dashed rounded-xl bg-gray-50/50 hover:bg-gray-50 transition-colors group">
                  <Library className="h-10 w-10 text-gray-300 mb-2 group-hover:text-blue-400 transition-colors" />
                  <p className="text-sm text-gray-500 mb-4">
                    No video selected from library
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    className="bg-white"
                    onClick={() => setLibraryModalOpen(true)}
                  >
                    <Library className="h-4 w-4 mr-2" />
                    Select from Video Library
                  </Button>
                </div>
              )}
            </div>

            <VideoSelectionModal
              open={libraryModalOpen}
              onOpenChange={setLibraryModalOpen}
              onSelect={(video) => {
                setLibraryModalOpen(false);
                setTitle(video.title);
                if (video.description) setDescription(video.description);
                setContent(video.file_url);
                setThumbnail(video.thumbnail_url || "");
                setDuration(video.duration);
              }}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload a video file
              </label>

              {!selectedFileName ? (
                <div className="flex gap-2">
                  <div className="flex-1 border rounded-md px-3 py-2 text-sm text-gray-500 bg-gray-50 truncate">
                    No file selected
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="video/*"
                    onChange={handleFileChange}
                  />
                  <Button
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={handleBrowseClick}
                  >
                    Browse files
                  </Button>
                </div>
              ) : (
                <div className="border rounded-lg p-4 bg-white">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900 truncate max-w-[80%]">
                      {selectedFileName}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCancelUpload}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 px-2"
                    >
                      Cancel
                    </Button>
                  </div>

                  {isEncoding ? (
                    <div className="space-y-2">
                      <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-600 transition-all duration-500 ease-out"
                          style={{ width: `${encodingProgress}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 text-right">
                        Encoding... {encodingProgress}%
                      </p>
                    </div>
                  ) : (
                    <div className="relative w-full aspect-video bg-black rounded-md overflow-hidden flex items-center justify-center">
                      {videoPreviewUrl ? (
                        <video
                          src={videoPreviewUrl}
                          className="w-full h-full object-contain"
                          controls
                          controlsList="nodownload"
                          disablePictureInPicture
                          onContextMenu={(e) => e.preventDefault()}
                        />
                      ) : (
                        <div className="text-white text-center">
                          <Video
                            size={48}
                            className="mx-auto mb-2 opacity-50"
                          />
                          <p className="text-sm font-medium">Video Processed</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              <p className="text-xs text-gray-500 mt-2">
                Max size 2GB. we suggest compressing your video using HandBrake
                To all about the details pick your thumbnail image, add closed
                captions, update settings, and track your video performance
                analyze to the video library{" "}
                <a href="#" className="text-blue-600 hover:underline">
                  manage video settings
                </a>
                .
              </p>
            </div>
            {errors.content && (
              <p className="text-red-500 text-sm mt-2">{errors.content}</p>
            )}
          </div>
        )}

        {(type === "text" || type === "assignment") && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {type === "assignment" ? "Assignment Instructions" : "Content"}
            </label>
            {renderRichTextEditor()}
            {errors.content && (
              <p className="text-red-500 text-sm mt-2">{errors.content}</p>
            )}
          </div>
        )}

        {type === "pdf" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Upload PDF
            </label>
            <div className="flex gap-2">
              <div className="flex-1 border rounded-md px-3 py-2 text-sm text-gray-500 bg-gray-50 truncate">
                {selectedFileName || "No file selected"}
              </div>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="application/pdf"
                onChange={handleFileChange}
              />
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white"
                onClick={handleBrowseClick}
              >
                Browse files
              </Button>
            </div>
            {errors.content && (
              <p className="text-red-500 text-sm mt-2">{errors.content}</p>
            )}
          </div>
        )}

        {type === "audio" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Audio
            </label>
            {!selectedFileName ? (
              <div className="flex gap-2">
                <div className="flex-1 border rounded-md px-3 py-2 text-sm text-gray-500 bg-gray-50 truncate">
                  No file selected
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="audio/*"
                  onChange={handleFileChange}
                />
                <Button
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={handleBrowseClick}
                >
                  Browse files
                </Button>
              </div>
            ) : (
              <div className="border rounded-lg p-4 bg-gray-50">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <FileAudio className="text-blue-600" size={24} />
                    <span className="text-sm font-medium text-gray-900 truncate">
                      {selectedFileName}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCancelUpload}
                    className="text-red-500 hover:text-red-700"
                  >
                    Remove
                  </Button>
                </div>
                {audioPreviewUrl && (
                  <audio controls className="w-full">
                    <source src={audioPreviewUrl} />
                    Your browser does not support the audio element.
                  </audio>
                )}
              </div>
            )}
            {errors.content && (
              <p className="text-red-500 text-sm mt-2">{errors.content}</p>
            )}
          </div>
        )}

        {(type === "quiz" || type === "survey") && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <label className="block text-sm font-medium text-gray-700">
                Questions
              </label>
              <Button
                onClick={addQuestion}
                size="sm"
                variant="outline"
                className="gap-2"
              >
                <Plus size={16} /> Add Question
              </Button>
            </div>

            {questions.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed rounded-lg text-gray-500">
                No questions added yet. Click &quot;Add Question&quot; to start.
              </div>
            ) : (
              <div className="space-y-6">
                {questions.map((q, index) => (
                  <div
                    key={q.id}
                    className="border rounded-lg p-4 bg-gray-50 space-y-4"
                  >
                    <div className="flex gap-2 items-start">
                      <span className="mt-2.5 text-sm font-medium text-gray-500 w-6">
                        {index + 1}.
                      </span>
                      <Input
                        value={q.text}
                        onChange={(e) => updateQuestion(q.id, e.target.value)}
                        placeholder="Enter your question..."
                        className="flex-1 bg-white"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeQuestion(q.id)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <Trash2 size={18} />
                      </Button>
                    </div>

                    <div className="pl-8 space-y-2">
                      {q.options.map((opt) => (
                        <div key={opt.id} className="flex items-center gap-2">
                          <button
                            onClick={() => setCorrectOption(q.id, opt.id)}
                            className={`shrink-0 ${
                              q.correctOptionId === opt.id
                                ? "text-green-600"
                                : "text-gray-300 hover:text-gray-400"
                            }`}
                          >
                            {q.correctOptionId === opt.id ? (
                              <CheckCircle2 size={20} />
                            ) : (
                              <Circle size={20} />
                            )}
                          </button>
                          <Input
                            value={opt.text}
                            onChange={(e) =>
                              updateOption(q.id, opt.id, e.target.value)
                            }
                            placeholder="Option text..."
                            className="flex-1 h-9 text-sm bg-white"
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeOption(q.id, opt.id)}
                            className="h-8 w-8 text-gray-400 hover:text-red-500"
                          >
                            <X size={16} />
                          </Button>
                        </div>
                      ))}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => addOption(q.id)}
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 h-8 px-2 text-xs"
                      >
                        <Plus size={14} className="mr-1" /> Add Option
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {errors.questions && (
              <p className="text-red-500 text-sm mt-2">{errors.questions}</p>
            )}
          </div>
        )}

        {/* Description - appears for all lesson types */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description (Optional)
          </label>
          <textarea
            className="w-full p-3 border rounded-md text-sm outline-none resize-y min-h-[100px] focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Add a description for this lesson..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <p className="text-xs text-gray-500 mt-1">
            Provide additional context or information about this lesson
          </p>
        </div>

        {/* Downloadable File - appears for all lesson types */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Downloadable File (Optional)
          </label>
          {!selectedDownloadableFileName ? (
            <div className="flex gap-2">
              <div className="flex-1 border rounded-md px-3 py-2 text-sm text-gray-500 bg-gray-50 truncate">
                No file selected
              </div>
              <input
                type="file"
                ref={downloadableFileInputRef}
                className="hidden"
                accept="*/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setSelectedDownloadableFileName(file.name);
                  }
                }}
              />
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => downloadableFileInputRef.current?.click()}
              >
                Browse files
              </Button>
            </div>
          ) : (
            <div className="border rounded-lg p-3 bg-gray-50 flex items-center justify-between">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <FileText className="text-blue-600 shrink-0" size={20} />
                <span className="text-sm font-medium text-gray-900 truncate">
                  {selectedDownloadableFileName}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedDownloadableFileName("");

                  if (downloadableFileInputRef.current) {
                    downloadableFileInputRef.current.value = "";
                  }
                }}
                className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 px-2 ml-2"
              >
                Remove
              </Button>
            </div>
          )}
          <p className="text-xs text-gray-500 mt-1">
            Upload a file that students can download (e.g., PDF, document,
            resource file)
          </p>
        </div>

        {/* Settings */}
        <div className="space-y-4 pt-6 border-t">
          <h3 className="font-medium text-gray-900">Lesson settings</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="isFreePreview"
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                checked={settings.isFreePreview}
                onChange={(e) =>
                  setSettings({ ...settings, isFreePreview: e.target.checked })
                }
              />
              <label
                htmlFor="isFreePreview"
                className="text-sm text-gray-700 cursor-pointer select-none"
              >
                Make this a free preview lesson
              </label>
            </div>
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="isPrerequisite"
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                checked={settings.isPrerequisite}
                onChange={(e) =>
                  setSettings({ ...settings, isPrerequisite: e.target.checked })
                }
              />
              <label
                htmlFor="isPrerequisite"
                className="text-sm text-gray-700 cursor-pointer select-none"
              >
                Make this a prerequisite
              </label>
            </div>
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="enableDiscussions"
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                checked={settings.enableDiscussions}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    enableDiscussions: e.target.checked,
                  })
                }
              />
              <label
                htmlFor="enableDiscussions"
                className="text-sm text-gray-700 cursor-pointer select-none"
              >
                Enable discussions for this lesson
              </label>
            </div>
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="isDownloadable"
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                checked={settings.isDownloadable}
                onChange={(e) =>
                  setSettings({ ...settings, isDownloadable: e.target.checked })
                }
              />
              <label
                htmlFor="isDownloadable"
                className="text-sm text-gray-700 cursor-pointer select-none"
              >
                Make this video downloadable
              </label>
            </div>
          </div>
        </div>

        {/* Icon and Label */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Lesson icon and label
          </label>
          <div className="flex items-center border rounded-md px-3 py-2 bg-white w-full max-w-md">
            <span className="text-gray-500 mr-3">
              {lessonTypes.find((t) => t.type === type)?.icon}
            </span>
            <span className="text-sm text-gray-900 capitalize">
              {lessonTypes.find((t) => t.type === type)?.label}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-6">
          <Button
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6"
          >
            Save changes
          </Button>
          <Button
            variant="outline"
            onClick={onCancel}
            className="text-gray-600 px-6"
          >
            Discard changes
          </Button>
        </div>
      </div>
    </div>
  );
}

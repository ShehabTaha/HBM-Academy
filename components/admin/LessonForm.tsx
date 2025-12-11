"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  Link as LinkIcon,
  Image as ImageIcon,
  Video,
  FileText,
  Type,
  Mic,
  FileQuestion,
  Download,
  ClipboardList,
  FileSpreadsheet,
  Plus,
  Trash2,
  FileAudio,
  Circle,
  CheckCircle2,
  X,
} from "lucide-react";

export type LessonType =
  | "video"
  | "text"
  | "pdf"
  | "audio"
  | "quiz"
  | "download"
  | "survey"
  | "assignment";

export interface LessonData {
  id: string;
  title: string;
  type: LessonType;
  content: string; // URL for video/pdf, HTML/Markdown for text, JSON for quiz/survey
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
  { type: "download", label: "Download", icon: <Download size={20} /> },
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
  const [settings, setSettings] = useState(
    initialData?.settings || {
      isFreePreview: false,
      isPrerequisite: false,
      enableDiscussions: false,
      isDownloadable: false,
    }
  );

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFileName, setSelectedFileName] = useState("");
  const [isEncoding, setIsEncoding] = useState(false);
  const [encodingProgress, setEncodingProgress] = useState(0);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [audioPreviewUrl, setAudioPreviewUrl] = useState<string | null>(null);

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

  const handleSave = () => {
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
    } else if (type === "pdf" || type === "download" || type === "audio") {
      if (!selectedFileName) {
        newErrors.content = `Please upload a ${
          type === "pdf" ? "PDF" : type === "audio" ? "audio" : ""
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

    let finalContent = content;
    if (type === "quiz" || type === "survey") {
      finalContent = JSON.stringify(questions);
    } else if (selectedFileName) {
      finalContent = selectedFileName;
    }

    onSave({
      id: initialData?.id || Date.now().toString(),
      title,
      type,
      content: finalContent,
      settings,
    });
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFileName(file.name);
      setContent(file.name);

      // Clear content error when file is selected
      if (errors.content) {
        setErrors({ ...errors, content: undefined });
      }

      if (type === "video") {
        const url = URL.createObjectURL(file);
        setVideoPreviewUrl(url);
        setIsEncoding(true);
        setEncodingProgress(0);
      } else if (type === "audio") {
        const url = URL.createObjectURL(file);
        setAudioPreviewUrl(url);
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
      })
    );
  };

  const updateOption = (questionId: string, optionId: string, text: string) => {
    setQuestions(
      questions.map((q) => {
        if (q.id === questionId) {
          return {
            ...q,
            options: q.options.map((opt) =>
              opt.id === optionId ? { ...opt, text } : opt
            ),
          };
        }
        return q;
      })
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
      })
    );
  };

  const setCorrectOption = (questionId: string, optionId: string) => {
    setQuestions(
      questions.map((q) => {
        if (q.id === questionId) {
          return { ...q, correctOptionId: optionId };
        }
        return q;
      })
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
                Video from your library
              </label>
              <Input
                placeholder="Search for a video..."
                value={content}
                onChange={(e) => {
                  setContent(e.target.value);
                  if (errors.content) {
                    setErrors({ ...errors, content: undefined });
                  }
                }}
              />
            </div>

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

        {(type === "pdf" || type === "download") && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Upload {type === "pdf" ? "PDF" : "File"}
            </label>
            <div className="flex gap-2">
              <div className="flex-1 border rounded-md px-3 py-2 text-sm text-gray-500 bg-gray-50 truncate">
                {selectedFileName || "No file selected"}
              </div>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept={type === "pdf" ? "application/pdf" : "*/*"}
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
                No questions added yet. Click "Add Question" to start.
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
                            className={`flex-shrink-0 ${
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

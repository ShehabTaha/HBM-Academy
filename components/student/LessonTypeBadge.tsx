import { Badge } from "@/components/ui/badge";
import { BookOpen, FileText, Headphones, PenTool, Play, ScrollText } from "lucide-react";

const icons = {
  video: Play,
  audio: Headphones,
  pdf: FileText,
  text: ScrollText,
  quiz: BookOpen,
  practical: PenTool,
  assignment: PenTool,
  survey: BookOpen,
};

export function LessonTypeBadge({ type }: { type: string }) {
  const Icon = icons[type as keyof typeof icons] ?? BookOpen;

  return (
    <Badge variant="secondary" className="gap-1 rounded-md capitalize">
      <Icon className="h-3.5 w-3.5" />
      {type === "pdf" ? "PDF" : type}
    </Badge>
  );
}

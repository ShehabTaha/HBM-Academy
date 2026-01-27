import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  MoreHorizontal,
  Play,
  Edit,
  Copy,
  Download,
  BarChart2,
  Trash,
} from "lucide-react";

interface ContextMenuProps {
  onPreview: () => void;
  onEdit: () => void;
  onDuplicate: () => void;
  onAnalytics: () => void;
  onDelete: () => void;
  onDownload?: () => void;
}

const ContextMenu: React.FC<ContextMenuProps> = ({
  onPreview,
  onEdit,
  onDuplicate,
  onAnalytics,
  onDelete,
  onDownload,
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 hover:bg-muted/50"
        >
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[160px]">
        <DropdownMenuItem onClick={onPreview}>
          <Play className="mr-2 h-4 w-4" /> Preview
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onEdit}>
          <Edit className="mr-2 h-4 w-4" /> Edit Details
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onDuplicate}>
          <Copy className="mr-2 h-4 w-4" /> Duplicate
        </DropdownMenuItem>
        {onDownload && (
          <DropdownMenuItem onClick={onDownload}>
            <Download className="mr-2 h-4 w-4" /> Download
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={onAnalytics}>
          <BarChart2 className="mr-2 h-4 w-4" /> Analytics
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={onDelete}
          className="text-destructive focus:text-destructive"
        >
          <Trash className="mr-2 h-4 w-4" /> Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ContextMenu;

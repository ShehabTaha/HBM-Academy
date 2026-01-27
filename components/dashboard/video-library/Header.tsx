import React from "react";
import { Button } from "@/components/ui/button";
import { Settings, Plus } from "lucide-react";

interface HeaderProps {
  onUploadClick: () => void;
  onSettingsClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onUploadClick, onSettingsClick }) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Video Library</h1>
        <p className="text-muted-foreground mt-1">
          Upload and manage your lecture videos
        </p>
      </div>
      <div className="flex gap-2 w-full md:w-auto">
        <Button
          variant="outline"
          size="icon"
          onClick={onSettingsClick}
          title="Library Settings"
        >
          <Settings className="h-4 w-4" />
        </Button>
        <Button onClick={onUploadClick} className="flex-1 md:flex-none">
          <Plus className="h-4 w-4 mr-2" />
          Upload Video
        </Button>
      </div>
    </div>
  );
};

export default Header;

import { useState } from "react";
import {
  Camera,
  CheckCircle2,
  ChevronRight,
  Code2,
  FolderHeart,
  FolderOpen,
  Headphones,
  ImageIcon,
  MoreHorizontal,
  Music,
  RotateCcw,
  Star,
  Trash2,
  Upload,
  Video,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn";

const RECENT_FOLDERS = [
  {
    id: 1,
    name: "Projects",
    path: "C:\\Users\\DELL\\Projects",
    color: "#3b82f6",
    icon: Code2,
    applied: true,
    date: "2 hours ago",
  },
  {
    id: 2,
    name: "Photos",
    path: "C:\\Users\\DELL\\Photos",
    color: "#ec4899",
    icon: Camera,
    applied: true,
    date: "Yesterday",
  },
  {
    id: 3,
    name: "Music",
    path: "C:\\Users\\DELL\\Music",
    color: "#8b5cf6",
    icon: Music,
    applied: false,
    date: "3 days ago",
  },
  {
    id: 4,
    name: "Videos",
    path: "C:\\Users\\DELL\\Videos",
    color: "#f97316",
    icon: Video,
    applied: true,
    date: "Last week",
  },
  {
    id: 5,
    name: "Downloads",
    path: "C:\\Users\\DELL\\Downloads",
    color: "#22c55e",
    icon: ImageIcon,
    applied: false,
    date: "Last week",
  },
];

type FoldersTabProps = {
  onFolderSelect?: (path: string, color: string) => void;
};

export function FoldersTab({ onFolderSelect }: FoldersTabProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [folders, setFolders] = useState(RECENT_FOLDERS);
  const [menuOpenId, setMenuOpenId] = useState<number | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };
  const handleDragLeave = () => setIsDragOver(false);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleRemove = (id: number) => {
    setFolders((prev) => prev.filter((f) => f.id !== id));
    setMenuOpenId(null);
  };

  return (
    <div className="flex h-full flex-col gap-5 overflow-auto pb-4">
      {/* Drop Zone */}
      <div
        id="folders-drop-zone"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "relative flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-10 text-center transition-all duration-200",
          isDragOver
            ? "border-primary bg-primary/5 scale-[1.01]"
            : "border-border/60 bg-card/40 hover:border-primary/40 hover:bg-card/60"
        )}
      >
        <div
          className={cn(
            "flex h-16 w-16 items-center justify-center rounded-2xl border border-border/50 bg-secondary/40 transition-all duration-200",
            isDragOver && "border-primary/50 bg-primary/10 scale-110"
          )}
        >
          <Upload
            className={cn(
              "h-7 w-7 transition-colors duration-200",
              isDragOver ? "text-primary" : "text-muted-foreground"
            )}
          />
        </div>
        <div>
          <p className="text-[15px] font-semibold text-foreground">
            {isDragOver ? "Release to add folders" : "Drop folders here"}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Drag & drop any Windows folders to customize them
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="h-px w-12 bg-border/60" />
          <span className="text-xs text-muted-foreground">or</span>
          <div className="h-px w-12 bg-border/60" />
        </div>
        <Button
          id="folders-browse-btn"
          variant="outline"
          size="sm"
          className="gap-2 border-primary/30 hover:border-primary hover:bg-primary/5"
        >
          <FolderOpen className="h-4 w-4 text-primary" />
          Browse Folders
        </Button>
      </div>

      {/* Recently Added */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4 text-primary" />
            <h3 className="text-[13px] font-semibold text-foreground">Recently Added</h3>
            <Badge variant="secondary" className="text-[10px]">
              {folders.length}
            </Badge>
          </div>
          <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs text-muted-foreground">
            View All <ChevronRight className="h-3 w-3" />
          </Button>
        </div>

        <div className="space-y-2">
          {folders.map((folder) => {
            const Icon = folder.icon;
            return (
              <div
                key={folder.id}
                className="group relative flex cursor-pointer items-center gap-3 rounded-xl border border-border/60 bg-card/60 p-3 transition-all duration-200 hover:border-primary/30 hover:bg-card hover:shadow-sm"
                onClick={() => onFolderSelect?.(folder.path, folder.color)}
              >
                {/* Color dot */}
                <div
                  className="relative h-10 w-10 flex-shrink-0 rounded-lg shadow-sm"
                  style={{ backgroundColor: folder.color + "22" }}
                >
                  <Icon
                    className="absolute inset-0 m-auto h-5 w-5"
                    style={{ color: folder.color }}
                  />
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-semibold text-foreground">{folder.name}</p>
                    {folder.applied && (
                      <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0 text-primary" />
                    )}
                  </div>
                  <p className="truncate text-[11px] text-muted-foreground">{folder.path}</p>
                </div>

                {/* Color chip */}
                <div className="flex flex-shrink-0 items-center gap-2">
                  <div
                    className="h-5 w-5 rounded-full border border-white/10 shadow-sm"
                    style={{ backgroundColor: folder.color }}
                  />
                  <span className="text-[11px] font-mono text-muted-foreground">{folder.color}</span>
                </div>

                {/* Date */}
                <span className="flex-shrink-0 text-[11px] text-muted-foreground/60">
                  {folder.date}
                </span>

                {/* Actions menu */}
                <div className="relative flex-shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 opacity-0 transition-opacity group-hover:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpenId(menuOpenId === folder.id ? null : folder.id);
                    }}
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                  {menuOpenId === folder.id && (
                    <div className="absolute right-0 top-8 z-50 w-36 overflow-hidden rounded-lg border border-border bg-popover shadow-xl">
                      <button
                        className="flex w-full items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-secondary/60"
                        onClick={(e) => { e.stopPropagation(); setMenuOpenId(null); onFolderSelect?.(folder.path, folder.color); }}
                      >
                        <RotateCcw className="h-3.5 w-3.5" /> Reset Icon
                      </button>
                      <button
                        className="flex w-full items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-destructive/10"
                        onClick={(e) => { e.stopPropagation(); handleRemove(folder.id); }}
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Remove
                      </button>
                    </div>
                  )}
                </div>

                {/* Hover sidebar indicator */}
                <span
                  className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r-full opacity-0 transition-opacity group-hover:opacity-100"
                  style={{ backgroundColor: folder.color }}
                />
              </div>
            );
          })}
        </div>

        {folders.length === 0 && (
          <div className="flex h-28 items-center justify-center rounded-xl border border-dashed border-border/50 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <FolderHeart className="h-4 w-4" />
              No folders added yet
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

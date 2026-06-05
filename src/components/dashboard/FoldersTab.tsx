import { useEffect, useState } from "react";
import {
  CheckCircle2,
  ChevronRight,
  FolderOpen,
  FolderHeart,
  MoreHorizontal,
  RotateCcw,
  Star,
  Upload,
  X,
} from "lucide-react";
import * as LucideIcons from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn";
import { ALL_ICONS } from "@/data/icons";

type FoldersTabProps = {
  selectedFolderPath?: string;
  onFolderSelect?: (path: string, color: string) => void;
  refreshTrigger?: number;
  onRefreshNeeded?: () => void;
};

export function FoldersTab({
  selectedFolderPath = "",
  onFolderSelect,
  refreshTrigger = 0,
  onRefreshNeeded,
}: FoldersTabProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [folders, setFolders] = useState<any[]>([]);
  const [menuOpenId, setMenuOpenId] = useState<number | null>(null);

  useEffect(() => {
    loadFolders();
  }, [refreshTrigger]);

  async function loadFolders() {
    if (!window.tintd?.ipcRenderer) return;
    try {
      const history = await window.tintd.ipcRenderer.invoke("icons:history");
      const list = history.map((record: any) => ({
        id: record.id,
        name: record.folderPath.split("\\").pop() || "Folder",
        path: record.folderPath,
        color: record.color,
        iconId: record.iconId,
        applied: record.status === "applied",
        date: formatDateRelative(record.updatedAt),
      }));
      setFolders(list);
    } catch (err) {
      console.error("Failed to load customized folders:", err);
    }
  }

  function formatDateRelative(dateStr: string) {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return "Yesterday";
    return `${diffDays}d ago`;
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };
  const handleDragLeave = () => setIsDragOver(false);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      let filePath = "";
      if (window.tintd?.getPathForFile) {
        filePath = window.tintd.getPathForFile(files[0]);
      } else {
        filePath = (files[0] as any).path || "";
      }
      if (filePath) onFolderSelect?.(filePath, "#3b82f6");
    }
  };

  const handleBrowse = async () => {
    if (!window.tintd?.ipcRenderer) return;
    const selected = await window.tintd.ipcRenderer.invoke("folders:select");
    if (selected) onFolderSelect?.(selected, "#3b82f6");
  };

  const handleReset = async (folderPath: string) => {
    if (!window.tintd?.ipcRenderer) return;
    try {
      const result = await window.tintd.ipcRenderer.invoke("removeFolderIcon", folderPath);
      if (result.success) {
        onRefreshNeeded?.();
        loadFolders();
      } else {
        alert("Error resetting: " + result.error);
      }
    } catch (err: any) {
      alert("Failed to reset: " + err.message);
    }
    setMenuOpenId(null);
  };

  return (
    <div className="flex h-full flex-col gap-5 overflow-auto pb-4">
      {/* Selected folder banner */}
      {selectedFolderPath && (
        <div className="flex items-center gap-3 rounded-2xl border border-primary/25 bg-gradient-to-r from-primary/8 to-primary/4 p-4 shadow-sm float-in">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-primary/15 border border-primary/20">
            <FolderOpen className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-primary/80 mb-0.5">
              Selected Folder
            </p>
            <p className="truncate text-[13px] font-bold text-foreground">
              {selectedFolderPath.split("\\").pop() || "Folder"}
            </p>
            <p className="truncate text-[10px] text-muted-foreground font-mono mt-0.5" title={selectedFolderPath}>
              {selectedFolderPath}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground flex-shrink-0"
            onClick={() => onFolderSelect?.("", "#3b82f6")}
            title="Clear selection"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Drop Zone */}
      <div
        id="folders-drop-zone"
        onDragOver={handleDragOver}
        onDragEnter={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "relative flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed p-10 text-center transition-all duration-250 overflow-hidden",
          isDragOver
            ? "border-primary bg-primary/6 scale-[1.01]"
            : "border-border/50 bg-card/30 hover:border-primary/30 hover:bg-card/50"
        )}
      >
        {/* Subtle radial glow when dragging */}
        {isDragOver && (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,hsl(var(--primary)/0.1),transparent_70%)] pointer-events-none" />
        )}

        <div
          className={cn(
            "flex h-16 w-16 items-center justify-center rounded-2xl border border-border/40 bg-secondary/50 transition-all duration-200",
            isDragOver && "border-primary/50 bg-primary/10 scale-110 shadow-primary-glow"
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
            {isDragOver ? "Release to add folder" : "Drop a folder here"}
          </p>
          <p className="mt-1 text-[12px] text-muted-foreground">
            Drag & drop any Windows folder to customize it
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="h-px w-12 bg-border/50" />
          <span className="text-xs text-muted-foreground/60">or</span>
          <div className="h-px w-12 bg-border/50" />
        </div>
        <Button
          id="folders-browse-btn"
          variant="outline"
          size="sm"
          className="gap-2 border-primary/30 hover:border-primary hover:bg-primary/5 rounded-xl h-9 px-5 font-semibold text-[12px]"
          onClick={handleBrowse}
        >
          <FolderOpen className="h-4 w-4 text-primary" />
          Browse Folders
        </Button>
      </div>

      {/* Recently customized */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Star className="h-3.5 w-3.5 text-primary" />
            <h3 className="text-[13px] font-bold text-foreground">Recently Customized</h3>
            <Badge
              variant="secondary"
              className="text-[9px] font-bold px-1.5 py-0 h-4 rounded-full"
            >
              {folders.length}
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 gap-1 text-[11px] text-muted-foreground rounded-lg"
          >
            View All <ChevronRight className="h-3 w-3" />
          </Button>
        </div>

        <div className="space-y-1.5">
          {folders.map((folder) => {
            let LucideIcon: any = FolderOpen;
            let emojiChar: string | undefined = undefined;

            if (folder.iconId) {
              const found = ALL_ICONS.find((i) => i.id === folder.iconId);
              if (found) {
                if (found.lucideIcon) {
                  LucideIcon = (LucideIcons as any)[found.lucideIcon] || FolderOpen;
                } else if (found.emoji) {
                  LucideIcon = null;
                  emojiChar = found.emoji;
                }
              }
            }

            const isSelected = selectedFolderPath === folder.path;

            return (
              <div
                key={folder.id}
                className={cn(
                  "group relative flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition-all duration-200",
                  isSelected
                    ? "border-primary/30 bg-primary/6 shadow-sm"
                    : "border-border/40 bg-card/50 hover:border-border/70 hover:bg-card hover:-translate-y-0.5 hover:shadow-card-hover"
                )}
                onClick={() => onFolderSelect?.(folder.path, folder.color)}
              >
                {/* Colored icon tile */}
                <div
                  className="relative h-10 w-10 flex-shrink-0 rounded-xl shadow-sm flex items-center justify-center overflow-hidden"
                  style={{ backgroundColor: folder.color + "20" }}
                >
                  <div
                    className="absolute inset-0 opacity-10"
                    style={{ backgroundColor: folder.color }}
                  />
                  {LucideIcon ? (
                    <LucideIcon className="h-5 w-5 relative z-10" style={{ color: folder.color }} />
                  ) : (
                    <span className="text-xl select-none font-sans leading-none relative z-10">
                      {emojiChar}
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <p className="truncate text-[13px] font-semibold text-foreground">{folder.name}</p>
                    {folder.applied && (
                      <CheckCircle2 className="h-3 w-3 flex-shrink-0 text-primary" />
                    )}
                  </div>
                  <p className="truncate text-[10px] text-muted-foreground/70 font-mono">
                    {folder.path}
                  </p>
                </div>

                {/* Color dot + date */}
                <div className="flex flex-shrink-0 items-center gap-2">
                  <div
                    className="h-4 w-4 rounded-full border border-black/10 shadow-sm"
                    style={{ backgroundColor: folder.color }}
                  />
                  <span className="text-[10px] text-muted-foreground/60 tabular-nums">{folder.date}</span>
                </div>

                {/* Menu */}
                <div className="relative flex-shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 rounded-lg opacity-0 transition-opacity group-hover:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpenId(menuOpenId === folder.id ? null : folder.id);
                    }}
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                  {menuOpenId === folder.id && (
                    <div className="absolute right-0 top-8 z-50 w-36 overflow-hidden rounded-xl border border-border bg-popover shadow-xl">
                      <button
                        className="flex w-full items-center gap-2 px-3 py-2.5 text-[12px] text-foreground hover:bg-secondary/60 transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleReset(folder.path);
                        }}
                      >
                        <RotateCcw className="h-3.5 w-3.5" /> Reset Icon
                      </button>
                    </div>
                  )}
                </div>

                {/* Active indicator bar */}
                <span
                  className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full opacity-0 transition-opacity group-hover:opacity-100"
                  style={{ backgroundColor: folder.color }}
                />
              </div>
            );
          })}
        </div>

        {folders.length === 0 && (
          <div className="flex h-28 items-center justify-center rounded-2xl border border-dashed border-border/40 bg-card/20">
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <FolderHeart className="h-6 w-6 opacity-40" />
              <p className="text-[12px] font-medium">No customized folders yet</p>
              <p className="text-[10px] opacity-60">Drop a folder above to get started</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

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
    return `${diffDays} days ago`;
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

      if (filePath) {
        onFolderSelect?.(filePath, "#3b82f6");
      }
    }
  };

  const handleBrowse = async () => {
    if (!window.tintd?.ipcRenderer) return;
    const selected = await window.tintd.ipcRenderer.invoke("folders:select");
    if (selected) {
      onFolderSelect?.(selected, "#3b82f6");
    }
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
      {selectedFolderPath && (
        <div className="flex items-center gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4 shadow-sm animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <FolderOpen className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-primary/80">Selected Folder</p>
            <p className="truncate text-sm font-bold text-foreground mt-0.5">
              {selectedFolderPath.split("\\").pop() || "Folder"}
            </p>
            <p className="truncate text-[11px] text-muted-foreground mt-0.5" title={selectedFolderPath}>
              {selectedFolderPath}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
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
          onClick={handleBrowse}
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
            // Resolve custom icon
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

            return (
              <div
                key={folder.id}
                className="group relative flex cursor-pointer items-center gap-3 rounded-xl border border-border/60 bg-card/60 p-3 transition-all duration-200 hover:border-primary/30 hover:bg-card hover:shadow-sm"
                onClick={() => onFolderSelect?.(folder.path, folder.color)}
              >
                {/* Icon wrapper */}
                <div
                  className="relative h-10 w-10 flex-shrink-0 rounded-lg shadow-sm flex items-center justify-center"
                  style={{ backgroundColor: folder.color + "22" }}
                >
                  {LucideIcon ? (
                    <LucideIcon
                      className="h-5 w-5"
                      style={{ color: folder.color }}
                    />
                  ) : (
                    <span className="text-xl select-none font-sans leading-none">{emojiChar}</span>
                  )}
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
              No customized folders yet
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

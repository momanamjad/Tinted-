import { FolderOpen, RotateCcw, Upload, X } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { ALL_ICONS } from "@/data/icons";
import { adjustBrightness } from "@/utils/colors";
import { cn } from "@/utils/cn";
import { Button } from "@/components/ui/button";

type SubdirType = {
  name: string;
  path: string;
  customization: {
    color: string;
    iconId: string;
    icoPath: string;
  } | null;
};

type FoldersTabProps = {
  parentPath: string;
  subdirs: SubdirType[];
  selectedFolderPath: string;
  onFolderSelect: (path: string, color: string) => void;
  onBrowseParent: () => void;
  onResetFolder: (path: string) => void;
  onDragDropFolder: (path: string) => void;
};

// Mini 3D macOS folder renderer for the grid cards
function MiniFolderIcon({ color, iconId }: { color?: string; iconId?: string }) {
  const isCustom = Boolean(color);
  const baseColor = color || "#e5a93b"; // standard macOS folder warm gold
  
  const backColor = adjustBrightness(baseColor, -12);
  const frontTopColor = adjustBrightness(baseColor, 12);
  const frontBottomColor = adjustBrightness(baseColor, -16);
  
  let SelectedIcon: any = null;
  let selectedEmoji: string | undefined = undefined;
  
  if (isCustom && iconId && iconId !== "folder") {
    const found = ALL_ICONS.find((i) => i.id === iconId);
    if (found) {
      if (found.lucideIcon) {
        SelectedIcon = (LucideIcons as any)[found.lucideIcon];
      } else if (found.emoji) {
        selectedEmoji = found.emoji;
      }
    }
  }

  const getIconOverlayColor = (hexStr: string): string => {
    const hex = hexStr.replace("#", "");
    const r = parseInt(hex.substring(0, 2), 16) || 0;
    const g = parseInt(hex.substring(2, 4), 16) || 0;
    const b = parseInt(hex.substring(4, 6), 16) || 0;
    const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
    return luminance > 180 ? "rgba(0, 0, 0, 0.4)" : "rgba(255, 255, 255, 0.7)";
  };

  const iconColor = getIconOverlayColor(baseColor);

  return (
    <div className="relative h-[62px] w-[80px] transition-transform duration-200 group-hover:scale-105 select-none">
      {/* Folder tab */}
      <div
        className="absolute left-0 top-0 h-[12px] w-[34px] rounded-t-[4px] transition-all"
        style={{ backgroundColor: backColor }}
      />
      {/* Folder back body */}
      <div
        className="absolute top-[7px] left-0 w-[80px] h-[55px] rounded-[6px] transition-all"
        style={{ backgroundColor: backColor }}
      />
      {/* Folder front body */}
      <div
        className="absolute top-[18px] left-0 w-[80px] h-[44px] rounded-[6px] shadow-[0_3px_6px_rgba(0,0,0,0.22)] transition-all border border-white/5 overflow-hidden"
        style={{
          background: `linear-gradient(to bottom, ${frontTopColor}, ${frontBottomColor})`
        }}
      >
        {/* Front flap top highlight */}
        <div className="absolute top-[0.5px] left-[1px] right-[1px] h-[1px] bg-white/35" />

        {/* Icon centred in front body */}
        <div className="flex h-full items-center justify-center pb-0.5">
          {SelectedIcon ? (
            <SelectedIcon
              className="h-[20px] w-[20px]"
              style={{ color: iconColor }}
              strokeWidth={3}
            />
          ) : selectedEmoji ? (
            <span className="text-lg select-none font-sans leading-none">{selectedEmoji}</span>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function FoldersTab({
  parentPath,
  subdirs,
  selectedFolderPath,
  onFolderSelect,
  onBrowseParent,
  onResetFolder,
  onDragDropFolder,
}: FoldersTabProps) {
  const isDragOver = false;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      let filePath = "";
      if (window.tintd?.getPathForFile) {
        filePath = window.tintd.getPathForFile(files[0]);
      } else {
        filePath = (files[0] as any).path || "";
      }
      if (filePath) onDragDropFolder(filePath);
    }
  };

  if (!parentPath) {
    // Empty state: Drag and drop or browse parent workspace
    return (
      <div
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={cn(
          "flex flex-col items-center justify-center h-full gap-5 border border-white/5 rounded-2xl p-10 text-center transition-all bg-[#141414]/30 hover:bg-[#141414]/50 border-dashed"
        )}
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/5 bg-[#1a1a1a]/60">
          <Upload className="h-6 w-6 text-muted-foreground" />
        </div>
        <div>
          <p className="text-[15px] font-semibold text-foreground">
            No Workspace Folder Selected
          </p>
          <p className="mt-1.5 text-xs text-muted-foreground max-w-[280px] mx-auto leading-relaxed">
            Drag & drop a parent directory here, or click below to browse and view all its subfolders.
          </p>
        </div>
        <Button
          id="folders-browse-btn"
          className="gap-2 bg-white hover:bg-white/90 text-black rounded-xl h-9 px-5 font-bold text-xs shadow-md"
          onClick={onBrowseParent}
        >
          <FolderOpen className="h-4 w-4 text-black" />
          Choose Workspace
        </Button>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col gap-4 overflow-auto pr-1">
      {/* ── Subfolder Grid ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 pb-6">
        {subdirs.map((subdir) => {
          const isSelected = selectedFolderPath === subdir.path;
          const isCustom = Boolean(subdir.customization);
          const folderColor = subdir.customization?.color;
          const iconId = subdir.customization?.iconId;

          return (
            <div
              key={subdir.path}
              onClick={() => onFolderSelect(subdir.path, folderColor || "#ffc55a")}
              className={cn(
                "group relative flex flex-col items-center gap-2.5 rounded-2xl p-3 border transition-all duration-200 cursor-pointer",
                isSelected
                  ? "bg-[#252525] border-white/10 shadow-[0_4px_12px_rgba(0,0,0,0.15)]"
                  : "bg-black/15 border-white/5 hover:bg-white/5 hover:border-white/10"
              )}
            >
              {/* Close/Reset circle button (only if customized) */}
              {isCustom && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onResetFolder(subdir.path);
                  }}
                  className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-[#333] hover:bg-[#ff3b30] text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-150 shadow-md"
                  title="Reset Folder Icon"
                >
                  <span className="text-[10px] leading-none font-black text-white/80">✕</span>
                </button>
              )}

              {/* Folder Icon preview */}
              <div className="h-[72px] flex items-center justify-center">
                <MiniFolderIcon color={folderColor} iconId={iconId} />
              </div>

              {/* Folder Name */}
              <p className="text-[11px] font-bold text-foreground text-center truncate w-full px-1">
                {subdir.name}
              </p>
            </div>
          );
        })}

        {subdirs.length === 0 && (
          <div className="col-span-full py-16 text-center text-muted-foreground text-xs font-semibold">
            No subfolders found inside this directory.
          </div>
        )}
      </div>
    </div>
  );
}

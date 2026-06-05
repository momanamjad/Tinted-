import { Folder } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { ALL_ICONS } from "@/data/icons";
import { cn } from "@/utils/cn";
import { adjustBrightness, getContrastColor } from "@/utils/colors";

type IconPreviewProps = {
  color: string;
  selectedIconId?: string;
  onIconSelect?: (iconId: string) => void;
  folderName?: string;
};

const QUICK_ICON_IDS = [
  "folder",
  "code",
  "terminal",
  "camera",
  "music",
  "palette",
  "briefcase",
  "trash",
  "download",
  "emoji-red-heart",
  "emoji-star",
  "emoji-rocket",
];

export function IconPreview({
  color,
  selectedIconId = "folder",
  onIconSelect,
  folderName = "My Folder",
}: IconPreviewProps) {
  let SelectedIcon: any = Folder;
  let selectedEmoji: string | undefined = undefined;

  if (selectedIconId !== "folder") {
    const found = ALL_ICONS.find((i) => i.id === selectedIconId);
    if (found) {
      if (found.lucideIcon) {
        SelectedIcon = (LucideIcons as any)[found.lucideIcon] || Folder;
      } else if (found.emoji) {
        SelectedIcon = null;
        selectedEmoji = found.emoji;
      }
    }
  }

  const backColor = adjustBrightness(color, -12);
  const frontTopColor = adjustBrightness(color, 12);
  const frontBottomColor = adjustBrightness(color, -16);

  const getIconOverlayColor = (hexStr: string): string => {
    const hex = hexStr.replace("#", "");
    const r = parseInt(hex.substring(0, 2), 16) || 0;
    const g = parseInt(hex.substring(2, 4), 16) || 0;
    const b = parseInt(hex.substring(4, 6), 16) || 0;
    const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
    return luminance > 180 ? "rgba(0, 0, 0, 0.45)" : "rgba(255, 255, 255, 0.75)";
  };

  const iconColor = getIconOverlayColor(color);

  return (
    <div className="space-y-4">
      {/* ── Large Folder Preview ── */}
      <div
        key={`${color}-${selectedIconId}`}
        className="preview-update flex flex-col items-center gap-4 rounded-2xl border border-border/40 bg-gradient-to-b from-secondary/15 to-background/40 px-4 py-7 transition-all duration-300 hover:border-primary/10 relative overflow-hidden"
      >
        {/* Ambient glow behind folder */}
        <div
          className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-36 h-10 rounded-full blur-2xl opacity-20 pointer-events-none"
          style={{ backgroundColor: color }}
        />

        {/* macOS Folder shape */}
        <div className="relative h-[152px] w-[192px] transition-transform duration-300 hover:scale-105">
          {/* Folder tab */}
          <div
            className="absolute left-0 top-0 h-[30px] w-[80px] rounded-t-[10px] shadow-sm transition-all"
            style={{ backgroundColor: backColor }}
          />
          {/* Folder back body */}
          <div
            className="absolute top-[16px] left-0 w-[192px] h-[136px] rounded-[14px] transition-all"
            style={{ backgroundColor: backColor }}
          />
          {/* Folder front body */}
          <div
            className="absolute top-[38px] left-0 w-[192px] h-[114px] rounded-[14px] shadow-[0_6px_16px_rgba(0,0,0,0.22)] transition-all border border-white/5 overflow-hidden"
            style={{
              background: `linear-gradient(to bottom, ${frontTopColor}, ${frontBottomColor})`
            }}
          >
            {/* Front flap top highlight (bevel reflection) */}
            <div className="absolute top-[1px] left-[2px] right-[2px] h-[2px] rounded-full bg-white/45" />

            {/* Icon centred in front body */}
            <div className="flex h-full items-center justify-center pb-1">
              {SelectedIcon ? (
                <SelectedIcon
                  className="h-[52px] w-[52px] transition-all"
                  style={{ color: iconColor }}
                  strokeWidth={3.5}
                />
              ) : (
                <span
                  className="text-5xl select-none font-sans leading-none"
                  style={{ color: iconColor }}
                >
                  {selectedEmoji}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Folder name + color */}
        <div className="text-center relative">
          <p className="text-[13px] font-semibold text-foreground leading-tight">{folderName}</p>
          <p className="mt-0.5 text-[10px] font-mono font-medium text-muted-foreground tracking-wider">
            {color.toUpperCase()}
          </p>
        </div>
      </div>

      {/* ── Quick Icon Picker ── */}
      <div>
        <p className="mb-2 text-[9px] font-bold uppercase tracking-[0.12em] text-muted-foreground/50">
          Quick Icons
        </p>
        <div className="grid grid-cols-6 gap-1">
          {QUICK_ICON_IDS.map((id) => {
            const isSelected = selectedIconId === id;
            let iconName = "Folder";
            let LucideComp: any = Folder;
            let emojiChar: string | undefined = undefined;

            if (id !== "folder") {
              const found = ALL_ICONS.find((i) => i.id === id);
              if (found) {
                iconName = found.name;
                if (found.lucideIcon) {
                  LucideComp = (LucideIcons as any)[found.lucideIcon] || Folder;
                } else if (found.emoji) {
                  LucideComp = null;
                  emojiChar = found.emoji;
                }
              }
            }

            return (
              <button
                key={id}
                id={`icon-preview-${id}`}
                title={iconName}
                onClick={() => onIconSelect?.(id)}
                className={cn(
                  "group flex flex-col items-center justify-center gap-1 rounded-xl p-1 transition-all duration-150 h-[52px] w-full border",
                  isSelected
                    ? "bg-primary/15 border-primary/40 text-primary shadow-sm animate-select-icon"
                    : "border-transparent text-muted-foreground hover:bg-secondary/70 hover:text-foreground hover:-translate-y-0.5 hover:border-border/40"
                )}
              >
                <div className="flex h-5 w-5 items-center justify-center">
                  {LucideComp ? (
                    <LucideComp className="h-4 w-4" />
                  ) : (
                    <span className="text-[15px] select-none font-sans leading-none">{emojiChar}</span>
                  )}
                </div>
                <span className="text-[7px] font-semibold leading-none truncate w-full text-center">
                  {iconName.length > 5 ? iconName.slice(0, 5) + "…" : iconName}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

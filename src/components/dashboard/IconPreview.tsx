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

  const darkColor = getContrastColor(color);
  const lightColor = adjustBrightness(color, 28);

  // Parse color to rgba for dynamic glow
  const glowStyle = { boxShadow: `0 12px 32px 0 ${color}55, 0 2px 8px 0 ${color}33` };

  return (
    <div className="space-y-4">
      {/* ── Large Folder Preview ── */}
      <div
        key={`${color}-${selectedIconId}`}
        className="preview-update flex flex-col items-center gap-4 rounded-2xl border border-border/40 bg-gradient-to-b from-secondary/30 to-background/60 px-4 py-7 transition-all duration-300 hover:border-primary/20 relative overflow-hidden"
      >
        {/* Ambient glow behind folder */}
        <div
          className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-28 h-10 rounded-full blur-2xl opacity-40 pointer-events-none"
          style={{ backgroundColor: color }}
        />

        {/* Folder shape */}
        <div className="relative h-28 w-36 drop-shadow-xl">
          {/* Folder tab */}
          <div
            className="absolute left-2 top-0 h-6 w-[58px] rounded-t-lg"
            style={{ backgroundColor: lightColor }}
          />
          {/* Folder body */}
          <div
            className="absolute bottom-0 left-0 right-0 top-4 rounded-b-2xl rounded-tr-2xl shadow-folder"
            style={{ backgroundColor: color }}
          >
            {/* Top shine */}
            <div className="absolute inset-x-3 top-2.5 h-[3px] rounded-full bg-white/25" />
            {/* Secondary shine */}
            <div className="absolute inset-x-6 top-6 h-px rounded-full bg-white/10" />

            {/* Icon centred in body */}
            <div className="flex h-full items-center justify-center">
              {SelectedIcon ? (
                <SelectedIcon
                  className="h-9 w-9 opacity-90 drop-shadow-sm"
                  style={{ color: darkColor }}
                />
              ) : (
                <span
                  className="text-4xl opacity-90 select-none font-sans leading-none drop-shadow-sm"
                  style={{ color: darkColor }}
                >
                  {selectedEmoji}
                </span>
              )}
            </div>
          </div>

          {/* Folder shadow */}
          <div
            className="absolute -bottom-3 left-5 right-5 h-4 rounded-full blur-lg opacity-45"
            style={{ backgroundColor: color }}
          />
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

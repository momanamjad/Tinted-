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
  "emoji-rocket"
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

  // Build folder color variants
  const darkColor = getContrastColor(color);
  const lightColor = adjustBrightness(color, 30);

  return (
    <div className="space-y-4">
      {/* Large folder preview */}
      <div 
        key={`${color}-${selectedIconId}`} 
        className="flex flex-col items-center gap-3 rounded-xl border border-border/50 bg-background/50 px-4 py-6 preview-update transition-all duration-300 hover:border-primary/20 hover:shadow-[0_0_15px_rgba(16,185,129,0.08)]"
      >
        {/* Folder shape SVG-like CSS */}
        <div className="relative h-28 w-36">
          {/* Tab top */}
          <div
            className="absolute left-2 top-0 h-7 w-16 rounded-t-lg"
            style={{ backgroundColor: lightColor }}
          />
          {/* Main body */}
          <div
            className="absolute bottom-0 left-0 right-0 top-5 rounded-b-2xl rounded-tr-2xl shadow-xl"
            style={{ backgroundColor: color }}
          >
            {/* Shine effect */}
            <div className="absolute inset-x-3 top-3 h-2 rounded-full bg-white/20" />
            {/* Icon inside folder */}
            <div className="flex h-full items-center justify-center">
              {SelectedIcon ? (
                <SelectedIcon
                  className="h-8 w-8 opacity-85"
                  style={{ color: darkColor }}
                />
              ) : (
                <span
                  className="text-3xl opacity-85 select-none font-sans leading-none"
                  style={{ color: darkColor }}
                >
                  {selectedEmoji}
                </span>
              )}
            </div>
          </div>
          {/* Shadow */}
          <div
            className="absolute -bottom-2 left-4 right-4 h-3 rounded-full blur-md opacity-50"
            style={{ backgroundColor: color }}
          />
        </div>
        <div className="text-center">
          <p className="text-[13px] font-semibold text-foreground">{folderName}</p>
          <p className="text-[11px] font-mono text-muted-foreground">{color.toUpperCase()}</p>
        </div>
      </div>

      {/* Quick Icon Picker Grid (12 icons) */}
      <div>
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
          Quick Icon
        </p>
        <div className="grid grid-cols-6 gap-1.5">
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
                  "flex flex-col items-center justify-center gap-1 rounded-lg p-1 transition-all duration-150 h-14 w-full hover:-translate-y-0.5",
                  isSelected
                    ? "bg-primary/15 text-primary ring-1 ring-primary/30 animate-select-icon"
                    : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                )}
              >
                <div className="flex h-4 w-4 items-center justify-center">
                  {LucideComp ? (
                    <LucideComp className="h-4 w-4" />
                  ) : (
                    <span className="text-base select-none font-sans leading-none">{emojiChar}</span>
                  )}
                </div>
                <span className="text-[8px] leading-none truncate w-full text-center mt-1">
                  {iconName}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}


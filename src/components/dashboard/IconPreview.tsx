import {
  Archive,
  Binary,
  BookOpen,
  Briefcase,
  Camera,
  Code2,
  Cpu,
  Database,
  Download,
  Film,
  Flame,
  Folder,
  Gamepad2,
  Globe,
  Heart,
  Home,
  Image,
  Mail,
  Music,
  Package,
  Palette,
  Shield,
  Star,
  Terminal,
  Trophy,
  Video,
  Wifi,
  Zap,
} from "lucide-react";
import { cn } from "@/utils/cn";

type IconEntry = {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
};

const PREVIEW_ICONS: IconEntry[] = [
  { id: "folder", name: "Folder", icon: Folder },
  { id: "code", name: "Code", icon: Code2 },
  { id: "terminal", name: "Terminal", icon: Terminal },
  { id: "database", name: "Database", icon: Database },
  { id: "cpu", name: "CPU", icon: Cpu },
  { id: "binary", name: "Binary", icon: Binary },
  { id: "music", name: "Music", icon: Music },
  { id: "camera", name: "Camera", icon: Camera },
  { id: "video", name: "Video", icon: Video },
  { id: "film", name: "Film", icon: Film },
  { id: "image", name: "Image", icon: Image },
  { id: "home", name: "Home", icon: Home },
  { id: "heart", name: "Heart", icon: Heart },
  { id: "star", name: "Star", icon: Star },
  { id: "briefcase", name: "Work", icon: Briefcase },
  { id: "globe", name: "Globe", icon: Globe },
  { id: "mail", name: "Mail", icon: Mail },
  { id: "download", name: "Download", icon: Download },
  { id: "archive", name: "Archive", icon: Archive },
  { id: "shield", name: "Shield", icon: Shield },
  { id: "flame", name: "Flame", icon: Flame },
  { id: "zap", name: "Zap", icon: Zap },
  { id: "gamepad", name: "Gaming", icon: Gamepad2 },
  { id: "trophy", name: "Trophy", icon: Trophy },
  { id: "palette", name: "Design", icon: Palette },
  { id: "book", name: "Books", icon: BookOpen },
  { id: "wifi", name: "Network", icon: Wifi },
  { id: "package", name: "Package", icon: Package },
];

type IconPreviewProps = {
  color: string;
  selectedIconId?: string;
  onIconSelect?: (iconId: string) => void;
  folderName?: string;
};

export function IconPreview({
  color,
  selectedIconId = "folder",
  onIconSelect,
  folderName = "My Folder",
}: IconPreviewProps) {
  const found = PREVIEW_ICONS.find((i) => i.id === selectedIconId);
  const SelectedIcon = found?.icon ?? Folder;

  // Build folder color variants
  const darkColor = adjustBrightness(color, -30);
  const lightColor = adjustBrightness(color, 30);

  return (
    <div className="space-y-4">
      {/* Large folder preview */}
      <div className="flex flex-col items-center gap-3 rounded-xl border border-border/50 bg-background/50 px-4 py-6">
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
              <SelectedIcon
                className="h-8 w-8 opacity-30"
                style={{ color: darkColor }}
              />
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
          {PREVIEW_ICONS.slice(0, 12).map(({ id, name, icon: Icon }) => {
            const isSelected = selectedIconId === id;
            return (
              <button
                key={id}
                id={`icon-preview-${id}`}
                title={name}
                onClick={() => onIconSelect?.(id)}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-lg p-2 transition-all duration-150",
                  isSelected
                    ? "bg-primary/15 text-primary ring-1 ring-primary/30"
                    : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="text-[9px] leading-none truncate w-full text-center">{name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/** Adjust hex color brightness by amount (-255 to +255) */
function adjustBrightness(hex: string, amount: number): string {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.min(255, Math.max(0, (num >> 16) + amount));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0xff) + amount));
  const b = Math.min(255, Math.max(0, (num & 0xff) + amount));
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
}

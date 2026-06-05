import { useState } from "react";
import {
  CheckCircle2,
  ChevronDown,
  ExternalLink,
  Loader2,
  RotateCcw,
  Search,
  Sparkles,
  Wand2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ColorPicker } from "@/components/dashboard/ColorPicker";
import { IconPreview } from "@/components/dashboard/IconPreview";
import { cn } from "@/utils/cn";

type RightPanelProps = {
  color: string;
  onColorChange: (color: string) => void;
  selectedIconId?: string;
  onIconSelect?: (id: string) => void;
  folderPath?: string;
  onApply?: () => void;
  onRemove?: () => void;
  busy?: boolean;
};

export function RightPanel({
  color,
  onColorChange,
  selectedIconId = "folder",
  onIconSelect,
  folderPath = "",
  onApply,
  onRemove,
  busy = false,
}: RightPanelProps) {
  const [iconSearch, setIconSearch] = useState("");
  const [colorSectionOpen, setColorSectionOpen] = useState(true);
  const [iconSectionOpen, setIconSectionOpen] = useState(true);

  const folderName = folderPath
    ? folderPath.split("\\").pop() || "Folder"
    : "No folder selected";

  const canApply = Boolean(folderPath.trim());

  return (
    <aside className="flex w-[300px] flex-shrink-0 flex-col gap-0 border-l border-border bg-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-border/60 px-4 py-4">
        <Sparkles className="h-4 w-4 text-primary" />
        <span className="text-sm font-semibold text-foreground">Customize</span>
      </div>

      <div className="flex flex-1 flex-col gap-0 overflow-auto">
        {/* Preview Section */}
        <div className="px-4 py-4">
          <IconPreview
            color={color}
            selectedIconId={selectedIconId}
            onIconSelect={onIconSelect}
            folderName={folderName}
          />
        </div>

        <Separator className="opacity-40" />

        {/* Color Picker Section */}
        <div>
          <button
            id="right-panel-color-toggle"
            onClick={() => setColorSectionOpen((v) => !v)}
            className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-secondary/30"
          >
            <div className="flex items-center gap-2">
              <div
                className="h-4 w-4 rounded-full border border-white/20 shadow-sm"
                style={{ backgroundColor: color }}
              />
              <span className="text-[12px] font-semibold uppercase tracking-wider text-muted-foreground">
                Color
              </span>
            </div>
            <ChevronDown
              className={cn(
                "h-3.5 w-3.5 text-muted-foreground transition-transform duration-200",
                colorSectionOpen && "rotate-180"
              )}
            />
          </button>
          {colorSectionOpen && (
            <div className="px-4 pb-4">
              <ColorPicker color={color} onChange={onColorChange} />
            </div>
          )}
        </div>

        <Separator className="opacity-40" />

        {/* Icon Search Section */}
        <div>
          <button
            id="right-panel-icon-toggle"
            onClick={() => setIconSectionOpen((v) => !v)}
            className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-secondary/30"
          >
            <div className="flex items-center gap-2">
              <Wand2 className="h-3.5 w-3.5 text-primary" />
              <span className="text-[12px] font-semibold uppercase tracking-wider text-muted-foreground">
                Icon Search
              </span>
            </div>
            <ChevronDown
              className={cn(
                "h-3.5 w-3.5 text-muted-foreground transition-transform duration-200",
                iconSectionOpen && "rotate-180"
              )}
            />
          </button>
          {iconSectionOpen && (
            <div className="px-4 pb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="right-panel-icon-search"
                  value={iconSearch}
                  onChange={(e) => setIconSearch(e.target.value)}
                  placeholder="Search icons..."
                  className="pl-9 text-sm h-9"
                />
              </div>
            </div>
          )}
        </div>

        <Separator className="opacity-40" />

        {/* Status bar */}
        {folderPath && (
          <div className="border-b border-border/40 bg-secondary/20 px-4 py-2.5">
            <div className="flex items-center gap-2">
              <ExternalLink className="h-3 w-3 flex-shrink-0 text-muted-foreground" />
              <p className="truncate text-[11px] text-muted-foreground" title={folderPath}>
                {folderPath}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="border-t border-border/60 bg-card p-4 space-y-2.5">
        <Button
          id="right-panel-apply-btn"
          className="w-full gap-2 font-semibold"
          disabled={!canApply || busy}
          onClick={onApply}
        >
          {busy ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <CheckCircle2 className="h-4 w-4" />
          )}
          {busy ? "Applying..." : "Apply Icon"}
        </Button>
        <Button
          id="right-panel-remove-btn"
          variant="outline"
          className="w-full gap-2"
          disabled={!canApply || busy}
          onClick={onRemove}
        >
          <RotateCcw className="h-4 w-4" />
          Remove Icon
        </Button>
      </div>
    </aside>
  );
}

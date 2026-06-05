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
import * as LucideIcons from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ColorPicker } from "@/components/dashboard/ColorPicker";
import { IconPreview } from "@/components/dashboard/IconPreview";
import { cn } from "@/utils/cn";
import { ALL_ICONS } from "@/data/icons";

type RightPanelProps = {
  color: string;
  onColorChange: (color: string) => void;
  selectedIconId?: string;
  onIconSelect?: (id: string) => void;
  folderPath?: string;
  onApply?: () => void;
  onRemove?: () => void;
  busy?: boolean;
  suggestion?: {
    iconId: string;
    iconName: string;
    color: string;
    reason: string;
    confidence: number;
  } | null;
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
  suggestion = null,
}: RightPanelProps) {
  const [iconSearch, setIconSearch] = useState("");
  const [colorSectionOpen, setColorSectionOpen] = useState(true);
  const [iconSectionOpen, setIconSectionOpen] = useState(true);

  const folderName = folderPath
    ? folderPath.split("\\").pop() || "Folder"
    : "No folder selected";

  const canApply = Boolean(folderPath.trim());

  // Filter matching icons for the side search box
  const matchingIcons = ALL_ICONS.filter((icon) => {
    const q = iconSearch.toLowerCase().trim();
    return (
      q &&
      (icon.name.toLowerCase().includes(q) ||
        icon.keywords.some((kw) => kw.includes(q)) ||
        icon.id.includes(q))
    );
  });

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
            <div className="px-4 pb-4 space-y-3">
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

              {/* Show matching icons */}
              {iconSearch.trim() && (
                <div className="grid grid-cols-4 gap-1 rounded-lg border border-border/60 bg-background/30 p-1.5 max-h-[160px] overflow-y-auto">
                  {matchingIcons.slice(0, 12).map((icon) => {
                    const isSelected = selectedIconId === icon.id;
                    let LucideComp: any = null;
                    if (icon.lucideIcon) {
                      LucideComp = (LucideIcons as any)[icon.lucideIcon] || LucideIcons.HelpCircle;
                    }
                    return (
                      <button
                        key={icon.id}
                        onClick={() => onIconSelect?.(icon.id)}
                        title={icon.name}
                        className={cn(
                          "flex items-center justify-center rounded p-1 transition-all h-8",
                          isSelected
                            ? "bg-primary/20 text-primary"
                            : "text-muted-foreground hover:bg-secondary/80 hover:text-foreground"
                        )}
                      >
                        {LucideComp ? (
                          <LucideComp className="h-4 w-4" />
                        ) : (
                          <span className="text-base select-none font-sans leading-none">{icon.emoji}</span>
                        )}
                      </button>
                    );
                  })}
                  {matchingIcons.length === 0 && (
                    <p className="col-span-4 py-2 text-center text-[10px] text-muted-foreground">
                      No matching icons
                    </p>
                  )}
                </div>
              )}
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
      <div className="border-t border-border/60 bg-card p-4 space-y-3">
        {suggestion && (
          <div className="rounded-xl border border-primary/20 bg-primary/5 glass pulse-glow p-3.5 space-y-1.5 animate-in fade-in slide-in-from-bottom-2 duration-200 shadow-[0_0_15px_rgba(16,185,129,0.06)]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                <Sparkles className="h-3.5 w-3.5 animate-pulse text-emerald-400" />
                <span>AI Suggestion</span>
              </div>
              <span className="text-[10px] font-semibold bg-primary/15 text-primary px-1.5 py-0.5 rounded-full">
                {suggestion.confidence}% Match
              </span>
            </div>
            <div>
              <p className="text-xs font-bold text-foreground">
                Suggesting {suggestion.iconName} with {suggestion.color.toUpperCase()}
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5 leading-snug">
                {suggestion.reason}
              </p>
            </div>
          </div>
        )}
        <Button
          id="right-panel-apply-btn"
          className="w-full gap-2 font-semibold btn-interactive"
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
          className="w-full gap-2 btn-interactive"
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

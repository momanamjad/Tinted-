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
    <aside className="flex w-[290px] flex-shrink-0 flex-col border-l border-border/70 bg-card overflow-hidden relative">
      {/* Top edge accent */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent pointer-events-none" />

      {/* ── Header ── */}
      <div className="flex items-center gap-2.5 border-b border-border/60 px-4 py-3.5">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
        </div>
        <div>
          <span className="text-[13px] font-bold text-foreground tracking-tight">Customize</span>
          {folderPath && (
            <p className="text-[9px] text-muted-foreground font-medium truncate max-w-[180px]" title={folderPath}>
              {folderName}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col overflow-auto">
        {/* ── Folder Preview ── */}
        <div className="px-4 py-4">
          <IconPreview
            color={color}
            selectedIconId={selectedIconId}
            onIconSelect={onIconSelect}
            folderName={folderName}
          />
        </div>

        {/* Divider */}
        <div className="mx-4 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

        {/* ── Color Section ── */}
        <div>
          <button
            id="right-panel-color-toggle"
            onClick={() => setColorSectionOpen((v) => !v)}
            className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-secondary/30 outline-none"
          >
            <div className="flex items-center gap-2">
              <div
                className="h-3.5 w-3.5 rounded-full border border-white/20 shadow-sm flex-shrink-0"
                style={{ backgroundColor: color }}
              />
              <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground/70">
                Color
              </span>
            </div>
            <ChevronDown
              className={cn(
                "h-3.5 w-3.5 text-muted-foreground/60 transition-transform duration-200",
                colorSectionOpen && "rotate-180"
              )}
            />
          </button>
          {colorSectionOpen && (
            <div className="px-4 pb-5 float-in">
              <ColorPicker color={color} onChange={onColorChange} />
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="mx-4 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

        {/* ── Icon Search Section ── */}
        <div>
          <button
            id="right-panel-icon-toggle"
            onClick={() => setIconSectionOpen((v) => !v)}
            className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-secondary/30 outline-none"
          >
            <div className="flex items-center gap-2">
              <Wand2 className="h-3.5 w-3.5 text-primary/70 flex-shrink-0" />
              <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground/70">
                Icon Search
              </span>
            </div>
            <ChevronDown
              className={cn(
                "h-3.5 w-3.5 text-muted-foreground/60 transition-transform duration-200",
                iconSectionOpen && "rotate-180"
              )}
            />
          </button>
          {iconSectionOpen && (
            <div className="px-4 pb-5 space-y-3 float-in">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground/60" />
                <Input
                  id="right-panel-icon-search"
                  value={iconSearch}
                  onChange={(e) => setIconSearch(e.target.value)}
                  placeholder="Search icons..."
                  className="pl-9 text-sm h-9 bg-background/60"
                />
              </div>

              {iconSearch.trim() && (
                <div className="grid grid-cols-4 gap-1 rounded-xl border border-border/50 bg-background/40 p-1.5 max-h-[152px] overflow-y-auto">
                  {matchingIcons.slice(0, 16).map((icon) => {
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
                          "flex items-center justify-center rounded-lg p-1.5 transition-all h-9",
                          isSelected
                            ? "bg-primary/20 text-primary ring-1 ring-primary/30"
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
                    <p className="col-span-4 py-3 text-center text-[10px] text-muted-foreground">
                      No matching icons
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="mx-4 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

        {/* Folder path status */}
        {folderPath && (
          <div className="bg-secondary/20 px-4 py-2.5 border-b border-border/30">
            <div className="flex items-center gap-2">
              <ExternalLink className="h-3 w-3 flex-shrink-0 text-muted-foreground/50" />
              <p className="truncate text-[10px] text-muted-foreground/70 font-mono" title={folderPath}>
                {folderPath}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ── Action Buttons ── */}
      <div className="border-t border-border/60 bg-card/80 p-4 space-y-2.5">
        {/* AI Suggestion card */}
        {suggestion && (
          <div className="rounded-xl border border-primary/25 bg-primary/6 p-3 space-y-1.5 float-in pulse-glow shadow-[0_0_18px_rgba(16,185,129,0.08)]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Sparkles className="h-3 w-3 text-primary animate-pulse" />
                <span className="text-[9px] font-bold uppercase tracking-[0.14em] text-primary">
                  AI Suggestion
                </span>
              </div>
              <span className="text-[9px] font-bold bg-primary/15 text-primary px-1.5 py-0.5 rounded-full">
                {suggestion.confidence}%
              </span>
            </div>
            <p className="text-[11px] font-semibold text-foreground leading-tight">
              {suggestion.iconName} · {suggestion.color.toUpperCase()}
            </p>
            <p className="text-[10px] text-muted-foreground leading-snug">
              {suggestion.reason}
            </p>
          </div>
        )}

        {/* Apply button */}
        <Button
          id="right-panel-apply-btn"
          className="w-full gap-2 font-semibold btn-interactive btn-primary-glow h-10 rounded-xl text-[13px]"
          disabled={!canApply || busy}
          onClick={onApply}
        >
          {busy ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <CheckCircle2 className="h-4 w-4" />
          )}
          {busy ? "Applying…" : "Apply Icon"}
        </Button>

        {/* Remove button */}
        <Button
          id="right-panel-remove-btn"
          variant="outline"
          className="w-full gap-2 btn-interactive h-9 rounded-xl text-[12px] border-border/60 hover:border-destructive/40 hover:text-destructive"
          disabled={!canApply || busy}
          onClick={onRemove}
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset to Default
        </Button>
      </div>
    </aside>
  );
}

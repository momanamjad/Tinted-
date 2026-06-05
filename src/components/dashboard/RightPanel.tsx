import { useState } from "react";
import {
  CheckCircle2,
  Download,
  FolderOpen,
  Info,
  Loader2,
  Palette,
  RotateCcw,
  Search,
  Sparkles,
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

type TabType = "color" | "icon" | "details";

const CATEGORIES = ["All", "Folders & Files", "Development", "Media", "Design", "Business", "Utilities"];

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
  const [activeTab, setActiveTab] = useState<TabType>("color");
  const [iconSearch, setIconSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const folderName = folderPath
    ? folderPath.split("\\").pop() || "Folder"
    : "No folder selected";

  const canApply = Boolean(folderPath.trim());

  // Filter icons for Icon Tab
  const filteredIcons = ALL_ICONS.filter((icon) => {
    const q = iconSearch.toLowerCase().trim();
    const matchesSearch =
      !q ||
      icon.name.toLowerCase().includes(q) ||
      icon.keywords.some((kw) => kw.includes(q)) ||
      icon.id.includes(q);

    const matchesCategory =
      selectedCategory === "All" || icon.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <aside className="flex w-[300px] flex-shrink-0 flex-col border-l border-border/40 bg-[#1a1a1a] text-foreground overflow-hidden relative">
      {/* Top subtle highlight border */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />

      {/* ── Folder Preview (Always Visible at Top) ── */}
      <div className="px-4 pt-5 pb-4">
        <IconPreview
          color={color}
          selectedIconId={selectedIconId}
          onIconSelect={onIconSelect}
          folderName={folderName}
        />
      </div>

      {/* ── Tab Bar Navigation (macOS Pill style) ── */}
      <div className="px-4 pb-2">
        <div className="flex rounded-lg bg-[#111] p-0.5 border border-white/5">
          {(["color", "icon", "details"] as TabType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "flex-1 rounded-md py-1.5 text-[11px] font-bold uppercase tracking-wider transition-all duration-150",
                activeTab === tab
                  ? "bg-[#2d2c2c] text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* ── Scrollable Tab Contents ── */}
      <div className="flex-1 overflow-auto px-4 py-3">
        {/* 1. COLOR TAB */}
        {activeTab === "color" && (
          <div className="space-y-4 tab-transition">
            <ColorPicker color={color} onChange={onColorChange} />

            <div className="rounded-xl border border-white/5 bg-[#141414] p-3 text-center space-y-1">
              <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">
                License Usage
              </span>
              <p className="text-[11px] font-semibold text-foreground">
                10 free uses remaining
              </p>
            </div>
          </div>
        )}

        {/* 2. ICON TAB */}
        {activeTab === "icon" && (
          <div className="space-y-3.5 tab-transition flex flex-col h-full overflow-hidden">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground/60" />
              <Input
                value={iconSearch}
                onChange={(e) => setIconSearch(e.target.value)}
                placeholder="Search icons..."
                className="pl-9 text-xs h-9 bg-black/40 border-white/5 text-foreground rounded-lg"
              />
            </div>

            {/* Category selection scroll */}
            <div className="flex gap-1 overflow-x-auto pb-1.5 scrollbar-none scroll-smooth">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={cn(
                    "rounded-full px-2.5 py-1 text-[9px] font-bold uppercase tracking-wide whitespace-nowrap transition-colors",
                    selectedCategory === cat
                      ? "bg-[#2d2c2c] text-white"
                      : "bg-[#111]/40 text-muted-foreground hover:bg-[#111]/70 hover:text-foreground"
                  )}
                >
                  {cat === "Folders & Files" ? "Folders" : cat}
                </button>
              ))}
            </div>

            {/* Scrollable Icon Grid */}
            <div className="flex-1 overflow-y-auto min-h-[200px] border border-white/5 bg-[#141414]/60 rounded-xl p-2">
              <div className="grid grid-cols-4 gap-1.5">
                {filteredIcons.map((icon) => {
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
                        "flex items-center justify-center rounded-lg p-2 transition-all h-[42px] border border-transparent",
                        isSelected
                          ? "bg-primary/15 text-primary border-primary/25 shadow-sm"
                          : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                      )}
                    >
                      {LucideComp ? (
                        <LucideComp className="h-4 w-4" />
                      ) : (
                        <span className="text-lg select-none font-sans leading-none">{icon.emoji}</span>
                      )}
                    </button>
                  );
                })}
                {filteredIcons.length === 0 && (
                  <p className="col-span-4 py-6 text-center text-[10px] text-muted-foreground">
                    No matching icons
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 3. DETAILS TAB */}
        {activeTab === "details" && (
          <div className="space-y-4 tab-transition">
            <div className="rounded-xl border border-white/5 bg-[#141414] p-3.5 space-y-3.5">
              <div className="flex items-start gap-2.5">
                <FolderOpen className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <div className="min-w-0">
                  <span className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-widest">
                    Folder Name
                  </span>
                  <p className="text-[13px] font-bold text-foreground truncate">
                    {folderName}
                  </p>
                </div>
              </div>

              {folderPath && (
                <div className="space-y-2">
                  <div className="flex items-start gap-2.5">
                    <Info className="h-4 w-4 text-muted-foreground/50 mt-0.5 flex-shrink-0" />
                    <div className="min-w-0">
                      <span className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-widest">
                        Directory Path
                      </span>
                      <p className="text-[10px] font-mono text-muted-foreground truncate" title={folderPath}>
                        {folderPath}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-1.5 border-t border-white/5 text-[11px]">
                    <span className="text-muted-foreground/70">Type</span>
                    <span className="font-semibold text-foreground">File Folder</span>
                  </div>
                </div>
              )}
            </div>

            <Button
              variant="outline"
              className="w-full gap-2 border-white/5 bg-black/20 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20 h-9 rounded-xl text-xs font-semibold"
              disabled={!canApply || busy}
              onClick={onRemove}
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset Icon to Default
            </Button>
          </div>
        )}
      </div>

      {/* ── AI Suggestion Card (Optional Overlay) ── */}
      {suggestion && activeTab === "color" && (
        <div className="mx-4 mb-2.5 rounded-xl border border-primary/25 bg-primary/5 p-3 space-y-1.5 pulse-glow">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Sparkles className="h-3 w-3 text-primary animate-pulse" />
              <span className="text-[8px] font-black uppercase tracking-[0.15em] text-primary">
                AI Suggestion
              </span>
            </div>
            <span className="text-[8px] font-black bg-primary/15 text-primary px-1.5 py-0.5 rounded-full">
              {suggestion.confidence}% Match
            </span>
          </div>
          <p className="text-[11px] font-bold text-foreground leading-tight">
            {suggestion.iconName} · {suggestion.color.toUpperCase()}
          </p>
          <p className="text-[10px] text-muted-foreground/90 leading-snug">
            {suggestion.reason}
          </p>
        </div>
      )}

      {/* ── Footer Actions (Change Icon / Download) ── */}
      <div className="border-t border-white/5 bg-[#141414]/90 p-4 flex gap-2 flex-shrink-0">
        {/* Export / Download button */}
        <Button
          title="Export Icon"
          variant="outline"
          className="aspect-square h-10 w-10 p-0 border-white/5 bg-[#2d2c2c]/80 hover:bg-[#2d2c2c] hover:text-white rounded-xl flex items-center justify-center flex-shrink-0"
          disabled={!canApply || busy}
          onClick={onApply} // Apply compiles & registers
        >
          <Download className="h-4 w-4 text-white" />
        </Button>

        {/* Apply Primary Button */}
        <Button
          id="right-panel-apply-btn"
          className="flex-1 gap-2 font-bold text-black bg-white hover:bg-white/90 active:scale-95 transition-all h-10 rounded-xl text-[12px]"
          disabled={!canApply || busy}
          onClick={onApply}
        >
          {busy ? (
            <Loader2 className="h-4 w-4 animate-spin text-black" />
          ) : (
            <CheckCircle2 className="h-4 w-4 text-black" />
          )}
          {busy ? "Applying…" : "Change icon"}
        </Button>
      </div>
    </aside>
  );
}

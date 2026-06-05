import { useState } from "react";
import * as LucideIcons from "lucide-react";
import { Search, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/utils/cn";
import { ALL_ICONS } from "@/data/icons";

const CATEGORIES = ["All", "Folders & Files", "Development", "Media", "Design", "Business", "Utilities"];

type LibraryTabProps = {
  onIconSelect?: (iconId: string) => void;
  selectedIcon?: string;
};

export function LibraryTab({ onIconSelect, selectedIcon }: LibraryTabProps) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [catDropOpen, setCatDropOpen] = useState(false);

  const filtered = ALL_ICONS.filter((icon) => {
    const searchLower = search.toLowerCase().trim();
    const matchesSearch =
      !searchLower ||
      icon.name.toLowerCase().includes(searchLower) ||
      icon.keywords.some((kw) => kw.includes(searchLower)) ||
      icon.id.includes(searchLower);

    const matchesCat = category === "All" || icon.category === category;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="flex h-full flex-col gap-4 overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="library-search"
            placeholder="Search icons..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 text-sm"
          />
        </div>
        {/* Category Dropdown */}
        <div className="relative">
          <Button
            id="library-category-filter"
            variant="outline"
            size="sm"
            className="gap-2 text-sm"
            onClick={() => setCatDropOpen((v) => !v)}
          >
            {category}
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          </Button>
          {catDropOpen && (
            <div className="absolute right-0 top-9 z-50 w-44 max-h-60 overflow-y-auto rounded-lg border border-border bg-popover shadow-xl">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  className={cn(
                    "flex w-full items-center justify-between px-3 py-2 text-sm transition-colors hover:bg-secondary/60",
                    category === cat ? "text-primary font-medium" : "text-foreground"
                  )}
                  onClick={() => {
                    setCategory(cat);
                    setCatDropOpen(false);
                  }}
                >
                  {cat}
                  {category === cat && (
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Category pills */}
      <div className="flex flex-wrap gap-1.5">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={cn(
              "rounded-full px-3 py-1 text-[11px] font-medium transition-all duration-200",
              category === cat
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-secondary/60 text-muted-foreground hover:bg-secondary hover:text-foreground"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Results info */}
      <div className="flex items-center justify-between">
        <p className="text-[12px] text-muted-foreground">
          {filtered.length} icon{filtered.length !== 1 ? "s" : ""} found
        </p>
        {search && (
          <button
            className="text-[11px] text-primary hover:underline"
            onClick={() => setSearch("")}
          >
            Clear
          </button>
        )}
      </div>

      {/* Icon Grid */}
      <div className="flex-1 overflow-auto">
        {filtered.length > 0 ? (
          <div className="grid grid-cols-6 gap-2 pr-1">
            {filtered.map((icon) => {
              const isSelected = selectedIcon === icon.id;
              
              // Resolve Lucide Component if applicable
              let LucideComp: any = null;
              if (icon.lucideIcon) {
                LucideComp = (LucideIcons as any)[icon.lucideIcon] || LucideIcons.HelpCircle;
              }

              return (
                <button
                  key={icon.id}
                  id={`library-icon-${icon.id}`}
                  title={`${icon.name} (${icon.category})`}
                  onClick={() => onIconSelect?.(icon.id)}
                  className={cn(
                    "group flex flex-col items-center gap-1.5 rounded-xl border p-3 text-center transition-all duration-200",
                    isSelected
                      ? "border-primary bg-primary/10 text-primary shadow-sm"
                      : "border-border/50 bg-card/40 text-muted-foreground hover:border-primary/30 hover:bg-card hover:text-foreground hover:shadow-sm"
                  )}
                >
                  <div className="flex h-5 w-5 items-center justify-center transition-transform duration-200 group-hover:scale-110">
                    {LucideComp ? (
                      <LucideComp
                        className={cn(
                          "h-5 w-5",
                          isSelected && "text-primary"
                        )}
                      />
                    ) : (
                      <span className="text-xl select-none font-sans leading-none">{icon.emoji}</span>
                    )}
                  </div>
                  <span className="truncate text-[10px] font-medium leading-none w-full">{icon.name}</span>
                  <Badge
                    variant="secondary"
                    className="hidden h-4 px-1 text-[9px] group-hover:flex"
                  >
                    {icon.category}
                  </Badge>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="flex h-48 flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border/50">
            <Search className="h-8 w-8 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">No icons match &quot;{search}&quot;</p>
            <Button variant="ghost" size="sm" onClick={() => { setSearch(""); setCategory("All"); }}>
              Reset filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

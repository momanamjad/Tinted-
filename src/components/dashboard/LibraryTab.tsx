import { useState } from "react";
import {
  Archive,
  Binary,
  BookOpen,
  Briefcase,
  Camera,
  ChevronDown,
  Code2,
  Cpu,
  Database,
  Download,
  Film,
  Flame,
  Gamepad2,
  Globe,
  Heart,
  Home,
  Image,
  Mail,
  Map,
  Music,
  Package,
  Palette,
  Search,
  Shield,
  ShoppingCart,
  Star,
  Terminal,
  Trash,
  Trophy,
  Tv,
  Users,
  Video,
  Wifi,
  Zap,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/utils/cn";

type LibraryIcon = {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  category: string;
};

const ALL_ICONS: LibraryIcon[] = [
  { id: "code", name: "Code", icon: Code2, category: "Dev" },
  { id: "terminal", name: "Terminal", icon: Terminal, category: "Dev" },
  { id: "database", name: "Database", icon: Database, category: "Dev" },
  { id: "binary", name: "Binary", icon: Binary, category: "Dev" },
  { id: "cpu", name: "CPU", icon: Cpu, category: "Dev" },
  { id: "package", name: "Package", icon: Package, category: "Dev" },
  { id: "music", name: "Music", icon: Music, category: "Media" },
  { id: "camera", name: "Camera", icon: Camera, category: "Media" },
  { id: "video", name: "Video", icon: Video, category: "Media" },
  { id: "film", name: "Film", icon: Film, category: "Media" },
  { id: "image", name: "Image", icon: Image, category: "Media" },
  { id: "tv", name: "TV", icon: Tv, category: "Media" },
  { id: "home", name: "Home", icon: Home, category: "Personal" },
  { id: "heart", name: "Heart", icon: Heart, category: "Personal" },
  { id: "star", name: "Star", icon: Star, category: "Personal" },
  { id: "users", name: "Users", icon: Users, category: "Personal" },
  { id: "briefcase", name: "Work", icon: Briefcase, category: "Work" },
  { id: "mail", name: "Mail", icon: Mail, category: "Work" },
  { id: "globe", name: "Globe", icon: Globe, category: "Work" },
  { id: "map", name: "Map", icon: Map, category: "Work" },
  { id: "download", name: "Downloads", icon: Download, category: "System" },
  { id: "archive", name: "Archive", icon: Archive, category: "System" },
  { id: "trash", name: "Trash", icon: Trash, category: "System" },
  { id: "shield", name: "Shield", icon: Shield, category: "System" },
  { id: "flame", name: "Flame", icon: Flame, category: "Fun" },
  { id: "zap", name: "Zap", icon: Zap, category: "Fun" },
  { id: "gamepad", name: "Gaming", icon: Gamepad2, category: "Fun" },
  { id: "trophy", name: "Trophy", icon: Trophy, category: "Fun" },
  { id: "palette", name: "Design", icon: Palette, category: "Art" },
  { id: "book", name: "Books", icon: BookOpen, category: "Art" },
  { id: "wifi", name: "Network", icon: Wifi, category: "System" },
  { id: "shop", name: "Shop", icon: ShoppingCart, category: "Fun" },
];

const CATEGORIES = ["All", "Dev", "Media", "Personal", "Work", "System", "Fun", "Art"];

type LibraryTabProps = {
  onIconSelect?: (iconName: string) => void;
  selectedIcon?: string;
};

export function LibraryTab({ onIconSelect, selectedIcon }: LibraryTabProps) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [catDropOpen, setCatDropOpen] = useState(false);

  const filtered = ALL_ICONS.filter((icon) => {
    const matchesSearch = icon.name.toLowerCase().includes(search.toLowerCase());
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
            <div className="absolute right-0 top-9 z-50 w-36 overflow-hidden rounded-lg border border-border bg-popover shadow-xl">
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
          <div className="grid grid-cols-6 gap-2">
            {filtered.map(({ id, name, icon: Icon, category: cat }) => {
              const isSelected = selectedIcon === id;
              return (
                <button
                  key={id}
                  id={`library-icon-${id}`}
                  title={name}
                  onClick={() => onIconSelect?.(id)}
                  className={cn(
                    "group flex flex-col items-center gap-1.5 rounded-xl border p-3 text-center transition-all duration-200",
                    isSelected
                      ? "border-primary bg-primary/10 text-primary shadow-sm"
                      : "border-border/50 bg-card/40 text-muted-foreground hover:border-primary/30 hover:bg-card hover:text-foreground hover:shadow-sm"
                  )}
                >
                  <Icon
                    className={cn(
                      "h-5 w-5 transition-transform duration-200 group-hover:scale-110",
                      isSelected && "text-primary"
                    )}
                  />
                  <span className="truncate text-[10px] font-medium leading-none">{name}</span>
                  <Badge
                    variant="secondary"
                    className="hidden h-4 px-1 text-[9px] group-hover:flex"
                  >
                    {cat}
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

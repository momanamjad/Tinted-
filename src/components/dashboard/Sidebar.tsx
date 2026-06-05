import {
  Clock,
  FolderOpen,
  Grid3x3,
  Info,
  LayoutGrid,
  Settings,
  Palette,
} from "lucide-react";
import logo from "@/assets/logo.svg";
import { cn } from "@/utils/cn";
import { Button } from "@/components/ui/button";

export type ActiveTab = "folders" | "library" | "recent" | "settings";

type SidebarProps = {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  collapsed?: boolean;
};

const NAV_ITEMS: {
  id: ActiveTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}[] = [
  { id: "folders", label: "Folders", icon: FolderOpen, description: "Manage folders" },
  { id: "library", label: "Library", icon: LayoutGrid, description: "Icon library" },
  { id: "recent", label: "Recent", icon: Clock, description: "Recent activity" },
  { id: "settings", label: "Settings", icon: Settings, description: "Preferences" },
];

export function Sidebar({ activeTab, onTabChange, collapsed = false }: SidebarProps) {
  return (
    <aside
      className={cn(
        "relative flex flex-col border-r border-border/70 bg-card transition-all duration-300 ease-in-out overflow-hidden",
        collapsed ? "w-[60px]" : "w-[220px]"
      )}
    >
      {/* Subtle top gradient accent */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

      {/* Header / Logo */}
      <div
        className={cn(
          "flex items-center gap-3 px-4 py-5",
          collapsed && "justify-center px-2"
        )}
      >
        <div className="relative flex-shrink-0">
          {/* Glow halo */}
          <div className="absolute -inset-1.5 rounded-xl bg-primary/20 blur-md opacity-70" />
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 shadow-sm">
            <Palette className="h-5 w-5 text-primary" />
          </div>
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <h1 className="truncate text-[15px] font-bold tracking-tight text-foreground">
              Tintd Pro
            </h1>
            <p className="text-[10px] font-medium text-muted-foreground/70 tracking-wide">
              Windows Edition
            </p>
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="mx-3 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      {/* Navigation */}
      <nav className={cn("flex-1 space-y-0.5 px-2 py-4", collapsed && "px-1.5")}>
        {!collapsed && (
          <p className="mb-2 px-2 text-[9px] font-bold uppercase tracking-[0.14em] text-muted-foreground/40">
            Navigation
          </p>
        )}
        {NAV_ITEMS.map(({ id, label, icon: Icon, description }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              id={`sidebar-tab-${id}`}
              onClick={() => onTabChange(id)}
              title={collapsed ? label : undefined}
              className={cn(
                "group relative flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 outline-none",
                collapsed ? "justify-center px-2" : "",
                isActive
                  ? "sidebar-active-glow text-primary shadow-sm"
                  : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
              )}
            >
              {/* Active indicator bar */}
              {isActive && (
                <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-primary shadow-[0_0_8px_2px_hsl(var(--primary)/0.4)]" />
              )}

              <Icon
                className={cn(
                  "h-4 w-4 flex-shrink-0 transition-all duration-200",
                  isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground group-hover:scale-110"
                )}
              />

              {!collapsed && (
                <span className="truncate text-[13px]">{label}</span>
              )}

              {/* Tooltip for collapsed state */}
              {collapsed && (
                <div className="pointer-events-none absolute left-full ml-3 z-50 w-max rounded-lg border border-border bg-popover px-2.5 py-1.5 text-xs font-medium text-foreground shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                  {label}
                  <p className="text-[10px] text-muted-foreground font-normal">{description}</p>
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Divider */}
      <div className="mx-3 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      {/* Footer */}
      <div className={cn("px-3 py-4", collapsed && "flex flex-col items-center px-1.5")}>
        {!collapsed ? (
          <div className="space-y-1">
            <div className="flex items-center gap-2 rounded-lg px-2 py-1.5">
              <Grid3x3 className="h-3 w-3 text-muted-foreground/50" />
              <span className="text-[10px] text-muted-foreground/50 font-medium">Tintd Pro © 2025</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-full justify-start gap-2 px-2 text-[11px] text-muted-foreground hover:text-foreground rounded-lg"
            >
              <Info className="h-3 w-3" />
              About & License
            </Button>
          </div>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground"
            title="About"
          >
            <Info className="h-4 w-4" />
          </Button>
        )}
      </div>
    </aside>
  );
}

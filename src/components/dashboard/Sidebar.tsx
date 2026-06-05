import {
  Clock,
  FolderOpen,
  Grid3x3,
  Info,
  LayoutGrid,
  Settings,
} from "lucide-react";
import logo from "@/assets/logo.svg";
import { cn } from "@/utils/cn";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

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
}[] = [
  { id: "folders", label: "Folders", icon: FolderOpen },
  { id: "library", label: "Library", icon: LayoutGrid },
  { id: "recent", label: "Recent", icon: Clock },
  { id: "settings", label: "Settings", icon: Settings },
];

export function Sidebar({ activeTab, onTabChange, collapsed = false }: SidebarProps) {
  return (
    <aside
      className={cn(
        "relative flex flex-col border-r border-border bg-card transition-all duration-300 ease-in-out",
        collapsed ? "w-[64px]" : "w-[250px]"
      )}
    >
      {/* Header */}
      <div className={cn("flex items-center gap-3 px-4 py-5", collapsed && "justify-center px-2")}>
        <div className="relative flex-shrink-0">
          <div className="absolute -inset-1 rounded-xl bg-primary/20 blur-sm" />
          <img
            src={logo}
            alt="Tintd Pro"
            className="relative h-9 w-9 rounded-lg"
          />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <h1 className="truncate text-[15px] font-bold tracking-tight text-foreground">
              Tintd Pro
            </h1>
            <p className="text-[11px] text-muted-foreground">v0.1.0 · Windows</p>
          </div>
        )}
      </div>

      <Separator className="opacity-50" />

      {/* Navigation */}
      <nav className={cn("flex-1 space-y-1 px-2 py-4", collapsed && "px-1.5")}>
        {!collapsed && (
          <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
            Navigation
          </p>
        )}
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              id={`sidebar-tab-${id}`}
              onClick={() => onTabChange(id)}
              title={collapsed ? label : undefined}
              className={cn(
                "group relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                collapsed ? "justify-center px-2" : "",
                isActive
                  ? "bg-primary/15 text-primary shadow-sm"
                  : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
              )}
            >
              {isActive && (
                <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r-full bg-primary" />
              )}
              <Icon
                className={cn(
                  "h-4 w-4 flex-shrink-0 transition-transform duration-200",
                  isActive ? "text-primary" : "group-hover:scale-110"
                )}
              />
              {!collapsed && (
                <span className="truncate">{label}</span>
              )}
            </button>
          );
        })}
      </nav>

      <Separator className="opacity-50" />

      {/* Footer */}
      <div className={cn("px-4 py-4", collapsed && "flex flex-col items-center px-2")}>
        {!collapsed ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground/70">
              <Grid3x3 className="h-3 w-3" />
              <span>Tintd Pro © 2025</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-full justify-start gap-2 px-2 text-[11px] text-muted-foreground hover:text-foreground"
            >
              <Info className="h-3 w-3" />
              About & License
            </Button>
          </div>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            title="About"
          >
            <Info className="h-4 w-4" />
          </Button>
        )}
      </div>
    </aside>
  );
}

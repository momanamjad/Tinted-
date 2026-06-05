import {
  ArrowRight,
  Camera,
  Clock,
  Code2,
  ExternalLink,
  Music,
  RotateCcw,
  Video,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn";

type RecentEntry = {
  id: number;
  timestamp: string;
  relativeTime: string;
  folderName: string;
  folderPath: string;
  iconName: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  color: string;
  status: "applied" | "reset" | "failed";
};

const RECENT_ENTRIES: RecentEntry[] = [
  {
    id: 1,
    timestamp: "2026-06-05T10:14:00",
    relativeTime: "2 hours ago",
    folderName: "Projects",
    folderPath: "C:\\Users\\DELL\\Projects",
    iconName: "code",
    icon: Code2,
    color: "#3b82f6",
    status: "applied",
  },
  {
    id: 2,
    timestamp: "2026-06-04T18:30:00",
    relativeTime: "Yesterday",
    folderName: "Music Collection",
    folderPath: "C:\\Users\\DELL\\Music",
    iconName: "music",
    icon: Music,
    color: "#8b5cf6",
    status: "applied",
  },
  {
    id: 3,
    timestamp: "2026-06-04T14:22:00",
    relativeTime: "Yesterday",
    folderName: "Photography",
    folderPath: "C:\\Users\\DELL\\Photos",
    iconName: "camera",
    icon: Camera,
    color: "#ec4899",
    status: "applied",
  },
  {
    id: 4,
    timestamp: "2026-06-03T09:05:00",
    relativeTime: "2 days ago",
    folderName: "Videos",
    folderPath: "C:\\Users\\DELL\\Videos",
    iconName: "video",
    icon: Video,
    color: "#f97316",
    status: "reset",
  },
  {
    id: 5,
    timestamp: "2026-06-02T16:45:00",
    relativeTime: "3 days ago",
    folderName: "Source Code",
    folderPath: "C:\\Dev\\SourceCode",
    iconName: "code",
    icon: Code2,
    color: "#22c55e",
    status: "applied",
  },
  {
    id: 6,
    timestamp: "2026-06-01T11:30:00",
    relativeTime: "4 days ago",
    folderName: "Podcasts",
    folderPath: "C:\\Users\\DELL\\Podcasts",
    iconName: "music",
    icon: Music,
    color: "#14b8a6",
    status: "failed",
  },
];

const STATUS_CONFIG = {
  applied: { label: "Applied", className: "bg-primary/15 text-primary border-primary/20" },
  reset: { label: "Reset", className: "bg-secondary text-muted-foreground border-border" },
  failed: { label: "Failed", className: "bg-destructive/15 text-destructive border-destructive/20" },
};

// Group entries by relative date
function groupByDate(entries: RecentEntry[]) {
  const groups: Record<string, RecentEntry[]> = {};
  entries.forEach((entry) => {
    const key = entry.relativeTime;
    if (!groups[key]) groups[key] = [];
    groups[key].push(entry);
  });
  return groups;
}

export function RecentTab() {
  const grouped = groupByDate(RECENT_ENTRIES);

  return (
    <div className="flex h-full flex-col gap-4 overflow-auto pb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-primary" />
          <h3 className="text-[13px] font-semibold">Activity History</h3>
          <Badge variant="secondary" className="text-[10px]">
            {RECENT_ENTRIES.length}
          </Badge>
        </div>
        <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground">
          Clear All
        </Button>
      </div>

      {Object.entries(grouped).map(([dateGroup, entries]) => (
        <div key={dateGroup} className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
            {dateGroup}
          </p>
          {entries.map((entry) => {
            const Icon = entry.icon;
            const statusCfg = STATUS_CONFIG[entry.status];
            return (
              <div
                key={entry.id}
                className="group relative flex items-center gap-3 rounded-xl border border-border/60 bg-card/60 p-3.5 transition-all duration-200 hover:border-primary/20 hover:bg-card hover:shadow-sm"
              >
                {/* Timeline dot */}
                <div className="absolute -left-[1px] top-1/2 h-2 w-2 -translate-y-1/2 -translate-x-1/2 rounded-full border-2 border-background bg-primary/40 opacity-0 group-hover:opacity-100 transition-opacity" />

                {/* Timestamp */}
                <div className="flex w-20 flex-shrink-0 flex-col items-start">
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <Clock className="h-2.5 w-2.5" />
                    {new Date(entry.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>

                {/* Folder name + arrow + icon */}
                <div className="flex flex-1 items-center gap-2 min-w-0">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {entry.folderName}
                    </p>
                    <p className="truncate text-[11px] text-muted-foreground">{entry.folderPath}</p>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground/40" />
                  {/* Icon chip */}
                  <div
                    className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg"
                    style={{ backgroundColor: entry.color + "22" }}
                  >
                    <Icon className="h-4.5 w-4.5" style={{ color: entry.color }} />
                  </div>
                </div>

                {/* Color dot */}
                <div
                  className="h-4 w-4 flex-shrink-0 rounded-full border border-white/10 shadow-sm"
                  style={{ backgroundColor: entry.color }}
                />

                {/* Status badge */}
                <Badge
                  className={cn(
                    "flex-shrink-0 border text-[10px] font-medium",
                    statusCfg.className
                  )}
                >
                  {statusCfg.label}
                </Badge>

                {/* Actions */}
                <div className="flex flex-shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <Button variant="ghost" size="icon" className="h-7 w-7" title="Open folder">
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7" title="Reset icon">
                    <RotateCcw className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

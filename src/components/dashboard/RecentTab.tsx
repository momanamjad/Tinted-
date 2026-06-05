import { useEffect, useState } from "react";
import {
  ArrowRight,
  Clock,
  ExternalLink,
  FolderOpen,
  RotateCcw,
} from "lucide-react";
import * as LucideIcons from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn";
import { ALL_ICONS } from "@/data/icons";

type RecentEntry = {
  id: number;
  timestamp: string;
  relativeTime: string;
  folderName: string;
  folderPath: string;
  iconId?: string;
  color: string;
  status: "applied" | "reset" | "failed";
};

type RecentTabProps = {
  refreshTrigger?: number;
};

const STATUS_CONFIG = {
  applied: { label: "Applied", className: "bg-primary/15 text-primary border-primary/20" },
  reset: { label: "Reset", className: "bg-secondary text-muted-foreground border-border" },
  failed: { label: "Failed", className: "bg-destructive/15 text-destructive border-destructive/20" },
};

function groupByDate(entries: RecentEntry[]) {
  const groups: Record<string, RecentEntry[]> = {};
  entries.forEach((entry) => {
    const key = entry.relativeTime;
    if (!groups[key]) groups[key] = [];
    groups[key].push(entry);
  });
  return groups;
}

export function RecentTab({ refreshTrigger = 0 }: RecentTabProps) {
  const [entries, setEntries] = useState<RecentEntry[]>([]);

  useEffect(() => {
    loadHistory();
  }, [refreshTrigger]);

  async function loadHistory() {
    if (!window.tintd?.ipcRenderer) return;
    try {
      const history = await window.tintd.ipcRenderer.invoke("icons:history");
      const list = history.map((record: any) => ({
        id: record.id,
        timestamp: record.updatedAt,
        relativeTime: formatDateRelative(record.updatedAt),
        folderName: record.folderPath.split("\\").pop() || "Folder",
        folderPath: record.folderPath,
        iconId: record.iconId,
        color: record.color,
        status: record.status,
      }));
      setEntries(list);
    } catch (err) {
      console.error("Failed to load history:", err);
    }
  }

  function formatDateRelative(dateStr: string) {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Today";
    if (diffMins < 60) return "Today";
    if (diffHours < 24) return "Today";
    if (diffDays === 1) return "Yesterday";
    return `${diffDays} days ago`;
  }

  const handleReveal = async (path: string) => {
    if (!window.tintd?.ipcRenderer) return;
    await window.tintd.ipcRenderer.invoke("folders:reveal", path);
  };

  const handleReset = async (path: string) => {
    if (!window.tintd?.ipcRenderer) return;
    try {
      const result = await window.tintd.ipcRenderer.invoke("removeFolderIcon", path);
      if (result.success) {
        loadHistory();
      } else {
        alert("Error resetting: " + result.error);
      }
    } catch (err: any) {
      alert("Failed to reset: " + err.message);
    }
  };

  const grouped = groupByDate(entries);

  return (
    <div className="flex h-full flex-col gap-4 overflow-auto pb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-primary" />
          <h3 className="text-[13px] font-semibold">Activity History</h3>
          <Badge variant="secondary" className="text-[10px]">
            {entries.length}
          </Badge>
        </div>
      </div>

      {entries.length === 0 ? (
        <div className="flex h-48 flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border/50 text-sm text-muted-foreground">
          No activity logs yet. Customize a folder to get started!
        </div>
      ) : (
        Object.entries(grouped).map(([dateGroup, items]) => (
          <div key={dateGroup} className="space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
              {dateGroup}
            </p>
            {items.map((entry) => {
              // Resolve custom icon
              let LucideIcon: any = FolderOpen;
              let emojiChar: string | undefined = undefined;

              if (entry.iconId) {
                const found = ALL_ICONS.find((i) => i.id === entry.iconId);
                if (found) {
                  if (found.lucideIcon) {
                    LucideIcon = (LucideIcons as any)[found.lucideIcon] || FolderOpen;
                  } else if (found.emoji) {
                    LucideIcon = null;
                    emojiChar = found.emoji;
                  }
                }
              }

              const statusCfg = STATUS_CONFIG[entry.status] || STATUS_CONFIG.applied;
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
                      {LucideIcon ? (
                        <LucideIcon className="h-4.5 w-4.5" style={{ color: entry.color }} />
                      ) : (
                        <span className="text-lg select-none font-sans leading-none">{emojiChar}</span>
                      )}
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
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      title="Open folder"
                      onClick={() => handleReveal(entry.folderPath)}
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      title="Reset icon"
                      onClick={() => handleReset(entry.folderPath)}
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        ))
      )}
    </div>
  );
}

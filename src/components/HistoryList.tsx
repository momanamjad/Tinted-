import { ExternalLink, RotateCcw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/utils/colors";
import type { FolderIconRecord } from "@/types";

type HistoryListProps = {
  records: FolderIconRecord[];
  onReveal: (folderPath: string) => void;
  onReset: (folderPath: string) => void;
};

export function HistoryList({ records, onReveal, onReset }: HistoryListProps) {
  if (records.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center rounded-lg border border-dashed border-border text-sm text-muted-foreground">
        No folders tinted yet.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {records.map((record) => (
        <div
          key={record.id}
          className="grid grid-cols-[2.5rem_minmax(0,1fr)_auto] items-center gap-3 rounded-lg border bg-background p-3"
        >
          <div
            className="h-9 w-9 rounded-md border border-border"
            style={{ backgroundColor: record.color }}
          />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="truncate text-sm font-medium">{record.folderPath}</p>
              <Badge variant={record.status === "applied" ? "default" : "secondary"}>
                {record.status}
              </Badge>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {formatDate(record.updatedAt)}
              {record.message ? ` · ${record.message}` : ""}
            </p>
          </div>
          <div className="flex gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              title="Open folder"
              onClick={() => onReveal(record.folderPath)}
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              title="Reset icon"
              onClick={() => onReset(record.folderPath)}
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}

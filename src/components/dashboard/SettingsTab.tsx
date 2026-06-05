import { useState, useEffect } from "react";
import {
  AlertTriangle,
  Clock,
  Download,
  Eye,
  FolderOpen,
  FolderSearch,
  Moon,
  Plus,
  RotateCcw,
  Settings,
  Shield,
  Sun,
  Trash2,
  Upload,
  Wand2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import type { Settings as AppSettings, SettingValue } from "@/types";
import { cn } from "@/utils/cn";

type SettingRowProps = {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  accentColor?: string;
};

function SettingRow({
  id,
  icon: Icon,
  label,
  description,
  checked,
  onCheckedChange,
  accentColor = "text-primary",
}: SettingRowProps) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-border/60 bg-card/60 p-4 transition-all duration-200 hover:border-primary/20 hover:bg-card">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary/50">
          <Icon className={cn("h-4 w-4", accentColor)} />
        </div>
        <div>
          <Label htmlFor={id} className="cursor-pointer text-sm font-semibold">
            {label}
          </Label>
          <p className="mt-0.5 text-[12px] text-muted-foreground">{description}</p>
        </div>
      </div>
      <Switch
        id={id}
        checked={checked}
        onCheckedChange={onCheckedChange}
      />
    </div>
  );
}

type SettingsTabProps = {
  settings: AppSettings;
  onUpdateSetting: (key: keyof AppSettings, value: SettingValue) => void;
};

function formatRelativeTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);

    if (diffSecs < 10) return "just now";
    if (diffSecs < 60) return `${diffSecs}s ago`;
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  } catch (e) {
    return "some time ago";
  }
}

export function SettingsTab({ settings, onUpdateSetting }: SettingsTabProps) {
  const isDark = settings.theme === "dark";

  const [watcherEnabled, setWatcherEnabled] = useState(false);
  const [watchedFolders, setWatchedFolders] = useState<string[]>([]);
  const [activity, setActivity] = useState<any[]>([]);
  const [autoStyleDelay, setAutoStyleDelay] = useState(3);
  const [loading, setLoading] = useState(true);

  const fetchWatcherStatus = async () => {
    if (!window.tintd?.ipcRenderer) return;
    try {
      const status = await window.tintd.ipcRenderer.invoke("watcher:get-status");
      if (status.success) {
        setWatcherEnabled(status.isActive);
        setWatchedFolders(status.watchingPaths || []);
        setActivity(status.activity || []);
        if (status.autoStyleDelay !== undefined) {
          setAutoStyleDelay(Math.round(status.autoStyleDelay / 1000));
        }
      }
    } catch (err) {
      console.error("Failed to fetch watcher status:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWatcherStatus();
    // Poll logs every 5 seconds to keep dashboard active in background
    const interval = setInterval(fetchWatcherStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleWatcher = async (checked: boolean) => {
    if (!window.tintd?.ipcRenderer) return;
    setWatcherEnabled(checked);
    if (checked) {
      await window.tintd.ipcRenderer.invoke("watcher:start", watchedFolders);
    } else {
      await window.tintd.ipcRenderer.invoke("watcher:stop");
    }
    fetchWatcherStatus();
  };

  const removeWatchedFolder = async (pathToRemove: string) => {
    if (!window.tintd?.ipcRenderer) return;
    const updated = watchedFolders.filter((p) => p !== pathToRemove);
    setWatchedFolders(updated);
    await window.tintd.ipcRenderer.invoke("watcher:stop", pathToRemove);
    fetchWatcherStatus();
  };

  const addWatchedFolder = async () => {
    if (!window.tintd?.ipcRenderer) return;
    const selectedPath = await window.tintd.ipcRenderer.invoke("watcher:select-directory");
    if (!selectedPath) return;

    if (watchedFolders.includes(selectedPath)) {
      return;
    }

    const updated = [...watchedFolders, selectedPath];
    setWatchedFolders(updated);
    await window.tintd.ipcRenderer.invoke("watcher:start", updated);
    setWatcherEnabled(true);
    fetchWatcherStatus();
  };

  return (
    <div className="flex h-full flex-col gap-5 overflow-auto pb-4">
      {/* Section: Appearance */}
      <Card className="border-border/60 bg-card/40">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-primary" />
            <CardTitle className="text-sm font-semibold">Appearance</CardTitle>
          </div>
          <CardDescription className="text-[12px]">
            Customize the look and feel of Tintd Pro
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Theme toggle */}
          <div className="flex items-center justify-between gap-4 rounded-xl border border-border/60 bg-card/60 p-4 transition-all hover:border-primary/20 hover:bg-card">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary/50">
                {isDark ? (
                  <Moon className="h-4 w-4 text-primary" />
                ) : (
                  <Sun className="h-4 w-4 text-yellow-500" />
                )}
              </div>
              <div>
                <Label htmlFor="settings-theme" className="cursor-pointer text-sm font-semibold">
                  {isDark ? "Dark Mode" : "Light Mode"}
                </Label>
                <p className="mt-0.5 text-[12px] text-muted-foreground">
                  {isDark
                    ? "Using dark theme — easier on the eyes"
                    : "Using light theme — bright and clean"}
                </p>
              </div>
            </div>
            <Switch
              id="settings-theme"
              checked={isDark}
              onCheckedChange={(checked) => onUpdateSetting("theme", checked ? "dark" : "light")}
            />
          </div>
        </CardContent>
      </Card>

      {/* Section: Behavior */}
      <Card className="border-border/60 bg-card/40">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Settings className="h-4 w-4 text-primary" />
            <CardTitle className="text-sm font-semibold">Behavior</CardTitle>
          </div>
          <CardDescription className="text-[12px]">
            Control how Tintd Pro applies and manages folder icons
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <SettingRow
            id="settings-folder-watcher"
            icon={FolderSearch}
            label="Folder Watcher"
            description="Watch folders for changes and re-apply icons automatically"
            checked={watcherEnabled}
            onCheckedChange={handleToggleWatcher}
          />
          {watcherEnabled && (
            <div className="rounded-xl border border-border/60 bg-background/20 p-4 transition-all duration-200 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor="settings-style-delay" className="text-xs font-semibold text-foreground">
                  Auto-style delay: {autoStyleDelay}s
                </Label>
                <span className="text-xs text-primary font-mono font-semibold">{autoStyleDelay}s</span>
              </div>
              <input
                id="settings-style-delay"
                type="range"
                min="1"
                max="10"
                value={autoStyleDelay}
                onChange={async (e) => {
                  const val = Number(e.target.value);
                  setAutoStyleDelay(val);
                  if (window.tintd?.ipcRenderer) {
                    await window.tintd.ipcRenderer.invoke("watcher:set-delay", val);
                  }
                }}
                className="w-full h-1 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <p className="text-[10px] text-muted-foreground mt-1.5 leading-snug">
                Wait time before auto-styling new folders (gives you time to finish typing the folder name).
              </p>
            </div>
          )}
          <SettingRow
            id="settings-auto-apply"
            icon={Wand2}
            label="Auto-apply Icons"
            description="Automatically apply the last used color to new folders"
            checked={settings.keepIconCopy}
            onCheckedChange={(v) => onUpdateSetting("keepIconCopy", v)}
          />
          <SettingRow
            id="settings-keep-copy"
            icon={Shield}
            label="Keep Icon Copy"
            description="Store generated icon files inside each folder as a backup"
            checked={settings.keepIconCopy}
            onCheckedChange={(v) => onUpdateSetting("keepIconCopy", v)}
            accentColor="text-blue-500"
          />
        </CardContent>
      </Card>

      {/* Section: Watched Folders */}
      <Card className="border-border/60 bg-card/40">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <FolderOpen className="h-4 w-4 text-primary" />
                <CardTitle className="text-sm font-semibold">Watched Folders</CardTitle>
              </div>
              <CardDescription className="mt-1 text-[12px]">
                Folders being monitored for automatic icon management
              </CardDescription>
            </div>
            <Button
              id="settings-add-watched"
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 text-xs text-primary hover:text-primary-foreground border-primary/30"
              onClick={addWatchedFolder}
            >
              <Plus className="h-3.5 w-3.5" />
              Add Folder
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {watcherEnabled && watchedFolders.length > 0 && (
            <p className="text-xs text-emerald-400 font-medium pb-1">
              ✓ Active (monitoring {watchedFolders.length} locations)
            </p>
          )}
          {!watcherEnabled && watchedFolders.length > 0 && (
            <p className="text-xs text-amber-500 font-medium pb-1">
              ⚠️ Watcher is disabled (toggle Folder Watcher under Behavior to resume)
            </p>
          )}
          {watchedFolders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 border border-dashed border-border/60 rounded-xl bg-card/20 text-center">
              <FolderOpen className="h-8 w-8 text-muted-foreground/50 mb-2" />
              <p className="text-xs text-muted-foreground">No folders watched yet.</p>
              <p className="text-[10px] text-muted-foreground/60 mt-0.5">Click Add Folder to monitor a folder.</p>
            </div>
          ) : (
            watchedFolders.map((path) => (
              <div
                key={path}
                className="flex items-center gap-3 rounded-lg border border-border/50 bg-background/60 px-3 py-2.5 transition-colors hover:border-primary/20"
              >
                <div
                  className={cn(
                    "h-2 w-2 flex-shrink-0 rounded-full",
                    watcherEnabled ? "bg-emerald-400" : "bg-amber-500/40"
                  )}
                />
                <p className="flex-1 truncate font-mono text-[12px] text-foreground" title={path}>{path}</p>
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[10px] font-medium",
                    watcherEnabled
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      : "bg-secondary text-muted-foreground"
                  )}
                >
                  {watcherEnabled ? "Active" : "Paused"}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-destructive"
                  onClick={() => removeWatchedFolder(path)}
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Section: Watcher Activity Log */}
      <Card className="border-border/60 bg-card/40">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            <CardTitle className="text-sm font-semibold">Watcher Activity Log</CardTitle>
          </div>
          <CardDescription className="text-[12px]">
            Recent background auto-styling operations
          </CardDescription>
        </CardHeader>
        <CardContent>
          {activity.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 border border-dashed border-border/60 rounded-xl bg-card/20 text-center">
              <Clock className="h-8 w-8 text-muted-foreground/50 mb-2" />
              <p className="text-xs text-muted-foreground">No recent activity.</p>
              <p className="text-[10px] text-muted-foreground/60 mt-0.5">Watcher activity logs will appear here.</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {activity.map((log) => (
                <div key={log.id} className="flex flex-col gap-1 rounded-lg border border-border/40 bg-background/40 p-2.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground truncate max-w-[250px]" title={log.folderPath}>
                      {log.folderName}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-mono">
                      {formatRelativeTime(log.timestamp)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-muted-foreground mt-0.5">
                    <span>
                      {log.status === "success" ? (
                        <span className="text-emerald-400 font-medium">✓ Auto-styled with {log.suggestedIcon}</span>
                      ) : log.status === "skipped" ? (
                        <span className="text-amber-400">💡 Suggestion: {log.suggestedIcon} ({log.confidence}% confidence)</span>
                      ) : (
                        <span className="text-red-400">✗ Failed to auto-style</span>
                      )}
                    </span>
                    <span className="font-mono text-[10px] flex items-center gap-1.5" style={{ color: log.appliedColor }}>
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: log.appliedColor }} />
                      {log.appliedColor}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Separator className="opacity-30" />

      {/* Danger Zone */}
      <Card className="border-destructive/20 bg-destructive/5">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <CardTitle className="text-sm font-semibold text-destructive">Danger Zone</CardTitle>
          </div>
          <CardDescription className="text-[12px]">
            These actions are irreversible — proceed with caution
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button
              id="settings-clear-data"
              variant="outline"
              size="sm"
              className="gap-2 border-destructive/30 text-destructive hover:bg-destructive hover:text-destructive-foreground"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Clear All Data
            </Button>
            <Button
              id="settings-reset-icons"
              variant="outline"
              size="sm"
              className="gap-2 border-orange-500/30 text-orange-500 hover:bg-orange-500 hover:text-white"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset All Icons
            </Button>
            <Button
              id="settings-export"
              variant="outline"
              size="sm"
              className="gap-2 border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground"
            >
              <Download className="h-3.5 w-3.5" />
              Export Settings
            </Button>
            <Button
              id="settings-import"
              variant="outline"
              size="sm"
              className="gap-2 text-muted-foreground hover:text-foreground"
            >
              <Upload className="h-3.5 w-3.5" />
              Import Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

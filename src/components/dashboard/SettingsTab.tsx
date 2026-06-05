import {
  AlertTriangle,
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

type WatchedFolder = { id: number; path: string; active: boolean };

const WATCHED_FOLDERS: WatchedFolder[] = [
  { id: 1, path: "C:\\Users\\DELL\\Projects", active: true },
  { id: 2, path: "C:\\Users\\DELL\\Documents", active: true },
  { id: 3, path: "C:\\Users\\DELL\\Downloads", active: false },
];

type SettingsTabProps = {
  settings: AppSettings;
  onUpdateSetting: (key: keyof AppSettings, value: SettingValue) => void;
};

export function SettingsTab({ settings, onUpdateSetting }: SettingsTabProps) {
  const isDark = settings.theme === "dark";

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
            checked={settings.autoRefreshExplorer}
            onCheckedChange={(v) => onUpdateSetting("autoRefreshExplorer", v)}
          />
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
            <Button id="settings-add-watched" variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
              <Plus className="h-3.5 w-3.5" />
              Add Folder
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {WATCHED_FOLDERS.map((folder) => (
            <div
              key={folder.id}
              className="flex items-center gap-3 rounded-lg border border-border/50 bg-background/60 px-3 py-2.5"
            >
              <div
                className={cn(
                  "h-2 w-2 flex-shrink-0 rounded-full",
                  folder.active ? "bg-primary" : "bg-muted-foreground/40"
                )}
              />
              <p className="flex-1 truncate font-mono text-[12px] text-foreground">{folder.path}</p>
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[10px] font-medium",
                  folder.active
                    ? "bg-primary/10 text-primary"
                    : "bg-secondary text-muted-foreground"
                )}
              >
                {folder.active ? "Active" : "Paused"}
              </span>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive">
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
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

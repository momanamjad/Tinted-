import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  FolderKanban,
  MonitorCog,
  Moon,
  Paintbrush,
  RotateCcw,
  Sparkles,
  Sun
} from "lucide-react";
import logo from "@/assets/logo.svg";
import { ColorSwatch } from "@/components/ColorSwatch";
import { FolderPicker } from "@/components/FolderPicker";
import { HistoryList } from "@/components/HistoryList";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTintdSettings } from "@/hooks/useTintdSettings";
import { isHexColor, normalizeHexColor, TINT_PRESETS } from "@/utils/colors";
import type { FolderIconRecord } from "@/types";

export function MainPage() {
  const { settings, updateSetting } = useTintdSettings();
  const [folderPath, setFolderPath] = useState("");
  const [selectedColor, setSelectedColor] = useState(settings.lastColor);
  const [customColor, setCustomColor] = useState(settings.lastColor);
  const [history, setHistory] = useState<FolderIconRecord[]>([]);
  const [status, setStatus] = useState("Ready");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setSelectedColor(settings.lastColor);
    setCustomColor(settings.lastColor);
  }, [settings.lastColor]);

  useEffect(() => {
    refreshHistory();
  }, []);

  const canApply = useMemo(
    () => Boolean(folderPath.trim()) && isHexColor(selectedColor) && !busy,
    [busy, folderPath, selectedColor]
  );

  async function refreshHistory() {
    if (!window.tintd?.ipcRenderer) return;
    const records = await window.tintd.ipcRenderer.invoke("icons:history");
    setHistory(records);
  }

  async function pickFolder() {
    if (!window.tintd?.ipcRenderer) return;
    const selected = await window.tintd.ipcRenderer.invoke("folders:select");
    if (selected) {
      setFolderPath(selected);
    }
  }

  function chooseColor(color: string) {
    setSelectedColor(color);
    setCustomColor(color);
  }

  function commitCustomColor(value: string) {
    const normalized = normalizeHexColor(value);
    setCustomColor(normalized);

    if (isHexColor(normalized)) {
      setSelectedColor(normalized);
    }
  }

  async function applyIcon() {
    if (!canApply || !window.tintd?.ipcRenderer) {
      return;
    }

    setBusy(true);
    setStatus("Applying folder icon...");

    try {
      const record = await window.tintd.ipcRenderer.invoke("icons:apply", {
        folderPath: folderPath.trim(),
        color: selectedColor,
        autoRefreshExplorer: settings.autoRefreshExplorer
      });
      await updateSetting("lastColor", selectedColor);
      await refreshHistory();
      setStatus(record.message);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not apply icon.");
    } finally {
      setBusy(false);
    }
  }

  async function resetIcon(path: string = folderPath) {
    if (!path.trim() || !window.tintd?.ipcRenderer) {
      return;
    }

    setBusy(true);
    setStatus("Resetting folder icon...");

    try {
      const record = await window.tintd.ipcRenderer.invoke("icons:reset", path.trim());
      await refreshHistory();
      setStatus(record.message);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not reset icon.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="grid min-h-screen grid-cols-[280px_minmax(0,1fr)]">
        <aside className="border-r bg-card px-5 py-6">
          <div className="flex items-center gap-3">
            <img src={logo} alt="" className="h-11 w-11" />
            <div>
              <h1 className="text-lg font-semibold tracking-normal">Tintd Pro</h1>
              <p className="text-xs text-muted-foreground">Windows Edition</p>
            </div>
          </div>

          <Separator className="my-6" />

          <nav className="space-y-1">
            <Button variant="secondary" className="w-full justify-start">
              <Paintbrush className="h-4 w-4" />
              Customize
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <FolderKanban className="h-4 w-4" />
              History
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <MonitorCog className="h-4 w-4" />
              Settings
            </Button>
          </nav>

          <div className="mt-8 rounded-lg border bg-background p-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Sparkles className="h-4 w-4 text-primary" />
              Current Tint
            </div>
            <div className="mt-4 flex items-center gap-3">
              <div
                className="h-12 w-12 rounded-md border border-border"
                style={{ backgroundColor: selectedColor }}
              />
              <div>
                <p className="text-sm font-semibold">{selectedColor.toUpperCase()}</p>
                <p className="text-xs text-muted-foreground">Applied to generated ICO files</p>
              </div>
            </div>
          </div>
        </aside>

        <section className="overflow-hidden p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <Badge variant="outline">Desktop App</Badge>
                <Badge variant="secondary">SQLite settings</Badge>
              </div>
              <h2 className="text-2xl font-semibold tracking-normal">
                Folder icon customization
              </h2>
            </div>
            <Button
              variant="outline"
              size="icon"
              title={settings.theme === "dark" ? "Use light mode" : "Use dark mode"}
              onClick={() =>
                updateSetting("theme", settings.theme === "dark" ? "light" : "dark")
              }
            >
              {settings.theme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>
          </div>

          <Tabs defaultValue="customize" className="h-[calc(100vh-128px)] min-h-[650px]">
            <TabsList>
              <TabsTrigger value="customize">Customize</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="customize" className="grid grid-cols-[minmax(0,1fr)_340px] gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Apply a tint</CardTitle>
                  <CardDescription>
                    Choose a folder, select a color, then generate the Windows icon files.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FolderPicker
                    folderPath={folderPath}
                    onFolderPathChange={setFolderPath}
                    onPickFolder={pickFolder}
                  />

                  <div className="space-y-3">
                    <Label>Palette</Label>
                    <div className="grid grid-cols-6 gap-3">
                      {TINT_PRESETS.map((color) => (
                        <ColorSwatch
                          key={color}
                          color={color}
                          selected={selectedColor === color}
                          onSelect={chooseColor}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-[1fr_6rem] items-end gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="customColor">Custom hex</Label>
                      <Input
                        id="customColor"
                        value={customColor}
                        onChange={(event) => commitCustomColor(event.target.value)}
                        placeholder="#22c55e"
                      />
                    </div>
                    <div
                      className="h-10 rounded-md border border-border"
                      style={{ backgroundColor: selectedColor }}
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <Button disabled={!canApply} onClick={applyIcon}>
                      <CheckCircle2 className="h-4 w-4" />
                      {busy ? "Working..." : "Apply Icon"}
                    </Button>
                    <Button
                      variant="outline"
                      disabled={!folderPath.trim() || busy}
                      onClick={() => resetIcon()}
                    >
                      <RotateCcw className="h-4 w-4" />
                      Reset
                    </Button>
                  </div>

                  <p className="text-sm text-muted-foreground">{status}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Preview</CardTitle>
                  <CardDescription>Generated icon style</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid aspect-square place-items-center rounded-lg border bg-background">
                    <div className="relative h-44 w-56">
                      <div
                        className="absolute left-4 top-5 h-16 w-28 rounded-md"
                        style={{ backgroundColor: selectedColor, filter: "brightness(1.12)" }}
                      />
                      <div
                        className="absolute inset-x-0 bottom-4 h-32 rounded-lg shadow-2xl"
                        style={{ backgroundColor: selectedColor }}
                      />
                      <div className="absolute bottom-16 left-10 h-3 w-28 rounded-full bg-white/25" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history">
              <Card>
                <CardHeader>
                  <CardTitle>Recent folders</CardTitle>
                  <CardDescription>Stored locally in SQLite.</CardDescription>
                </CardHeader>
                <CardContent>
                  <HistoryList
                    records={history}
                    onReveal={(path) => window.tintd?.ipcRenderer.invoke("folders:reveal", path)}
                    onReset={resetIcon}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings">
              <Card>
                <CardHeader>
                  <CardTitle>Preferences</CardTitle>
                  <CardDescription>Saved in the local Tintd Pro SQLite database.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                      <Label>Dark mode</Label>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Tintd Pro starts in dark mode by default.
                      </p>
                    </div>
                    <Switch
                      checked={settings.theme === "dark"}
                      onCheckedChange={(checked) =>
                        updateSetting("theme", checked ? "dark" : "light")
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                      <Label>Refresh Explorer</Label>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Open the folder after applying an icon.
                      </p>
                    </div>
                    <Switch
                      checked={settings.autoRefreshExplorer}
                      onCheckedChange={(checked) =>
                        updateSetting("autoRefreshExplorer", checked)
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                      <Label>Keep icon copy</Label>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Store generated icons inside each folder.
                      </p>
                    </div>
                    <Switch
                      checked={settings.keepIconCopy}
                      onCheckedChange={(checked) => updateSetting("keepIconCopy", checked)}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </section>
      </div>
    </main>
  );
}

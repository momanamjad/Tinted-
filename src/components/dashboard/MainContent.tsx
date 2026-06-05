import { useState } from "react";
import { Clock, FolderOpen, Grid3x3, PanelLeftClose, PanelLeftOpen, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sidebar, type ActiveTab } from "@/components/dashboard/Sidebar";
import { FoldersTab } from "@/components/dashboard/FoldersTab";
import { LibraryTab } from "@/components/dashboard/LibraryTab";
import { RecentTab } from "@/components/dashboard/RecentTab";
import { SettingsTab } from "@/components/dashboard/SettingsTab";
import { RightPanel } from "@/components/dashboard/RightPanel";
import { Badge } from "@/components/ui/badge";
import type { Settings as AppSettings } from "@/types";
import { useTintdSettings } from "@/hooks/useTintdSettings";
import { drawFolderIconToCanvas } from "@/utils/iconCanvas";

const TAB_META: Record<
  ActiveTab,
  { label: string; description: string; icon: React.ComponentType<{ className?: string }> }
> = {
  folders: {
    label: "Folders",
    description: "Add and manage your customized folders",
    icon: FolderOpen,
  },
  library: {
    label: "Icon Library",
    description: "Browse and select from hundreds of icons",
    icon: Grid3x3,
  },
  recent: {
    label: "Recent Activity",
    description: "View your icon customization history",
    icon: Clock,
  },
  settings: {
    label: "Settings",
    description: "Preferences, watchers, and data management",
    icon: Settings,
  },
};

export function MainContent() {
  const { settings, updateSetting } = useTintdSettings();
  const [activeTab, setActiveTab] = useState<ActiveTab>("folders");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedColor, setSelectedColor] = useState(settings.lastColor);
  const [selectedIconId, setSelectedIconId] = useState("folder");
  const [selectedFolderPath, setSelectedFolderPath] = useState("");
  const [busy, setBusy] = useState(false);
  const [historyVersion, setHistoryVersion] = useState(0);

  const triggerRefresh = () => setHistoryVersion((v) => v + 1);

  const meta = TAB_META[activeTab];
  const Icon = meta.icon;

  async function handleApply() {
    if (!selectedFolderPath.trim()) return;
    setBusy(true);
    try {
      if (!window.tintd?.ipcRenderer) throw new Error("IPC not available");
      const { pixels, dataUrl } = await drawFolderIconToCanvas(selectedColor, selectedIconId);
      
      const result = await window.tintd.ipcRenderer.invoke("applyFolderIcon", {
        folderPath: selectedFolderPath,
        canvasImageData: Array.from(pixels),
        canvasDataUrl: dataUrl,
        selectedIcon: selectedIconId,
        selectedColor: selectedColor,
      });

      if (result.success) {
        await updateSetting("lastColor", selectedColor as AppSettings["lastColor"]);
        triggerRefresh();
      } else {
        alert("Error applying icon: " + result.error);
      }
    } catch (err: any) {
      alert("Failed to apply icon: " + err.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleRemove() {
    if (!selectedFolderPath.trim()) return;
    setBusy(true);
    try {
      if (!window.tintd?.ipcRenderer) throw new Error("IPC not available");
      const result = await window.tintd.ipcRenderer.invoke("removeFolderIcon", selectedFolderPath);
      if (result.success) {
        triggerRefresh();
      } else {
        alert("Error removing icon: " + result.error);
      }
    } catch (err: any) {
      alert("Failed to remove icon: " + err.message);
    } finally {
      setBusy(false);
    }
  }

  function handleFolderSelect(path: string, color: string) {
    setSelectedFolderPath(path);
    setSelectedColor(color);
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        collapsed={sidebarCollapsed}
      />

      {/* Center: Header + Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex h-14 flex-shrink-0 items-center justify-between border-b border-border/60 bg-card/50 px-5 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            {/* Collapse toggle */}
            <Button
              id="sidebar-collapse-btn"
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground"
              onClick={() => setSidebarCollapsed((v) => !v)}
              title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {sidebarCollapsed ? (
                <PanelLeftOpen className="h-4 w-4" />
              ) : (
                <PanelLeftClose className="h-4 w-4" />
              )}
            </Button>

            <div className="h-5 w-px bg-border/60" />

            {/* Breadcrumb */}
            <div className="flex items-center gap-2">
              <Icon className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-semibold text-foreground">{meta.label}</h2>
              <span className="hidden text-muted-foreground/40 md:inline">·</span>
              <p className="hidden text-xs text-muted-foreground md:block">{meta.description}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="hidden border-primary/30 text-[10px] text-primary sm:flex"
            >
              v0.1.0
            </Badge>
            <Badge variant="secondary" className="hidden text-[10px] sm:flex">
              Windows Edition
            </Badge>
          </div>
        </header>

        {/* Tab content */}
        <main className="flex-1 overflow-hidden p-5 flex flex-col gap-4">
          {!window.tintd?.ipcRenderer && (
            <div className="flex items-center gap-3 rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-4 text-sm text-yellow-500 shadow-sm backdrop-blur-md">
              <Clock className="h-5 w-5 flex-shrink-0 animate-pulse" /> {/* Reuse Clock or import AlertTriangle */}
              <div className="flex-1">
                <p className="font-semibold text-yellow-400">Running in Web Browser Mode</p>
                <p className="mt-0.5 text-xs text-yellow-500/80">
                  Native Windows folder browsing, drag & drop, and icon generation require the desktop wrapper.
                  Please launch using <strong>npm run dev</strong> and use the desktop window.
                </p>
              </div>
            </div>
          )}
          <div className="flex-1 overflow-hidden">
            {activeTab === "folders" && (
              <FoldersTab
                selectedFolderPath={selectedFolderPath}
                onFolderSelect={handleFolderSelect}
                refreshTrigger={historyVersion}
                onRefreshNeeded={triggerRefresh}
              />
            )}
            {activeTab === "library" && (
              <LibraryTab
                onIconSelect={setSelectedIconId}
                selectedIcon={selectedIconId}
              />
            )}
            {activeTab === "recent" && (
              <RecentTab refreshTrigger={historyVersion} />
            )}
            {activeTab === "settings" && (
              <SettingsTab
                settings={settings}
                onUpdateSetting={updateSetting}
              />
            )}
          </div>
        </main>
      </div>

      {/* Right Panel */}
      <RightPanel
        color={selectedColor}
        onColorChange={setSelectedColor}
        selectedIconId={selectedIconId}
        onIconSelect={setSelectedIconId}
        folderPath={selectedFolderPath}
        onApply={handleApply}
        onRemove={handleRemove}
        busy={busy}
      />
    </div>
  );
}

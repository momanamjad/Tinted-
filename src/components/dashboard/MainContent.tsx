import { useState, useEffect } from "react";
import { Clock, FolderOpen, Grid3x3, PanelLeftClose, PanelLeftOpen, Settings, Sparkles, Loader2 } from "lucide-react";
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
import { ALL_ICONS } from "@/data/icons";
import { matchIconToFolderName, suggestComplementaryColor } from "@/utils/iconMatcher";

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
  const [suggestion, setSuggestion] = useState<{
    iconId: string;
    iconName: string;
    color: string;
    reason: string;
    confidence: number;
  } | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "info" | "error"; iconId?: string } | null>(null);
  const [isBgStyling, setIsBgStyling] = useState(false);

  const triggerRefresh = () => setHistoryVersion((v) => v + 1);

  useEffect(() => {
    if (!window.tintd?.ipcRenderer) return;

    if ((window as any).__watcherRegistered) {
      return;
    }

    (window as any).__watcherRegistered = true;

    window.tintd.ipcRenderer.on(
      "watcher:new-folder",
      async (_event, data: { folderPath: string; folderName: string }) => {
        const { folderPath, folderName } = data;
        setIsBgStyling(true);

        try {
          const match = matchIconToFolderName(folderName, ALL_ICONS);
          if (!match) return;

          const color = suggestComplementaryColor(match.icon);

          if (match.confidence >= 75) {
            // Auto-style!
            const { pixels, dataUrl } = await drawFolderIconToCanvas(color, match.icon.id);

            const result = await window.tintd.ipcRenderer.invoke("applyFolderIcon", {
              folderPath,
              canvasImageData: Array.from(pixels),
              canvasDataUrl: dataUrl,
              selectedIcon: match.icon.id,
              selectedColor: color,
            });

            if (result.success) {
              await window.tintd.ipcRenderer.invoke("watcher:log-activity", {
                folderPath,
                folderName,
                suggestedIcon: match.icon.name,
                appliedColor: color,
                confidence: match.confidence,
                status: "success"
              });

              // Show visual toast
              setToast({
                message: `✓ ${folderName} auto-styled with ${match.icon.name} icon!`,
                type: "info",
                iconId: match.icon.id
              });
              setTimeout(() => setToast(null), 5000);

              // Show native OS notification
              if (Notification.permission === "granted") {
                new Notification("Folder Auto-Styled", {
                  body: `✓ ${folderName} auto-styled with ${match.icon.name} icon!`,
                });
              } else if (Notification.permission !== "denied") {
                Notification.requestPermission().then((permission) => {
                  if (permission === "granted") {
                    new Notification("Folder Auto-Styled", {
                      body: `✓ ${folderName} auto-styled with ${match.icon.name} icon!`,
                    });
                  }
                });
              }

              triggerRefresh();
            } else {
              await window.tintd.ipcRenderer.invoke("watcher:log-activity", {
                folderPath,
                folderName,
                suggestedIcon: match.icon.name,
                appliedColor: color,
                confidence: match.confidence,
                status: "error"
              });
            }
          } else if (match.confidence >= 50) {
            // Suggestion only (weak match)
            await window.tintd.ipcRenderer.invoke("watcher:log-activity", {
              folderPath,
              folderName,
              suggestedIcon: match.icon.name,
              appliedColor: color,
              confidence: match.confidence,
              status: "skipped"
            });
            triggerRefresh();
          }
        } catch (err: any) {
          console.error("Folder watcher auto-styling error:", err);
        } finally {
          setIsBgStyling(false);
        }
      }
    );

    if (typeof Notification !== "undefined" && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore shortcut key bindings if typing in fields
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      ) {
        if (!(e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "l")) {
          return;
        }
      }

      if (e.ctrlKey && e.key.toLowerCase() === "o") {
        e.preventDefault();
        const browseBtn = document.getElementById("folders-browse-btn");
        if (browseBtn) browseBtn.click();
      } else if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "l") {
        e.preventDefault();
        setActiveTab("library");
        setTimeout(() => {
          const searchInput = document.getElementById("library-search") || document.getElementById("right-panel-icon-search");
          if (searchInput) (searchInput as HTMLInputElement).focus();
        }, 100);
      } else if (e.ctrlKey && e.key === ",") {
        e.preventDefault();
        setActiveTab("settings");
      } else if (e.key === "Enter" && !e.shiftKey && !e.ctrlKey) {
        const applyBtn = document.getElementById("right-panel-apply-btn");
        if (applyBtn && !applyBtn.getAttribute("disabled")) {
          e.preventDefault();
          applyBtn.click();
        }
      } else if (e.key === "Delete") {
        const removeBtn = document.getElementById("right-panel-remove-btn");
        if (removeBtn && !removeBtn.getAttribute("disabled")) {
          e.preventDefault();
          removeBtn.click();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedFolderPath, selectedColor, selectedIconId, busy]);

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
        setToast({
          message: `Successfully applied icon to ${selectedFolderPath.split("\\").pop() || "folder"}!`,
          type: "success",
          iconId: selectedIconId
        });
        setTimeout(() => setToast(null), 4000);
      } else {
        setToast({
          message: `Error applying icon: ${result.error}`,
          type: "error"
        });
      }
    } catch (err: any) {
      setToast({
        message: `Failed to apply icon: ${err.message}`,
        type: "error"
      });
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
        setToast({
          message: `Reverted folder icon to Windows system default.`,
          type: "success",
          iconId: "folder"
        });
        setTimeout(() => setToast(null), 4000);
      } else {
        setToast({
          message: `Error removing icon: ${result.error}`,
          type: "error"
        });
      }
    } catch (err: any) {
      setToast({
        message: `Failed to remove icon: ${err.message}`,
        type: "error"
      });
    } finally {
      setBusy(false);
    }
  }

  async function handleFolderSelect(path: string, color: string) {
    setSelectedFolderPath(path);

    if (!path.trim()) {
      setSuggestion(null);
      return;
    }

    // Check if the folder is already customized in history
    let existingCustomization = null;
    if (window.tintd?.ipcRenderer) {
      try {
        const history = await window.tintd.ipcRenderer.invoke("icons:history");
        existingCustomization = history.find((h: any) => h.folderPath === path);
      } catch (e) {
        console.error("Failed to query customizations history:", e);
      }
    }

    if (existingCustomization) {
      setSelectedColor(existingCustomization.color);
      setSelectedIconId(existingCustomization.iconId || "folder");
      setSuggestion(null); // No suggestion for already customized folders
    } else {
      const folderName = path.split("\\").pop() || "Folder";
      const matched = matchIconToFolderName(folderName, ALL_ICONS);

      if (matched) {
        const suggestedColor = suggestComplementaryColor(matched.icon);
        setSelectedColor(suggestedColor);
        setSelectedIconId(matched.icon.id);
        setSuggestion({
          iconId: matched.icon.id,
          iconName: matched.icon.name,
          color: suggestedColor,
          reason: matched.reasoning,
          confidence: matched.confidence
        });
      } else {
        setSelectedColor(color || settings.lastColor);
        setSelectedIconId("folder");
        setSuggestion(null);
      }
    }
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
            {isBgStyling && (
              <Badge variant="outline" className="border-primary/40 text-primary animate-pulse flex items-center gap-1.5 text-[10px] bg-primary/5 mr-2">
                <Loader2 className="h-3 w-3 animate-spin" />
                <span>Auto-styling...</span>
              </Badge>
            )}
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
          <div key={activeTab} className="flex-1 overflow-hidden tab-transition">
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
        suggestion={suggestion}
      />

      {/* Floating Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className={`flex items-start gap-3.5 px-4.5 py-4 rounded-xl border shadow-xl backdrop-blur-md max-w-sm ${
            toast.type === "success"
              ? "bg-emerald-950/85 border-emerald-500/35 text-emerald-100 shadow-emerald-950/20"
              : toast.type === "error"
              ? "bg-rose-950/85 border-rose-500/35 text-rose-100 shadow-rose-950/20"
              : "bg-cyan-950/85 border-cyan-500/35 text-cyan-100 shadow-cyan-950/20"
          }`}>
            {toast.iconId && (
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-white/10 text-white font-sans text-base">
                {toast.iconId === "folder" ? "📁" : toast.iconId.startsWith("emoji-") 
                  ? ALL_ICONS.find(i => i.id === toast.iconId)?.emoji || "💡"
                  : <Sparkles className="h-4 w-4" />
                }
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h4 className="text-[10px] font-bold uppercase tracking-wider opacity-85">
                {toast.type === "success" ? "✓ Icon Applied" : toast.type === "error" ? "✗ Error" : "✓ Auto-Styled"}
              </h4>
              <p className="text-xs font-semibold mt-0.5 leading-snug">{toast.message}</p>
            </div>
            {toast.type === "error" ? (
              <button 
                onClick={() => setToast(null)} 
                className="px-2 py-1 bg-white/15 hover:bg-white/25 text-[9px] font-bold rounded uppercase tracking-wider text-white transition ml-2 self-center"
              >
                Dismiss
              </button>
            ) : (
              <button onClick={() => setToast(null)} className="text-white/45 hover:text-white text-xs ml-2 self-start leading-none mt-0.5">✕</button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

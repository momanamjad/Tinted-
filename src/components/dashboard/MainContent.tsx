import { useState, useEffect } from "react";
import {
  Clock,
  FolderOpen,
  Settings,
  Sparkles,
  Loader2,
  Home,
  RotateCcw,
  Play,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { FoldersTab } from "@/components/dashboard/FoldersTab";
import { RecentTab } from "@/components/dashboard/RecentTab";
import { SettingsTab } from "@/components/dashboard/SettingsTab";
import { RightPanel } from "@/components/dashboard/RightPanel";
import { Badge } from "@/components/ui/badge";
import type { Settings as AppSettings } from "@/types";
import { useTintdSettings } from "@/hooks/useTintdSettings";
import { drawFolderIconToCanvas } from "@/utils/iconCanvas";
import { ALL_ICONS } from "@/data/icons";
import { matchIconToFolderName, suggestComplementaryColor } from "@/utils/iconMatcher";
import { cn } from "@/utils/cn";

export type ActiveTab = "folders" | "recent" | "settings";

export function MainContent() {
  const { settings, updateSetting } = useTintdSettings();
  const [activeTab, setActiveTab] = useState<ActiveTab>("folders");
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

  // Parent Workspace Navigation States
  const [parentPath, setParentPath] = useState<string>("");
  const [subdirs, setSubdirs] = useState<any[]>([]);

  const triggerRefresh = () => setHistoryVersion((v) => v + 1);

  // Sync subdirectories list when history or operations occur
  useEffect(() => {
    if (parentPath) {
      loadSubdirs(parentPath);
    }
  }, [historyVersion, parentPath]);

  async function loadSubdirs(pathStr: string) {
    if (!window.tintd?.ipcRenderer) return;
    try {
      const res = await window.tintd.ipcRenderer.invoke("folders:list-subdirs", pathStr);
      if (res.success) {
        setSubdirs(res.subdirs);
      } else {
        console.error("Failed to list subdirectories:", res.error);
      }
    } catch (e) {
      console.error("IPC list-subdirs error:", e);
    }
  }

  const handleBrowseParent = async () => {
    if (!window.tintd?.ipcRenderer) return;
    const selected = await window.tintd.ipcRenderer.invoke("folders:select");
    if (selected) {
      setParentPath(selected);
      setSelectedFolderPath("");
      loadSubdirs(selected);
    }
  };

  const handleDragDropFolder = (pathStr: string) => {
    setParentPath(pathStr);
    setSelectedFolderPath("");
    loadSubdirs(pathStr);
  };

  // Batch Auto-Style all folders in workspace
  const handleAutoStyleAll = async () => {
    if (subdirs.length === 0 || !window.tintd?.ipcRenderer) return;
    setIsBgStyling(true);
    setToast({
      message: "Running AI auto-style on subfolders...",
      type: "info"
    });
    setTimeout(() => setToast(null), 3000);

    try {
      for (const subdir of subdirs) {
        if (subdir.customization) continue; // skip already styled

        const match = matchIconToFolderName(subdir.name, ALL_ICONS);
        if (match && match.confidence >= 75) {
          const color = suggestComplementaryColor(match.icon);
          const { pixels, dataUrl } = await drawFolderIconToCanvas(color, match.icon.id);

          const result = await window.tintd.ipcRenderer.invoke("applyFolderIcon", {
            folderPath: subdir.path,
            canvasImageData: Array.from(pixels),
            canvasDataUrl: dataUrl,
            selectedIcon: match.icon.id,
            selectedColor: color,
          });

          if (result.success) {
            await window.tintd.ipcRenderer.invoke("watcher:log-activity", {
              folderPath: subdir.path,
              folderName: subdir.name,
              suggestedIcon: match.icon.name,
              appliedColor: color,
              confidence: match.confidence,
              status: "success"
            });
          }
        }
      }
      triggerRefresh();
      setToast({
        message: "Successfully auto-styled matching folders!",
        type: "success"
      });
      setTimeout(() => setToast(null), 4500);
    } catch (err) {
      console.error("Batch auto-style error:", err);
    } finally {
      setIsBgStyling(false);
    }
  };

  // Batch Reset all customized folders in workspace
  const handleResetAll = async () => {
    const customized = subdirs.filter((s) => s.customization);
    if (customized.length === 0 || !window.tintd?.ipcRenderer) return;
    
    if (!confirm("Are you sure you want to reset all folder icons in this directory?")) {
      return;
    }

    setBusy(true);
    try {
      for (const folder of customized) {
        await window.tintd.ipcRenderer.invoke("removeFolderIcon", folder.path);
      }
      triggerRefresh();
      setToast({
        message: "All folders reverted to system default.",
        type: "success"
      });
      setTimeout(() => setToast(null), 4000);
    } catch (err) {
      console.error("Batch reset error:", err);
    } finally {
      setBusy(false);
    }
  };

  // Watcher IPC Event listener
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

              setToast({
                message: `✓ ${folderName} auto-styled with ${match.icon.name} icon!`,
                type: "info",
                iconId: match.icon.id
              });
              setTimeout(() => setToast(null), 5000);

              if (Notification.permission === "granted") {
                new Notification("Folder Auto-Styled", {
                  body: `✓ ${folderName} auto-styled with ${match.icon.name} icon!`,
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

  async function handleRemove(pathStr: string = selectedFolderPath) {
    if (!pathStr.trim()) return;
    setBusy(true);
    try {
      if (!window.tintd?.ipcRenderer) throw new Error("IPC not available");
      const result = await window.tintd.ipcRenderer.invoke("removeFolderIcon", pathStr);
      if (result.success) {
        triggerRefresh();
        setToast({
          message: `Reverted folder icon to system default.`,
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

    const subdir = subdirs.find((s) => s.path === path);
    if (subdir && subdir.customization) {
      setSelectedColor(subdir.customization.color);
      setSelectedIconId(subdir.customization.iconId || "folder");
      setSuggestion(null);
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
    <div className="flex h-screen w-full overflow-hidden bg-[#161616] text-[#dfdfdf]">
      {/* Center Main Column */}
      <div className="flex flex-1 flex-col overflow-hidden">
        
        {/* ── macOS Header Top Bar ── */}
        <header className="relative flex h-14 flex-shrink-0 items-center justify-between border-b border-white/5 bg-[#1a1a1a]/80 px-4 backdrop-blur-sm select-none">
          {/* Subtle bottom gradient line */}
          <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none" />

          {/* Left Side: macOS Dots + Breadcrumbs + Pills */}
          <div className="flex items-center gap-4">
            {/* macOS window dots */}
            <div className="flex items-center gap-1.5 pr-1.5">
              <span className="w-3 h-3 rounded-full bg-[#ff5f56] opacity-90" />
              <span className="w-3 h-3 rounded-full bg-[#ffbd2e] opacity-90" />
              <span className="w-3 h-3 rounded-full bg-[#27c93f] opacity-90" />
            </div>

            {/* Back button (returns to folder grid) */}
            {activeTab !== "folders" && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-lg text-muted-foreground hover:text-white"
                onClick={() => setActiveTab("folders")}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}

            {/* Breadcrumb Workspace Path */}
            <div
              onClick={handleBrowseParent}
              className="flex items-center gap-1.5 px-3 py-1 bg-black/45 border border-white/5 rounded-lg text-xs font-semibold text-muted-foreground hover:bg-black/60 hover:text-white cursor-pointer transition-all max-w-[280px] sm:max-w-[340px] truncate"
              title="Click to change workspace parent directory"
            >
              <FolderOpen className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground/60" />
              <span className="truncate">
                {parentPath ? parentPath.replace(/\\/g, " › ") : "Choose parent folder…"}
              </span>
            </div>

            {/* Pill batch buttons (Only when viewing subdirs) */}
            {parentPath && activeTab === "folders" && (
              <div className="flex items-center gap-2 border-l border-white/5 pl-3">
                <button
                  onClick={handleAutoStyleAll}
                  className="px-2.5 py-1 text-[10px] font-bold text-primary bg-primary/10 border border-primary/20 rounded-full hover:bg-primary/20 transition-all flex items-center gap-1.5"
                  title="Auto-style all matching subdirectories"
                >
                  <Sparkles className="h-3 w-3" />
                  Auto
                </button>
                <button
                  onClick={handleResetAll}
                  className="px-2.5 py-1 text-[10px] font-bold text-muted-foreground bg-white/5 border border-white/5 rounded-full hover:bg-white/10 hover:text-foreground transition-all flex items-center gap-1.5"
                  title="Reset all folder icons in this directory"
                >
                  <RotateCcw className="h-3 w-3" />
                  Reset
                </button>
              </div>
            )}
          </div>

          {/* Right Side: Header Menu Tools (Home, History, Settings) */}
          <div className="flex items-center gap-1">
            {isBgStyling && (
              <Badge variant="outline" className="border-primary/40 text-primary animate-pulse flex items-center gap-1 text-[9px] bg-primary/5 mr-2 rounded-full px-2 py-0.5">
                <Loader2 className="h-2.5 w-2.5 animate-spin" />
                <span>Auto-styling…</span>
              </Badge>
            )}

            <Button
              variant="ghost"
              size="icon"
              className={cn("h-8 w-8 rounded-lg", activeTab === "folders" ? "bg-white/5 text-white" : "text-muted-foreground hover:text-white")}
              onClick={() => setActiveTab("folders")}
              title="Workspace Folders"
            >
              <Home className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className={cn("h-8 w-8 rounded-lg", activeTab === "recent" ? "bg-white/5 text-white" : "text-muted-foreground hover:text-white")}
              onClick={() => setActiveTab("recent")}
              title="Recent Customization History"
            >
              <Clock className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className={cn("h-8 w-8 rounded-lg", activeTab === "settings" ? "bg-white/5 text-white" : "text-muted-foreground hover:text-white")}
              onClick={() => setActiveTab("settings")}
              title="Settings"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </header>

        {/* ── Center Content Area ── */}
        <main className="flex-1 overflow-hidden p-5 flex flex-col gap-4">
          <div key={activeTab} className="flex-1 overflow-hidden tab-transition">
            
            {activeTab === "folders" && (
              <FoldersTab
                parentPath={parentPath}
                subdirs={subdirs}
                selectedFolderPath={selectedFolderPath}
                onFolderSelect={handleFolderSelect}
                onBrowseParent={handleBrowseParent}
                onResetFolder={handleRemove}
                onDragDropFolder={handleDragDropFolder}
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

      {/* Right Customization Panel */}
      <RightPanel
        color={selectedColor}
        onColorChange={setSelectedColor}
        selectedIconId={selectedIconId}
        onIconSelect={setSelectedIconId}
        folderPath={selectedFolderPath}
        onApply={handleApply}
        onRemove={() => handleRemove()}
        busy={busy}
        suggestion={suggestion}
      />

      {/* Floating Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 toast-in">
          <div
            className={`flex items-start gap-3 px-4 py-3 rounded-2xl border shadow-2xl glass max-w-[320px] ${
              toast.type === "success"
                ? "bg-[#0c2e1f]/90 border-emerald-500/20 text-emerald-100"
                : toast.type === "error"
                ? "bg-[#330f14]/90 border-rose-500/20 text-rose-100"
                : "bg-[#0b253b]/90 border-sky-500/20 text-sky-100"
            }`}
          >
            {/* Icon box */}
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-white/10 text-white text-base">
              {toast.iconId === "folder" ? "📁" : toast.iconId?.startsWith("emoji-")
                ? ALL_ICONS.find((i) => i.id === toast.iconId)?.emoji || "💡"
                : <Sparkles className="h-4 w-4" />}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h4 className="text-[8px] font-black uppercase tracking-[0.14em] opacity-70 mb-0.5">
                {toast.type === "success" ? "✓ Applied" : toast.type === "error" ? "✗ Error" : "✦ Notification"}
              </h4>
              <p className="text-[12px] font-semibold leading-snug">{toast.message}</p>
            </div>

            {/* Dismiss */}
            <button
              onClick={() => setToast(null)}
              className="text-white/40 hover:text-white/90 text-xs self-start ml-1"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

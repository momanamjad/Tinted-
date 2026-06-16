import { ipcMain, dialog, BrowserWindow, type OpenDialogOptions } from "electron";
import type { AppDatabase } from "../database.js";
import type { FolderWatcher } from "../watchers/folderWatcher.js";
import { execSync } from "node:child_process";

export function registerWatcherHandlers(
  db: AppDatabase,
  folderWatcher: FolderWatcher,
  getMainWindow: () => BrowserWindow | null
) {
  ipcMain.handle("watcher:start", async (_event, watchPaths: string[]) => {
    try {
      folderWatcher.start(watchPaths);
      db.setWatcherEnabled(true);
      db.setWatcherPaths(watchPaths);
      return { success: true, watching: watchPaths };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle("watcher:stop", async (_event, watchPath?: string) => {
    try {
      if (watchPath) {
        folderWatcher.stop(watchPath);
        const settings = db.getWatcherSettings();
        const updatedPaths = settings.watchPaths.filter((p) => p !== watchPath);
        db.setWatcherPaths(updatedPaths);
        // If there are no more paths, disable the watcher
        if (updatedPaths.length === 0) {
          db.setWatcherEnabled(false);
        }
      } else {
        folderWatcher.stop();
        db.setWatcherEnabled(false);
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle("watcher:get-status", async () => {
    try {
      const settings = db.getWatcherSettings();
      const activity = db.getWatcherActivity(10);
      return {
        success: true,
        isActive: settings.isEnabled,
        watchingPaths: settings.watchPaths,
        autoStyleDelay: settings.autoStyleDelay,
        activity
      };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle("watcher:set-delay", async (_event, delaySeconds: number) => {
    try {
      const delayMs = Math.max(1, Math.min(10, delaySeconds)) * 1000;
      folderWatcher.setAutoStyleDelay(delayMs);
      db.setWatcherDelay(delayMs);
      return { success: true, delayMs };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle("watcher:log-activity", async (_event, activity) => {
    try {
      db.addWatcherActivity(activity);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle("watcher:select-directory", async () => {
    try {
      const win = getMainWindow();
      const options: OpenDialogOptions = {
        title: "Select Folder to Watch",
        properties: ["openDirectory"]
      };

      const result = win
        ? await dialog.showOpenDialog(win, options)
        : await dialog.showOpenDialog(options);

      return result.canceled ? null : result.filePaths[0];
    } catch (err: any) {
      console.error("watcher:select-directory error:", err);
      return null;
    }
  });

  ipcMain.handle("restartExplorer", async () => {
    try {
      console.log("[EXPLORER RESTART] Restarting Windows Explorer...");
      
      // Kill Explorer
      execSync("taskkill /F /IM explorer.exe", { stdio: "pipe" });
      
      // Wait 500ms for cleanup
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      // Restart Explorer
      execSync("start explorer.exe", { stdio: "pipe" });
      
      console.log("[EXPLORER RESTART] ✓ Explorer restarted successfully");
      
      return { success: true };
    } catch (err: any) {
      console.error("[EXPLORER RESTART] Error:", err.message);
      return { success: false, error: err.message };
    }
  });
}

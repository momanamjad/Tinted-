import { BrowserWindow } from "electron";
import chokidar, { FSWatcher } from "chokidar";
import path from "node:path";
import fs from "node:fs";

export class FolderWatcher {
  private mainWindow: BrowserWindow | null = null;
  private watchers = new Map<string, FSWatcher>();
  private autoStyleDelay: number = 3000;
  private processingFolders = new Set<string>();
  private onDeletedCallback: ((dirPath: string) => Promise<void> | void) | null = null;
  private onNewFolderCallback: ((folderPath: string) => Promise<void> | void) | null = null;

  constructor(mainWindow: BrowserWindow | null = null) {
    this.mainWindow = mainWindow;
  }

  setOnFolderDeleted(callback: (dirPath: string) => Promise<void> | void): void {
    this.onDeletedCallback = callback;
  }

  setOnNewFolder(callback: (folderPath: string) => Promise<void> | void): void {
    this.onNewFolderCallback = callback;
  }

  setMainWindow(mainWindow: BrowserWindow) {
    this.mainWindow = mainWindow;
  }

  setAutoStyleDelay(delayMs: number): void {
    this.autoStyleDelay = delayMs;
  }

  start(watchPaths: string[]): void {
    // Stop any paths that are not in the new list
    for (const activePath of this.watchers.keys()) {
      if (!watchPaths.includes(activePath)) {
        this.stop(activePath);
      }
    }

    // Start watching any new paths
    for (const watchPath of watchPaths) {
      if (!this.watchers.has(watchPath)) {
        this.setupWatcher(watchPath);
      }
    }
  }

  stop(watchPath?: string): void {
    if (watchPath) {
      const watcher = this.watchers.get(watchPath);
      if (watcher) {
        watcher.close().catch((err: any) => console.error("Error closing watcher:", err));
        this.watchers.delete(watchPath);
      }
    } else {
      for (const watcher of this.watchers.values()) {
        watcher.close().catch((err: any) => console.error("Error closing watcher:", err));
      }
      this.watchers.clear();
    }
  }

  isWatching(watchPath: string): boolean {
    return this.watchers.has(watchPath);
  }

  getWatchedPaths(): string[] {
    return Array.from(this.watchers.keys());
  }

  private setupWatcher(watchPath: string): void {
    try {
      if (!fs.existsSync(watchPath)) {
        console.warn(`Watch path does not exist: ${watchPath}`);
        return;
      }

      const watcher = chokidar.watch(watchPath, {
        ignored: /(^|[\/\\])\..|node_modules|\.tmp$/, // ignore hidden files/folders, node_modules, temp files
        persistent: true,
        depth: 0, // CRITICAL: Only watch the direct children of the directory
        ignoreInitial: true // DO NOT trigger addDir for existing folders
      });

      watcher.on("addDir", async (dirPath) => {
        await this.onNewFolder(dirPath);
      });

      watcher.on("unlinkDir", async (dirPath) => {
        if (this.onDeletedCallback) {
          try {
            await this.onDeletedCallback(dirPath);
          } catch (err) {
            console.error("Error in onDeletedCallback:", err);
          }
        }
      });

      watcher.on("error", (error) => {
        console.error(`Watcher error for path ${watchPath}:`, error);
      });

      this.watchers.set(watchPath, watcher);
    } catch (err: any) {
      console.error(`Failed to setup watcher for path ${watchPath}:`, err);
    }
  }

  private isSystemFolder(folderPath: string): boolean {
    const name = path.basename(folderPath).toLowerCase();
    const normalized = folderPath.toLowerCase();

    // System folder names
    const systemNames = [
      "windows",
      "system32",
      "program files",
      "program files (x86)",
      "appdata",
      "recycle.bin",
      "common files",
      "microsoft"
    ];

    if (systemNames.some((sys) => name === sys || normalized.includes(`\\${sys}\\`) || normalized.endsWith(`\\${sys}`))) {
      return true;
    }

    // Hidden files or directories (starting with dot)
    if (name.startsWith(".")) {
      return true;
    }

    return false;
  }

  private isSkippableFolder(folderPath: string, folderName: string): boolean {
    // Skip Windows "New folder" placeholder
    if (folderName === "New folder" || folderName.startsWith("New folder (")) {
      return true;
    }

    // Skip system folders
    if (this.isSystemFolder(folderPath)) {
      return true;
    }

    // Skip hidden folders
    if (folderName.startsWith(".")) {
      return true;
    }

    // Skip temp folders
    if (
      folderName.toLowerCase().includes("temp") ||
      folderName.toLowerCase().includes("tmp")
    ) {
      return true;
    }

    return false;
  }

  private async onNewFolder(folderPath: string): Promise<void> {
    const folderName = path.basename(folderPath);

    if (this.isSkippableFolder(folderPath, folderName)) {
      return;
    }



    if (this.processingFolders.has(folderPath)) {
      return;
    }

    this.processingFolders.add(folderPath);

    try {
      // Calculate stability target: how many 1s checks of identical modification time are needed
      const targetStableCount = Math.max(1, Math.round(this.autoStyleDelay / 1000));
      let lastModTime = 0;
      try {
        if (fs.existsSync(folderPath)) {
          lastModTime = fs.statSync(folderPath).mtimeMs;
        } else {
          return;
        }
      } catch (e: any) {

        return;
      }

      let stableCount = 0;
      // Hard cap: never wait more than autoStyleDelay * 3 (min 6s, max 15s)
      // Without this, any write inside the folder (desktop.ini, attrib, .tintd-icons)
      // resets stableCount to 0 and the loop can run for MINUTES.
      const maxWaitMs = Math.min(15000, Math.max(6000, this.autoStyleDelay * 3));
      const startTime = Date.now();

      while (stableCount < targetStableCount) {
        // Break out if we've been waiting too long regardless of stability
        if (Date.now() - startTime >= maxWaitMs) {
          break;
        }

        await new Promise((resolve) => setTimeout(resolve, 1000));

        if (!fs.existsSync(folderPath)) {
          return;
        }

        try {
          const currentModTime = fs.statSync(folderPath).mtimeMs;
          if (currentModTime === lastModTime) {
            stableCount++;
          } else {
            stableCount = 0;
            lastModTime = currentModTime;
          }
        } catch (e: any) {

          return;
        }
      }


      const currentFolderName = path.basename(folderPath);
      if (this.isSkippableFolder(folderPath, currentFolderName)) {
        return;
      }



      // Fire the new-folder callback (used by main.ts to run attrib + refresh on parent directory)
      if (this.onNewFolderCallback) {
        try {
          await this.onNewFolderCallback(folderPath);
        } catch (err) {
          console.error("[WATCHER] onNewFolderCallback error:", err);
        }
      }

      // Send message to renderer
      if (this.mainWindow && !this.mainWindow.isDestroyed()) {
        this.mainWindow.webContents.send("watcher:new-folder", {
          folderPath,
          folderName: currentFolderName
        });
      }
    } catch (err: any) {
      console.error(`[WATCHER DEBUG] [ERROR] Error handling new folder detection:`, err);
    } finally {
      this.processingFolders.delete(folderPath);
    }
  }
}

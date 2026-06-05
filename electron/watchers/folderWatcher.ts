import { BrowserWindow } from "electron";
import chokidar, { FSWatcher } from "chokidar";
import path from "node:path";
import fs from "node:fs";

export class FolderWatcher {
  private mainWindow: BrowserWindow | null = null;
  private watchers = new Map<string, FSWatcher>();
  private autoStyleDelay: number = 3000;

  constructor(mainWindow: BrowserWindow | null = null) {
    this.mainWindow = mainWindow;
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

      console.log(`[WATCHER DEBUG] Setting up Chokidar on: ${watchPath}`);
      const watcher = chokidar.watch(watchPath, {
        ignored: /(^|[\/\\])\..|node_modules|\.tmp$/, // ignore hidden files/folders, node_modules, temp files
        persistent: true,
        depth: 0, // CRITICAL: Only watch the direct children of the directory
        ignoreInitial: true // DO NOT trigger addDir for existing folders
      });

      watcher.on("addDir", async (dirPath) => {
        console.log(`[WATCHER DEBUG] addDir event fired for: ${dirPath}`);
        await this.onNewFolder(dirPath);
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

  private async onNewFolder(folderPath: string): Promise<void> {
    try {
      console.log(`[WATCHER DEBUG] onNewFolder called for: ${folderPath}, waiting ${this.autoStyleDelay}ms`);
      // Wait for the user to finish typing the folder name
      await new Promise((resolve) => setTimeout(resolve, this.autoStyleDelay));

      if (!fs.existsSync(folderPath)) {
        console.log(`[WATCHER DEBUG] Folder does not exist after delay: ${folderPath}`);
        return; // Skip if deleted before we style
      }

      if (this.isSystemFolder(folderPath)) {
        console.log(`[WATCHER DEBUG] Ignored system folder: ${folderPath}`);
        return; // Ignore system folders
      }

      const folderName = path.basename(folderPath);
      console.log(`[WATCHER DEBUG] Folder exists, sending watcher:new-folder IPC for: ${folderPath} (${folderName})`);

      // Send message to renderer
      if (this.mainWindow && !this.mainWindow.isDestroyed()) {
        this.mainWindow.webContents.send("watcher:new-folder", {
          folderPath,
          folderName
        });
      }
    } catch (err: any) {
      console.error("Error handling new folder detection:", err);
    }
  }
}

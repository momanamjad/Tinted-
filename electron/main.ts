import { app, BrowserWindow, dialog, ipcMain, session, shell, type OpenDialogOptions } from "electron";
import log from "electron-log";
import path from "node:path";
import { fileURLToPath } from "node:url";
import electronUpdaterPkg from "electron-updater";
const { autoUpdater } = electronUpdaterPkg;
import { AppDatabase } from "./database.js";
import { applyFolderIcon, resetFolderIcon } from "./folder-icons.js";
import type { ApplyIconRequest, Settings, SettingValue } from "./types.js";
import { registerIconHandlers } from "./handlers/iconHandlers.js";
import fs from "node:fs/promises";
import { FolderWatcher } from "./watchers/folderWatcher.js";
import { registerWatcherHandlers } from "./handlers/watcherHandlers.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow: BrowserWindow | null = null;
let db: AppDatabase;
let folderWatcher: FolderWatcher;

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 1200,
    minHeight: 800,
    title: "Tintd Pro",
    icon: path.join(__dirname, "../build/icon.ico"),
    backgroundColor: "#09090b",
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      backgroundThrottling: false
    }
  });

  mainWindow.once("ready-to-show", () => {
    mainWindow?.show();
    if (mainWindow) {
      folderWatcher.setMainWindow(mainWindow);
    }
  });

  if (app.isPackaged) {
    await mainWindow.loadFile(path.join(__dirname, "../dist/index.html"));
  } else {
    await mainWindow.loadURL("http://localhost:5173");
    mainWindow.webContents.openDevTools({ mode: "detach" });
  }
}

function registerIpc() {
  ipcMain.handle("settings:get", () => db.getSettings());

  ipcMain.handle(
    "settings:set",
    (_event, key: keyof Settings, value: SettingValue) => db.setSetting(key, value)
  );

  ipcMain.handle("folders:select", async () => {
    const options: OpenDialogOptions = {
      title: "Choose a folder",
      properties: ["openDirectory"]
    };
    const result = mainWindow
      ? await dialog.showOpenDialog(mainWindow, options)
      : await dialog.showOpenDialog(options);

    return result.canceled ? null : result.filePaths[0];
  });

  ipcMain.handle("folders:reveal", async (_event, folderPath: string) => {
    await shell.openPath(folderPath);
  });

  ipcMain.handle("folders:list-subdirs", async (_event, parentPath: string) => {
    try {
      const entries = await fs.readdir(parentPath, { withFileTypes: true });
      const subdirs = [];
      for (const entry of entries) {
        if (entry.isDirectory()) {
          const fullPath = path.join(parentPath, entry.name);
          // Skip hidden/system folders
          if (entry.name.startsWith(".") || entry.name.startsWith("$")) continue;
          
          // Check database for existing customization
          const customization = db.getFolderCustomization(fullPath);
          subdirs.push({
            name: entry.name,
            path: fullPath,
            customization: customization ? {
              color: customization.selectedColor,
              iconId: customization.selectedIcon,
              icoPath: customization.icoPath
            } : null
          });
        }
      }
      return { success: true, subdirs };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle("icons:history", () => {
    const list = db.getCustomizationHistory();
    return list.map((item: any) => ({
      id: item.id,
      folderPath: item.folderPath,
      color: item.selectedColor,
      iconPath: item.icoPath,
      status: "applied",
      updatedAt: item.appliedDate,
      message: `Icon: ${item.selectedIcon}`,
      iconId: item.selectedIcon
    }));
  });

  registerIconHandlers(db);
  registerWatcherHandlers(db, folderWatcher, () => mainWindow);

  ipcMain.handle("icons:apply", async (_event, request: ApplyIconRequest) => {
    const record = await applyFolderIcon(request);
    db.setSetting("lastColor", request.color);
    return db.upsertIconRecord(record);
  });

  ipcMain.handle("icons:reset", async (_event, folderPath: string) => {
    const desktopIniPath = path.join(folderPath, "desktop.ini");
    try {
      const { execFile } = await import("node:child_process");
      const { promisify } = await import("node:util");
      await promisify(execFile)("attrib", ["-h", "-s", desktopIniPath]);
      await fs.rm(desktopIniPath, { force: true });
    } catch (e) {}

    try {
      const { execFile } = await import("node:child_process");
      const { promisify } = await import("node:util");
      await promisify(execFile)("attrib", ["-r", "-s", folderPath]);
    } catch (e) {}

    const customization = db.getFolderCustomization(folderPath);
    if (customization && customization.icoPath) {
      await fs.rm(customization.icoPath, { force: true });
    }
    db.removeFolderCustomization(folderPath);

    const record = await resetFolderIcon(folderPath);
    return db.upsertIconRecord(record);
  });
}

app.whenReady().then(async () => {
  log.initialize();
  
  const defaultWatchPaths: string[] = [];
  try {
    defaultWatchPaths.push(app.getPath("desktop"));
  } catch (e) {}
  try {
    defaultWatchPaths.push(app.getPath("documents"));
  } catch (e) {}
  try {
    defaultWatchPaths.push(app.getPath("downloads"));
  } catch (e) {}

  db = await AppDatabase.open(app.getPath("userData"), defaultWatchPaths);
  folderWatcher = new FolderWatcher(null);

  folderWatcher.setOnFolderDeleted(async (dirPath) => {
    try {
      // Double check if the folder actually got deleted/renamed (avoid spurious Chokidar events)
      let exists = false;
      try {
        await fs.access(dirPath);
        exists = true;
      } catch (err: any) {
        // If the error code is NOT ENOENT, it means the folder still exists but might be locked or inaccessible
        if (err.code !== "ENOENT") {
          exists = true;
        }
      }

      if (exists) {
        return;
      }

      const customization = db.getFolderCustomization(dirPath);
      if (customization && customization.icoPath) {
        await fs.rm(customization.icoPath, { force: true });
      }
      db.removeFolderCustomization(dirPath);
      
      // Notify renderer so it can refresh its folders list
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send("watcher:folder-deleted", { folderPath: dirPath });
      }
    } catch (e) {
      log.error("Error cleaning up deleted folder customization:", e);
    }
  });

  // Set CSP via session headers (works correctly with file:// protocol)
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          app.isPackaged
            ? "default-src 'self' file:; script-src 'self' 'unsafe-inline' 'unsafe-eval' file:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com file:; font-src 'self' https://fonts.gstatic.com; connect-src 'self'; img-src 'self' blob: data: file:;"
            : "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' http://localhost:5173; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; connect-src 'self' ws://localhost:5173 http://localhost:5173; img-src 'self' blob: data:;"
        ]
      }
    });
  });

  registerIpc();
  await createWindow();

  // Load watcher settings on boot
  const wSettings = db.getWatcherSettings();
  folderWatcher.setAutoStyleDelay(wSettings.autoStyleDelay);
  if (wSettings.isEnabled) {
    folderWatcher.start(wSettings.watchPaths);
  }

  app.on("activate", async () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      await createWindow();
    }
  });

  // Configure auto-updater
  autoUpdater.logger = log;
  autoUpdater.autoDownload = true;
  
  // Check for updates after a short delay so the app UI loads first
  setTimeout(() => {
    autoUpdater.checkForUpdatesAndNotify().catch(err => log.error("Failed to check for updates:", err));
  }, 5000);

  // Prompt the user when an update is downloaded
  autoUpdater.on('update-downloaded', (info) => {
    dialog.showMessageBox({
      type: 'info',
      title: 'Update Ready',
      message: 'A new version of Tintd Pro is ready. Restart the application to apply the updates.',
      buttons: ['Restart', 'Later']
    }).then((result) => {
      if (result.response === 0) {
        autoUpdater.quitAndInstall();
      }
    });
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

import { app, BrowserWindow, dialog, ipcMain, shell, type OpenDialogOptions } from "electron";
import log from "electron-log";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { AppDatabase } from "./database.js";
import { applyFolderIcon, resetFolderIcon } from "./folder-icons.js";
import type { ApplyIconRequest, Settings, SettingValue } from "./types.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow: BrowserWindow | null = null;
let db: AppDatabase;

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
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  mainWindow.once("ready-to-show", () => mainWindow?.show());

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

  ipcMain.handle("icons:history", () => db.getIconHistory());

  ipcMain.handle("icons:apply", async (_event, request: ApplyIconRequest) => {
    const record = await applyFolderIcon(request);
    db.setSetting("lastColor", request.color);
    return db.upsertIconRecord(record);
  });

  ipcMain.handle("icons:reset", async (_event, folderPath: string) => {
    const record = await resetFolderIcon(folderPath);
    return db.upsertIconRecord(record);
  });
}

app.whenReady().then(async () => {
  log.initialize();
  db = await AppDatabase.open(app.getPath("userData"));
  registerIpc();
  await createWindow();

  app.on("activate", async () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      await createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

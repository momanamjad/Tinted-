import { contextBridge, ipcRenderer } from "electron";
import type {
  ApplyIconRequest,
  FolderIconRecord,
  Settings,
  SettingValue
} from "./types.js";

const api = {
  getSettings: () => ipcRenderer.invoke("settings:get") as Promise<Settings>,
  setSetting: (key: keyof Settings, value: SettingValue) =>
    ipcRenderer.invoke("settings:set", key, value) as Promise<Settings>,
  selectFolder: () => ipcRenderer.invoke("folders:select") as Promise<string | null>,
  applyIcon: (request: ApplyIconRequest) =>
    ipcRenderer.invoke("icons:apply", request) as Promise<FolderIconRecord>,
  resetIcon: (folderPath: string) =>
    ipcRenderer.invoke("icons:reset", folderPath) as Promise<FolderIconRecord>,
  getIconHistory: () =>
    ipcRenderer.invoke("icons:history") as Promise<FolderIconRecord[]>,
  revealFolder: (folderPath: string) =>
    ipcRenderer.invoke("folders:reveal", folderPath) as Promise<void>
};

contextBridge.exposeInMainWorld("tintd", api);

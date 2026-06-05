import type {
  ApplyIconRequest,
  FolderIconRecord,
  Settings,
  SettingValue
} from "./index";

declare global {
  interface Window {
    tintd: {
      ipcRenderer: {
        invoke(channel: string, ...args: any[]): Promise<any>;
        on(channel: string, listener: (event: any, ...args: any[]) => void): void;
        send(channel: string, ...args: any[]): void;
      };
      getPathForFile(file: File): string;
    };
  }
}

export {};

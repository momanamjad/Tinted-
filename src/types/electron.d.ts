import type {
  ApplyIconRequest,
  FolderIconRecord,
  Settings,
  SettingValue
} from "./index";

declare global {
  interface Window {
    tintd: {
      getSettings: () => Promise<Settings>;
      setSetting: (key: keyof Settings, value: SettingValue) => Promise<Settings>;
      selectFolder: () => Promise<string | null>;
      applyIcon: (request: ApplyIconRequest) => Promise<FolderIconRecord>;
      resetIcon: (folderPath: string) => Promise<FolderIconRecord>;
      getIconHistory: () => Promise<FolderIconRecord[]>;
      revealFolder: (folderPath: string) => Promise<void>;
    };
  }
}

export {};

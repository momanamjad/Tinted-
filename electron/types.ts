export type ThemeMode = "dark" | "light";

export type IconStyle = "classic" | "flat";

export type Settings = {
  theme: ThemeMode;
  autoRefreshExplorer: boolean;
  lastColor: string;
  iconStyle: IconStyle;
  keepIconCopy: boolean;
};

export type SettingValue = Settings[keyof Settings];

export type ApplyIconRequest = {
  folderPath: string;
  color: string;
  autoRefreshExplorer: boolean;
};

export type FolderIconStatus = "applied" | "reset" | "failed";

export type FolderIconRecord = {
  id: number;
  folderPath: string;
  color: string;
  iconPath: string;
  status: FolderIconStatus;
  updatedAt: string;
  message: string;
};

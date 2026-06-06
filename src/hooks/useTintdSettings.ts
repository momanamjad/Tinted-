import { useCallback, useEffect, useMemo, useState } from "react";
import type { Settings, SettingValue } from "@/types";

const FALLBACK_SETTINGS: Settings = {
  theme: "dark",
  autoRefreshExplorer: true,
  lastColor: "#22c55e",
  iconStyle: "classic",
  keepIconCopy: true,
  autoApply: false
};

export function useTintdSettings() {
  const [settings, setSettings] = useState<Settings>(FALLBACK_SETTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!window.tintd?.ipcRenderer) {
      console.error("IPC bridge not available");
      setLoading(false);
      return;
    }

    window.tintd.ipcRenderer
      .invoke("settings:get")
      .then(setSettings)
      .catch((err: any) => console.error("Failed to get settings", err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", settings.theme === "dark");
  }, [settings.theme]);

  const updateSetting = useCallback(
    async <K extends keyof Settings>(key: K, value: SettingValue) => {
      if (!window.tintd?.ipcRenderer) {
        console.error("IPC bridge not available");
        return FALLBACK_SETTINGS;
      }

      const next = (await window.tintd.ipcRenderer.invoke("settings:set", key, value)) as Settings;
      setSettings(next);
      return next;
    },
    []
  );

  return useMemo(
    () => ({
      settings,
      loading,
      updateSetting
    }),
    [loading, settings, updateSetting]
  );
}

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Settings, SettingValue } from "@/types";

const FALLBACK_SETTINGS: Settings = {
  theme: "dark",
  autoRefreshExplorer: true,
  lastColor: "#22c55e",
  iconStyle: "classic",
  keepIconCopy: true
};

export function useTintdSettings() {
  const [settings, setSettings] = useState<Settings>(FALLBACK_SETTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.tintd
      .getSettings()
      .then(setSettings)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", settings.theme === "dark");
  }, [settings.theme]);

  const updateSetting = useCallback(
    async <K extends keyof Settings>(key: K, value: SettingValue) => {
      const next = await window.tintd.setSetting(key, value);
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

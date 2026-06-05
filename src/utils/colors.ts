export const TINT_PRESETS = [
  "#22c55e",
  "#06b6d4",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#f43f5e",
  "#f97316",
  "#eab308",
  "#84cc16",
  "#14b8a6",
  "#64748b",
  "#f8fafc"
];

export function isHexColor(value: string) {
  return /^#(?:[0-9a-fA-F]{3}){1,2}$/.test(value);
}

export function normalizeHexColor(value: string) {
  const prefixed = value.startsWith("#") ? value : `#${value}`;
  return prefixed.toLowerCase();
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(value));
}

/** Adjust hex color brightness by amount (-255 to +255) */
export function adjustBrightness(hex: string, amount: number): string {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.min(255, Math.max(0, (num >> 16) + amount));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0xff) + amount));
  const b = Math.min(255, Math.max(0, (num & 0xff) + amount));
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
}

/** Get highly visible contrasting color based on base color luminance */
export function getContrastColor(hex: string): string {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  if (luminance > 0.6) {
    const darkShade = adjustBrightness(hex, -110);
    const numDark = parseInt(darkShade.replace("#", ""), 16);
    const dr = (numDark >> 16) & 255;
    const dg = (numDark >> 8) & 255;
    const db = numDark & 255;
    const darkLuminance = (0.299 * dr + 0.587 * dg + 0.114 * db) / 255;
    if (darkLuminance > 0.35) {
      return "#1e293b"; // Fallback to Slate 800 for high visibility on very light folders
    }
    return darkShade;
  } else {
    return "#ffffff"; // Pure white on dark folders
  }
}

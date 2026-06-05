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

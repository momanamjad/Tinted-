import { useState, useEffect } from "react";
import { cn } from "@/utils/cn";
import { isHexColor, normalizeHexColor } from "@/utils/colors";

type ColorPickerProps = {
  color: string;
  onChange: (color: string) => void;
};

// HSL Helper: HEX -> HSL
function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const num = parseInt(hex.replace("#", ""), 16) || 0;
  let r = (num >> 16) & 255;
  let g = (num >> 8) & 255;
  let b = num & 255;

  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

// HSL Helper: HSL -> HEX
function hslToHex(h: number, s: number, l: number): string {
  h /= 360;
  s /= 100;
  l /= 100;

  let r = l;
  let g = l;
  let b = l;

  if (s !== 0) {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;

    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  const toHex = (x: number) => {
    const hex = Math.round(x * 255).toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

// macOS style 10x5 color presets grid (50 colors)
const PRESET_CIRCLES = [
  // Row 1: Salmon, Reds, Soft Corals
  "#ff5a5a", "#ff7b7b", "#ff9c9c", "#ffbdbd", "#ffdede", "#ff8f5a", "#ffac7b", "#ffc99c", "#ffe6bd", "#fff2de",
  // Row 2: Yellows, Peach, Warm Golds
  "#ffa500", "#ffbc42", "#ffd275", "#ffe9a7", "#fff6d9", "#ffd700", "#ffe24a", "#ffec8b", "#fff5c2", "#fffaf0",
  // Row 3: Greens, Mint, Limes
  "#22c55e", "#4ade80", "#86efac", "#bbf7d0", "#dcfce7", "#84cc16", "#a3e635", "#c2f170", "#d9f99d", "#f7fee7",
  // Row 4: Blues, Cyans, Sky
  "#3b82f6", "#60a5fa", "#93c5fd", "#bfdbfe", "#eff6ff", "#06b6d4", "#22d3ee", "#67e8f9", "#a5f3fc", "#ecfeff",
  // Row 5: Purples, Pinks, Magentas
  "#a855f7", "#c084fc", "#d8b4fe", "#e9d5ff", "#f3e8ff", "#ec4899", "#f472b6", "#f9a8d4", "#fbcfe8", "#fdf2f8"
];

export function ColorPicker({ color, onChange }: ColorPickerProps) {
  const [hexInput, setHexInput] = useState(color);
  const [inputError, setInputError] = useState(false);

  // Convert current color to HSL values for sliders
  const { h, s, l } = hexToHsl(color);

  useEffect(() => {
    setHexInput(color);
    setInputError(false);
  }, [color]);

  function handleHexChange(value: string) {
    setHexInput(value);
    const normalized = normalizeHexColor(value);
    if (isHexColor(normalized)) {
      setInputError(false);
      onChange(normalized);
    } else {
      setInputError(true);
    }
  }

  function handleHslChange(newH: number, newS: number, newL: number) {
    const hex = hslToHex(newH, newS, newL);
    setHexInput(hex);
    setInputError(false);
    onChange(hex);
  }

  function handlePresetClick(preset: string) {
    setHexInput(preset);
    setInputError(false);
    onChange(preset);
  }

  return (
    <div className="space-y-4 pt-1">
      {/* HEX Input row with Circle Preview */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1">
          <div className="relative flex-1">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-mono font-bold text-muted-foreground/60 select-none">
              #
            </span>
            <input
              id="color-hex-input"
              value={hexInput.replace(/^#/, "")}
              onChange={(e) => handleHexChange(`#${e.target.value}`)}
              maxLength={7}
              placeholder="D95026"
              spellCheck={false}
              className={cn(
                "h-9 w-full rounded-lg border bg-background/50 pl-7 pr-3 font-mono text-sm font-bold uppercase outline-none transition-all",
                inputError
                  ? "border-destructive/60 focus:ring-1 focus:ring-destructive/30 text-destructive bg-destructive/5"
                  : "border-border/60 focus:border-primary/60 focus:ring-2 focus:ring-primary/10"
              )}
            />
          </div>
        </div>

        {/* Circular previews (history/shades) */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <div
            className="h-[26px] w-[26px] rounded-full border border-black/20 shadow-md ring-2 ring-primary/40 transition-transform duration-200 hover:scale-110"
            style={{ backgroundColor: color }}
            title="Selected Color"
          />
          <div
            className="h-[22px] w-[22px] rounded-full border border-black/10 shadow-sm cursor-pointer transition-transform duration-200 hover:scale-110"
            style={{ backgroundColor: hslToHex(h, s, Math.max(10, l - 12)) }}
            onClick={() => handlePresetClick(hslToHex(h, s, Math.max(10, l - 12)))}
            title="Darker Shade"
          />
          <div
            className="h-[22px] w-[22px] rounded-full border border-black/10 shadow-sm cursor-pointer transition-transform duration-200 hover:scale-110"
            style={{ backgroundColor: hslToHex(h, s, Math.min(95, l + 12)) }}
            onClick={() => handlePresetClick(hslToHex(h, s, Math.min(95, l + 12)))}
            title="Lighter Shade"
          />
        </div>
      </div>

      {/* ── HSL SLIDERS ── */}
      <div className="space-y-3.5 py-1">
        {/* Hue Slider */}
        <div className="space-y-1">
          <div className="flex justify-between text-[9px] font-bold uppercase tracking-[0.12em] text-muted-foreground/60">
            <span>Hue</span>
            <span className="tabular-nums">{h}°</span>
          </div>
          <div className="relative flex items-center">
            <input
              type="range"
              min="0"
              max="360"
              value={h}
              onChange={(e) => handleHslChange(Number(e.target.value), s, l)}
              className="h-2.5 w-full cursor-pointer appearance-none rounded-lg focus:outline-none"
              style={{
                background: "linear-gradient(to right, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)"
              }}
            />
          </div>
        </div>

        {/* Saturation Slider */}
        <div className="space-y-1">
          <div className="flex justify-between text-[9px] font-bold uppercase tracking-[0.12em] text-muted-foreground/60">
            <span>Saturation</span>
            <span className="tabular-nums">{s}%</span>
          </div>
          <div className="relative flex items-center">
            <input
              type="range"
              min="0"
              max="100"
              value={s}
              onChange={(e) => handleHslChange(h, Number(e.target.value), l)}
              className="h-2.5 w-full cursor-pointer appearance-none rounded-lg focus:outline-none"
              style={{
                background: `linear-gradient(to right, ${hslToHex(h, 0, l)} 0%, ${hslToHex(h, 100, l)} 100%)`
              }}
            />
          </div>
        </div>

        {/* Brightness Slider */}
        <div className="space-y-1">
          <div className="flex justify-between text-[9px] font-bold uppercase tracking-[0.12em] text-muted-foreground/60">
            <span>Brightness</span>
            <span className="tabular-nums">{l}%</span>
          </div>
          <div className="relative flex items-center">
            <input
              type="range"
              min="5"
              max="95"
              value={l}
              onChange={(e) => handleHslChange(h, s, Number(e.target.value))}
              className="h-2.5 w-full cursor-pointer appearance-none rounded-lg focus:outline-none"
              style={{
                background: `linear-gradient(to right, #000000 0%, ${hslToHex(h, s, 50)} 50%, #ffffff 100%)`
              }}
            />
          </div>
        </div>
      </div>

      {/* ── PRESETS 10x5 GRID ── */}
      <div>
        <p className="mb-2 text-[9px] font-bold uppercase tracking-[0.12em] text-muted-foreground/50">
          Presets
        </p>
        <div className="grid grid-cols-10 gap-1.5">
          {PRESET_CIRCLES.map((c) => {
            const isSelected = color.toLowerCase() === c.toLowerCase();
            return (
              <button
                key={c}
                title={c}
                onClick={() => handlePresetClick(c)}
                className={cn(
                  "h-[18px] w-[18px] rounded-full border border-black/15 shadow-sm transition-transform hover:scale-125 focus:outline-none",
                  isSelected && "ring-2 ring-white/70 scale-110 shadow-md"
                )}
                style={{ backgroundColor: c }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

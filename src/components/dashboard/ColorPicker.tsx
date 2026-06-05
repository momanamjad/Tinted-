import { useState } from "react";
import { cn } from "@/utils/cn";
import { TINT_PRESETS, isHexColor, normalizeHexColor } from "@/utils/colors";

type ColorPickerProps = {
  color: string;
  onChange: (color: string) => void;
};

export function ColorPicker({ color, onChange }: ColorPickerProps) {
  const [hexInput, setHexInput] = useState(color);
  const [inputError, setInputError] = useState(false);

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

  function handlePresetClick(preset: string) {
    setHexInput(preset);
    setInputError(false);
    onChange(preset);
  }

  // Full extended palette – 60 colors
  const EXTENDED_PALETTE = [
    // Reds / Pinks
    "#fca5a5", "#f87171", "#ef4444", "#dc2626", "#b91c1c",
    "#fda4af", "#fb7185", "#f43f5e", "#e11d48", "#be123c",
    // Oranges / Yellows
    "#fdba74", "#fb923c", "#f97316", "#ea580c", "#c2410c",
    "#fde68a", "#fcd34d", "#fbbf24", "#f59e0b", "#d97706",
    // Greens
    "#bbf7d0", "#86efac", "#4ade80", "#22c55e", "#16a34a",
    "#bef264", "#a3e635", "#84cc16", "#65a30d", "#4d7c0f",
    // Blues / Cyans
    "#bae6fd", "#7dd3fc", "#38bdf8", "#0ea5e9", "#0284c7",
    "#a5f3fc", "#67e8f9", "#22d3ee", "#06b6d4", "#0891b2",
    // Purples / Violets
    "#ddd6fe", "#c4b5fd", "#a78bfa", "#8b5cf6", "#7c3aed",
    "#e879f9", "#d946ef", "#c026d3", "#a21caf", "#86198f",
    // Grays
    "#f1f5f9", "#cbd5e1", "#94a3b8", "#64748b", "#334155",
    "#f9fafb", "#e5e7eb", "#9ca3af", "#6b7280", "#374151",
  ];

  return (
    <div className="space-y-5">
      {/* Color preview strip */}
      <div className="relative h-6 w-full rounded-lg overflow-hidden border border-border/40 shadow-inner">
        <div
          className="absolute inset-0 transition-all duration-200"
          style={{ backgroundColor: isHexColor(hexInput) ? hexInput : color }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent pointer-events-none" />
      </div>

      {/* Full palette grid */}
      <div>
        <p className="mb-2 text-[9px] font-bold uppercase tracking-[0.12em] text-muted-foreground/50">
          Palette
        </p>
        <div className="grid grid-cols-10 gap-[3px]">
          {EXTENDED_PALETTE.map((c) => (
            <button
              key={c}
              title={c}
              onClick={() => handlePresetClick(c)}
              className={cn(
                "color-swatch relative h-5 w-full rounded-sm",
                color === c && "selected"
              )}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </div>

      {/* Preset swatches */}
      <div>
        <p className="mb-2 text-[9px] font-bold uppercase tracking-[0.12em] text-muted-foreground/50">
          Presets
        </p>
        <div className="grid grid-cols-6 gap-2">
          {TINT_PRESETS.map((c) => (
            <button
              key={c}
              title={c}
              onClick={() => handlePresetClick(c)}
              className={cn(
                "color-swatch relative h-8 w-full rounded-lg border border-black/10",
                color === c && "selected"
              )}
              style={{ backgroundColor: c }}
            >
              {color === c && (
                <span className="absolute inset-0 flex items-center justify-center text-white/80 text-[10px] font-bold">
                  ✓
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* HEX Input */}
      <div>
        <p className="mb-2 text-[9px] font-bold uppercase tracking-[0.12em] text-muted-foreground/50">
          Hex Color
        </p>
        <div className="flex items-center gap-2">
          {/* Live color preview box */}
          <div
            className="h-9 w-9 flex-shrink-0 rounded-lg border border-white/10 shadow-md transition-all duration-200"
            style={{ backgroundColor: isHexColor(hexInput) ? hexInput : color }}
          />
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-mono font-semibold text-muted-foreground select-none">
              #
            </span>
            <input
              id="color-hex-input"
              value={hexInput.replace(/^#/, "")}
              onChange={(e) => handleHexChange(`#${e.target.value}`)}
              maxLength={7}
              placeholder="22c55e"
              spellCheck={false}
              className={cn(
                "h-9 w-full rounded-lg border bg-background/80 pl-7 pr-3 font-mono text-sm font-medium uppercase outline-none transition-all",
                inputError
                  ? "border-destructive/60 focus:ring-1 focus:ring-destructive/30 text-destructive"
                  : "border-border focus:border-primary/60 focus:ring-2 focus:ring-primary/15"
              )}
            />
          </div>
        </div>
        {inputError && (
          <p className="mt-1.5 text-[10px] font-medium text-destructive">
            Enter a valid hex (e.g. #22c55e)
          </p>
        )}
      </div>
    </div>
  );
}

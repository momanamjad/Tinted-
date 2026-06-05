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

  // Extended palette for the full color picker
  const EXTENDED_PALETTE = [
    // Row 1: Reds/Pinks
    "#fca5a5", "#f87171", "#ef4444", "#dc2626", "#b91c1c",
    "#fda4af", "#fb7185", "#f43f5e", "#e11d48", "#be123c",
    // Row 2: Oranges/Yellows
    "#fdba74", "#fb923c", "#f97316", "#ea580c", "#c2410c",
    "#fde68a", "#fcd34d", "#fbbf24", "#f59e0b", "#d97706",
    // Row 3: Greens
    "#bbf7d0", "#86efac", "#4ade80", "#22c55e", "#16a34a",
    "#bef264", "#a3e635", "#84cc16", "#65a30d", "#4d7c0f",
    // Row 4: Blues/Cyans
    "#bae6fd", "#7dd3fc", "#38bdf8", "#0ea5e9", "#0284c7",
    "#a5f3fc", "#67e8f9", "#22d3ee", "#06b6d4", "#0891b2",
    // Row 5: Purples/Violets
    "#ddd6fe", "#c4b5fd", "#a78bfa", "#8b5cf6", "#7c3aed",
    "#e879f9", "#d946ef", "#c026d3", "#a21caf", "#86198f",
    // Row 6: Grays
    "#f1f5f9", "#cbd5e1", "#94a3b8", "#64748b", "#334155",
    "#f9fafb", "#e5e7eb", "#9ca3af", "#6b7280", "#374151",
  ];

  return (
    <div className="space-y-4">
      {/* Color grid */}
      <div>
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
          Palette
        </p>
        <div className="grid grid-cols-10 gap-1">
          {EXTENDED_PALETTE.map((c) => (
            <button
              key={c}
              title={c}
              onClick={() => handlePresetClick(c)}
              className={cn(
                "relative h-5 w-full rounded transition-all duration-150 hover:scale-110 hover:z-10",
                color === c && "ring-2 ring-white ring-offset-1 ring-offset-background scale-110 z-10"
              )}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </div>

      {/* Presets */}
      <div>
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
          Presets
        </p>
        <div className="grid grid-cols-6 gap-2">
          {TINT_PRESETS.map((c) => (
            <button
              key={c}
              title={c}
              onClick={() => handlePresetClick(c)}
              className={cn(
                "h-8 w-full rounded-lg border border-white/10 transition-all duration-150 hover:scale-105 hover:shadow-md",
                color === c && "ring-2 ring-white ring-offset-1 ring-offset-background scale-105 shadow-md"
              )}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </div>

      {/* HEX input */}
      <div>
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
          Hex Color
        </p>
        <div className="flex items-center gap-2">
          <div
            className="h-9 w-9 flex-shrink-0 rounded-lg border border-white/10 shadow-sm transition-all duration-200"
            style={{ backgroundColor: isHexColor(hexInput) ? hexInput : color }}
          />
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-mono text-muted-foreground">
              #
            </span>
            <input
              id="color-hex-input"
              value={hexInput.replace(/^#/, "")}
              onChange={(e) => handleHexChange(`#${e.target.value}`)}
              maxLength={7}
              placeholder="22c55e"
              className={cn(
                "h-9 w-full rounded-lg border bg-background pl-7 pr-3 font-mono text-sm outline-none transition-all",
                inputError
                  ? "border-destructive/60 focus:ring-destructive/30"
                  : "border-border focus:border-primary focus:ring-2 focus:ring-primary/20"
              )}
            />
          </div>
        </div>
        {inputError && (
          <p className="mt-1 text-[11px] text-destructive">Invalid hex color</p>
        )}
      </div>
    </div>
  );
}

import { Check } from "lucide-react";
import { cn } from "@/utils/cn";

type ColorSwatchProps = {
  color: string;
  selected: boolean;
  onSelect: (color: string) => void;
};

export function ColorSwatch({ color, selected, onSelect }: ColorSwatchProps) {
  return (
    <button
      type="button"
      aria-label={`Use ${color}`}
      title={color}
      onClick={() => onSelect(color)}
      className={cn(
        "grid h-10 w-10 place-items-center rounded-md border border-border shadow-sm outline-none transition focus-visible:ring-2 focus-visible:ring-ring",
        selected && "ring-2 ring-primary ring-offset-2 ring-offset-background"
      )}
      style={{ backgroundColor: color }}
    >
      {selected ? <Check className="h-4 w-4 text-white drop-shadow" /> : null}
    </button>
  );
}

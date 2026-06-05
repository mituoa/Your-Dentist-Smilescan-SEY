"use client";

import {
  DEFAULT_PROFILE_BACKGROUND,
  PROFILE_BACKGROUND_PRESETS,
  normalizeProfileBackgroundHex,
} from "@/lib/profile/carree-theme";
import { cn } from "@/lib/utils";

type ProfileBackgroundPickerProps = {
  value: string | null;
  onChange: (hex: string) => void;
  disabled?: boolean;
};

export function ProfileBackgroundPicker({
  value,
  onChange,
  disabled = false,
}: ProfileBackgroundPickerProps) {
  const active =
    normalizeProfileBackgroundHex(value) ??
    DEFAULT_PROFILE_BACKGROUND;

  return (
    <div>
      <p className="mb-1.5 text-[11px] font-medium text-slate-600">Grundfarbe</p>
      <p className="mb-3 text-[11px] leading-snug text-slate-500">
        Hintergrund der Patientenansicht — ruhige, kuratierte Töne.
      </p>
      <div
        className="flex flex-wrap gap-2"
        role="radiogroup"
        aria-label="Grundfarbe der Patientenansicht"
      >
        {PROFILE_BACKGROUND_PRESETS.map((preset) => {
          const selected = active.toUpperCase() === preset.value.toUpperCase();
          return (
            <button
              key={preset.value}
              type="button"
              role="radio"
              aria-checked={selected}
              aria-label={`${preset.name}, ${preset.value}`}
              disabled={disabled}
              onClick={() => onChange(preset.value)}
              className={cn(
                "group relative h-9 w-9 shrink-0 rounded-full border transition-[transform,box-shadow] touch-manipulation",
                "disabled:cursor-not-allowed disabled:opacity-45",
                selected
                  ? "border-slate-800 ring-2 ring-slate-800/15 ring-offset-2 ring-offset-[#F4F3F0]"
                  : "border-black/10 hover:scale-[1.04]"
              )}
              style={{ background: preset.value }}
              title={preset.name}
            >
              <span className="sr-only">{preset.name}</span>
            </button>
          );
        })}
      </div>
      <p className="mt-2 text-[10px] tracking-wide text-slate-400">
        {PROFILE_BACKGROUND_PRESETS.find((p) => p.value.toUpperCase() === active.toUpperCase())?.name ??
          "Eigene Farbe"}
      </p>
    </div>
  );
}

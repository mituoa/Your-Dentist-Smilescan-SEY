"use client";

import { useState } from "react";
import { Check, ChevronDown } from "lucide-react";

import {
  DEFAULT_PROFILE_BACKGROUND,
  PROFILE_EXTENDED_COLOR_PRESETS,
  PROFILE_PRIMARY_COLOR_PRESETS,
  normalizeProfileBackgroundHex,
  presetSwatchFill,
  profileBackgroundPresetName,
  relativeLuminance,
  resolveCarreeTheme,
} from "@/lib/profile/carree-theme";
import type { ProfileBackgroundPreset } from "@/lib/profile/carree-theme";
import { cn } from "@/lib/utils";

type ProfileBackgroundPickerProps = {
  value: string | null;
  onChange: (hex: string) => void;
  disabled?: boolean;
};

function SwatchButton({
  preset,
  index,
  active,
  disabled,
  onChange,
}: {
  preset: ProfileBackgroundPreset;
  index: number;
  active: string;
  disabled: boolean;
  onChange: (hex: string) => void;
}) {
  const selected = active.toUpperCase() === preset.value.toUpperCase();
  const ink = resolveCarreeTheme(preset.value).ink;
  const swatchFill = presetSwatchFill(preset, index);
  const checkColor =
    index === 0 ? "#FAF8F5" : relativeLuminance(preset.value) > 0.72 ? ink : "#FAF8F5";

  return (
    <button
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
          ? "border-slate-800/35 ring-2 ring-slate-800/12 ring-offset-2 ring-offset-[#F4F3F0]"
          : "border-black/10 hover:scale-[1.04]"
      )}
      style={{ background: swatchFill }}
      title={preset.name}
    >
      {selected ? (
        <span className="absolute inset-0 flex items-center justify-center" aria-hidden>
          <Check className="h-4 w-4" strokeWidth={2.25} style={{ color: checkColor }} />
        </span>
      ) : null}
      <span className="sr-only">{preset.name}</span>
    </button>
  );
}

export function ProfileBackgroundPicker({
  value,
  onChange,
  disabled = false,
}: ProfileBackgroundPickerProps) {
  const [showMore, setShowMore] = useState(false);
  const active = normalizeProfileBackgroundHex(value) ?? DEFAULT_PROFILE_BACKGROUND;
  const activeInExtended = PROFILE_EXTENDED_COLOR_PRESETS.some(
    (p) => p.value.toUpperCase() === active.toUpperCase()
  );

  return (
    <div>
      <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
        Grundfarbe
      </p>
      <p className="mb-3 text-[11px] leading-snug text-slate-500">
        Wählen Sie die Grundfarbe Ihrer öffentlichen Präsenz.
      </p>
      <div
        className="grid max-w-[10.5rem] grid-cols-5 gap-2.5"
        role="radiogroup"
        aria-label="Grundfarbe der Patientenansicht"
      >
        {PROFILE_PRIMARY_COLOR_PRESETS.map((preset, index) => (
          <SwatchButton
            key={`${preset.name}-${preset.value}`}
            preset={preset}
            index={index}
            active={active}
            disabled={disabled}
            onChange={onChange}
          />
        ))}
      </div>

      <button
        type="button"
        disabled={disabled}
        onClick={() => setShowMore((v) => !v)}
        className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-500 transition hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-45"
        aria-expanded={showMore || activeInExtended}
      >
        <ChevronDown
          className={cn("h-3.5 w-3.5 transition-transform", (showMore || activeInExtended) && "rotate-180")}
          aria-hidden
        />
        Mehr auswählen
      </button>

      {showMore || activeInExtended ? (
        <div
          className="mt-2.5 grid max-w-[14rem] grid-cols-5 gap-2.5"
          role="radiogroup"
          aria-label="Weitere Grundfarben"
        >
          {PROFILE_EXTENDED_COLOR_PRESETS.map((preset, index) => (
            <SwatchButton
              key={`ext-${preset.name}-${preset.value}`}
              preset={preset}
              index={index + 1}
              active={active}
              disabled={disabled}
              onChange={onChange}
            />
          ))}
        </div>
      ) : null}

      <p className="mt-2 text-[10px] tracking-wide text-slate-400">
        {profileBackgroundPresetName(active)}
      </p>
    </div>
  );
}

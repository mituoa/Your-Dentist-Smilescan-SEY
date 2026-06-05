"use client";

import { useMemo, useState } from "react";
import { Check, Plus, X } from "lucide-react";

import { FigmaTextInput } from "@/components/profile-editor/figma-form-fields";
import {
  getProfileSchwerpunktePickerOptions,
  PROFILE_SCHWERPUNKTE_PICKER_IDS,
} from "@/lib/masterdata/specializations";
import { specializationPickerLabel } from "@/lib/profile/specialization-picker-data";
import { cn } from "@/lib/utils";
import { PROFILE_LIMITS } from "@/lib/validation/profile-limits";

type ProfileSpecializationPickerProps = {
  selected: string[];
  onChange: (ids: string[]) => void;
  disabled?: boolean;
  embedded?: boolean;
};

export function ProfileSpecializationPicker({
  selected,
  onChange,
  disabled = false,
  embedded = false,
}: ProfileSpecializationPickerProps) {
  const [showExtended, setShowExtended] = useState(false);
  const [customInput, setCustomInput] = useState("");

  const pickerOptions = useMemo(() => getProfileSchwerpunktePickerOptions(), []);
  const primaryIds = useMemo(
    () => new Set<string>(PROFILE_SCHWERPUNKTE_PICKER_IDS),
    []
  );

  const primaryOptions = pickerOptions.filter((option) => primaryIds.has(option.id));
  const extendedOptions = pickerOptions.filter((option) => !primaryIds.has(option.id));

  const toggle = (id: string) => {
    if (disabled) return;
    if (selected.includes(id)) {
      onChange(selected.filter((x) => x !== id));
      return;
    }
    onChange([...selected, id]);
  };

  const visibleCount = selected.length;
  const isOverLimit = visibleCount > PROFILE_LIMITS.MAX_VISIBLE_SPECIALIZATIONS;

  const renderPill = (id: string, label: string) => {
    const isSelected = selected.includes(id);
    return (
      <button
        key={id}
        type="button"
        disabled={disabled}
        aria-pressed={isSelected}
        onClick={() => toggle(id)}
        className={cn(
          "inline-flex max-w-full items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-medium transition-colors touch-manipulation",
          isSelected
            ? "border-slate-800 bg-slate-900 text-white"
            : "border-slate-300/50 bg-white/70 text-slate-600 hover:border-slate-400/70 hover:bg-white",
          disabled && "cursor-not-allowed opacity-50"
        )}
      >
        {isSelected ? (
          <Check className="h-3 w-3 shrink-0" strokeWidth={2.5} aria-hidden />
        ) : null}
        <span className="truncate">{label}</span>
      </button>
    );
  };

  return (
    <div>
      {!embedded ? (
        <p className="mb-3 text-[12px] leading-relaxed text-slate-500">
          Fachliche Schwerpunkte — keine geschützten Fachzahnarzt-Titel. Sichtbar: max{" "}
          {PROFILE_LIMITS.MAX_VISIBLE_SPECIALIZATIONS} auf dem Profil.
        </p>
      ) : null}

      {selected.length > 0 ? (
        <div className="mb-4">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
            Ausgewählt
          </p>
          <div className="flex flex-wrap gap-2">
            {selected.map((id) => (
              <button
                key={id}
                type="button"
                disabled={disabled}
                onClick={() => toggle(id)}
                className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-slate-700/15 bg-slate-900/[0.05] px-3 py-1.5 text-[11px] font-medium text-slate-800 transition-colors hover:border-slate-700/25 hover:bg-slate-900/[0.08] disabled:cursor-not-allowed disabled:opacity-50"
                aria-label={`${specializationPickerLabel(id)} entfernen`}
              >
                <Check className="h-3 w-3 shrink-0 text-slate-600" strokeWidth={2.25} aria-hidden />
                <span className="truncate">{specializationPickerLabel(id)}</span>
                <X className="h-3 w-3 shrink-0 text-slate-400" strokeWidth={2} aria-hidden />
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
        Aus der Liste wählen
      </p>
      <div className="flex flex-wrap gap-2">
        {primaryOptions.map((option) => renderPill(option.id, option.label))}
      </div>

      {extendedOptions.length > 0 ? (
        <div className="mt-4">
          {!showExtended ? (
            <button
              type="button"
              disabled={disabled}
              onClick={() => setShowExtended(true)}
              className="inline-flex min-h-[40px] items-center text-[12px] font-medium text-slate-500 underline-offset-4 transition-colors hover:text-slate-700 touch-manipulation disabled:cursor-not-allowed disabled:opacity-50"
            >
              Weitere Schwerpunkte
            </button>
          ) : (
            <>
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                Weitere Schwerpunkte
              </p>
              <div className="flex flex-wrap gap-2">
                {extendedOptions.map((option) => renderPill(option.id, option.label))}
              </div>
            </>
          )}
        </div>
      ) : null}

      <div className="mt-4">
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
          Eigenen Schwerpunkt hinzufügen
        </p>
        <div className="flex gap-2">
          <FigmaTextInput
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            placeholder="z. B. Digitale Volumentomographie"
            disabled={disabled}
            maxLength={PROFILE_LIMITS.specialization_custom}
            className="min-w-0 flex-1"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                const trimmed = customInput.trim();
                if (!trimmed || trimmed.length > PROFILE_LIMITS.specialization_custom) return;
                const customId = `custom:${trimmed}`;
                if (selected.includes(customId)) return;
                onChange([...selected, customId]);
                setCustomInput("");
              }
            }}
          />
          <button
            type="button"
            disabled={disabled || !customInput.trim()}
            onClick={() => {
              const trimmed = customInput.trim();
              if (!trimmed || trimmed.length > PROFILE_LIMITS.specialization_custom) return;
              const customId = `custom:${trimmed}`;
              if (selected.includes(customId)) return;
              onChange([...selected, customId]);
              setCustomInput("");
            }}
            className="inline-flex h-10 shrink-0 items-center gap-1 rounded-xl border border-slate-300/35 bg-white/70 px-3 text-[11px] font-medium text-slate-600 transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Plus className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden />
            Hinzufügen
          </button>
        </div>
      </div>

      <p className="mt-4 border-t border-slate-300/20 pt-3 text-[11px] text-slate-400">
        Ausgewählt:{" "}
        <span className={isOverLimit ? "font-medium text-amber-700" : "font-medium text-slate-600"}>
          {visibleCount}
        </span>
        {isOverLimit ? (
          <span className="ml-1">
            — auf dem Profil werden nur die ersten {PROFILE_LIMITS.MAX_VISIBLE_SPECIALIZATIONS}{" "}
            angezeigt.
          </span>
        ) : null}
      </p>
    </div>
  );
}

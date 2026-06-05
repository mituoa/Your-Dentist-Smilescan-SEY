"use client";

import { useState } from "react";
import { ChevronRight, Plus } from "lucide-react";

import { FigmaTextInput } from "@/components/profile-editor/figma-form-fields";
import {
  FACHBEREICH_EXTENDED_GROUPS,
  FACHBEREICH_GROUPS,
  MAX_SPECIALIZATION_SELECTIONS,
  specializationPickerLabel,
} from "@/lib/profile/specialization-picker-data";
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
  const [openGroups, setOpenGroups] = useState<string[]>([]);
  const [showExtended, setShowExtended] = useState(false);
  const [customInput, setCustomInput] = useState("");

  const toggle = (id: string) => {
    if (disabled) return;
    if (selected.includes(id)) {
      onChange(selected.filter((x) => x !== id));
      return;
    }
    if (selected.length >= MAX_SPECIALIZATION_SELECTIONS) return;
    onChange([...selected, id]);
  };

  const toggleGroup = (groupId: string) => {
    setOpenGroups((prev) =>
      prev.includes(groupId) ? prev.filter((g) => g !== groupId) : [...prev, groupId]
    );
  };

  const allGroups = [...FACHBEREICH_GROUPS, ...(showExtended ? FACHBEREICH_EXTENDED_GROUPS : [])];

  const knownIds = new Set(
    [...FACHBEREICH_GROUPS, ...FACHBEREICH_EXTENDED_GROUPS].flatMap((g) =>
      g.items.map((i) => i.id)
    )
  );

  const renderRow = (id: string, label: string) => {
    const isSelected = selected.includes(id);
    const isDisabled = !isSelected && selected.length >= MAX_SPECIALIZATION_SELECTIONS;
    const rowMuted = isDisabled || disabled;

    return (
      <li key={id}>
        <button
          type="button"
          disabled={rowMuted}
          aria-pressed={isSelected}
          onClick={() => !rowMuted && toggle(id)}
          className="flex w-full items-center justify-between gap-3 py-2.5 pr-1 text-left text-[13px] font-normal leading-snug tracking-[-0.01em] transition-colors disabled:cursor-not-allowed disabled:opacity-35 hover:bg-white/40"
        >
          <span className={isSelected ? "font-medium text-slate-950" : "text-slate-600"}>
            {label}
          </span>
          <span className="flex h-4 w-5 shrink-0 items-center justify-end" aria-hidden>
            {isSelected ? <span className="h-1.5 w-1.5 rounded-full bg-slate-700/90" /> : null}
          </span>
        </button>
      </li>
    );
  };

  const renderGroup = (groupId: string, label: string, items: { id: string; label: string }[]) => {
    const isOpen = openGroups.includes(groupId);
    const selectedInGroup = items.filter((item) => selected.includes(item.id)).length;

    return (
      <div key={groupId} className="border-b border-slate-300/20 last:border-b-0">
        <button
          type="button"
          onClick={() => toggleGroup(groupId)}
          className="flex w-full items-center justify-between gap-2 py-2.5 text-left text-[12px] font-medium text-slate-700 transition-colors hover:text-slate-900"
        >
          <span>
            {label}
            {selectedInGroup > 0 ? (
              <span className="ml-2 text-[10px] font-normal tabular-nums text-slate-400">
                {selectedInGroup}
              </span>
            ) : null}
          </span>
          <ChevronRight
            className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${isOpen ? "rotate-90" : ""}`}
            strokeWidth={1.75}
            aria-hidden
          />
        </button>
        {isOpen ? (
          <ul className="divide-y divide-slate-300/15 border-t border-slate-300/15 pl-1">
            {items.map((item) => renderRow(item.id, item.label))}
          </ul>
        ) : null}
      </div>
    );
  };

  const unknownSelected = selected.filter((id) => !knownIds.has(id) && id.startsWith("custom:"));

  return (
    <div>
      {!embedded ? (
        <div className="mb-3 flex items-baseline justify-between gap-2">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
            Fachbereiche
          </p>
          <span className="text-[10px] font-medium tabular-nums text-slate-400">
            {selected.length}/{MAX_SPECIALIZATION_SELECTIONS}
          </span>
        </div>
      ) : (
        <p className="mb-3 flex items-baseline justify-between gap-2 text-[11px] leading-snug text-slate-500">
          <span>Wofür steht Ihre Praxis? Schwerpunkte und Kompetenzfelder.</span>
          <span className="shrink-0 text-[10px] font-medium tabular-nums text-slate-400">
            {selected.length}/{MAX_SPECIALIZATION_SELECTIONS}
          </span>
        </p>
      )}

      <div className="rounded-lg border border-slate-300/25 bg-white/35 px-2">
        {allGroups.map((group) => renderGroup(group.id, group.label, group.items))}
      </div>

      {FACHBEREICH_EXTENDED_GROUPS.length > 0 && !showExtended ? (
        <button
          type="button"
          disabled={disabled}
          onClick={() => setShowExtended(true)}
          className="mt-3 inline-flex min-h-[40px] items-center text-[12px] font-medium text-slate-500 underline-offset-4 transition-colors hover:text-slate-700 touch-manipulation disabled:cursor-not-allowed disabled:opacity-50"
        >
          Weitere Fachgebiete
        </button>
      ) : null}

      {unknownSelected.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {unknownSelected.map((id) => (
            <button
              key={id}
              type="button"
              disabled={disabled}
              onClick={() => onChange(selected.filter((x) => x !== id))}
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-300/40 bg-white/70 px-2.5 py-1 text-[11px] text-slate-700 transition-colors hover:border-slate-400/50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {specializationPickerLabel(id)}
              <span className="text-slate-400" aria-hidden>
                ×
              </span>
            </button>
          ))}
        </div>
      ) : null}

      <div className="mt-4">
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
          Eigener Fachbereich
        </p>
        <div className="flex gap-2">
          <FigmaTextInput
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            placeholder="z. B. Schlafmedizin"
            disabled={disabled || selected.length >= MAX_SPECIALIZATION_SELECTIONS}
            maxLength={PROFILE_LIMITS.specialization_custom}
            className="min-w-0 flex-1"
          />
          <button
            type="button"
            disabled={
              disabled ||
              !customInput.trim() ||
              selected.length >= MAX_SPECIALIZATION_SELECTIONS
            }
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
    </div>
  );
}

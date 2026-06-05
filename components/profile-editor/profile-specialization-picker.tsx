"use client";

import { useMemo, useState } from "react";
import { Check, ChevronRight, Plus, X } from "lucide-react";

import { FigmaTextInput } from "@/components/profile-editor/figma-form-fields";
import {
  FACHBEREICH_EXTENDED_GROUPS,
  FACHBEREICH_GROUPS,
  MAX_SPECIALIZATION_SELECTIONS,
  specializationPickerLabel,
} from "@/lib/profile/specialization-picker-data";
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
  const groupsWithSelection = useMemo(
    () =>
      FACHBEREICH_GROUPS.filter((group) =>
        group.items.some((item) => selected.includes(item.id))
      ).map((group) => group.id),
    [selected]
  );

  const [openGroups, setOpenGroups] = useState<string[]>(groupsWithSelection);
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

  const renderRow = (id: string, label: string) => {
    const isSelected = selected.includes(id);
    const atLimit = !isSelected && selected.length >= MAX_SPECIALIZATION_SELECTIONS;
    const rowMuted = atLimit || disabled;

    return (
      <li key={id}>
        <button
          type="button"
          disabled={rowMuted}
          aria-pressed={isSelected}
          onClick={() => toggle(id)}
          className={cn(
            "flex w-full items-center justify-between gap-3 rounded-lg py-2.5 pl-1 pr-2 text-left text-[13px] leading-snug tracking-[-0.01em] transition-colors touch-manipulation",
            isSelected
              ? "bg-slate-900/[0.04] font-medium text-slate-950"
              : "font-normal text-slate-600 hover:bg-white/40",
            rowMuted && !isSelected && "cursor-not-allowed opacity-35"
          )}
        >
          <span className="min-w-0">{label}</span>
          <span
            className={cn(
              "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors",
              isSelected
                ? "border-slate-700 bg-slate-800 text-white"
                : "border-slate-300/70 bg-white/60 text-transparent"
            )}
            aria-hidden
          >
            <Check className="h-3 w-3" strokeWidth={2.5} />
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
              <span className="ml-2 inline-flex min-w-[1.25rem] items-center justify-center rounded-full bg-slate-800/90 px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-white">
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
        <p className="mb-3 text-right text-[10px] font-medium tabular-nums text-slate-400">
          {selected.length}/{MAX_SPECIALIZATION_SELECTIONS}
        </p>
      )}

      {selected.length > 0 ? (
        <div className="mb-4">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
            Ausgewählte Schwerpunkte
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
        Fachbereiche durchsuchen
      </p>
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

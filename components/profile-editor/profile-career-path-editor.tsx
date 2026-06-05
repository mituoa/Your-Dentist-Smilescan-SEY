"use client";

import { Plus, X } from "lucide-react";

import { FigmaTextInput } from "@/components/profile-editor/figma-form-fields";
import { PROFILE_LIMITS } from "@/lib/validation/profile-limits";

const MAX_ITEMS = 6;

const STATION_HINTS = [
  "Studium",
  "Promotion",
  "Klinik",
  "Spezialisierung",
  "Weiterbildung",
  "Facharzt",
] as const;

const STATION_PLACEHOLDERS = [
  "z. B. Studium Zahnmedizin, Universität Köln",
  "z. B. Promotion zum Dr. med. dent.",
  "z. B. Assistenzarzt, Uniklinik Bonn",
  "z. B. Fachzahnarzt für Oralchirurgie",
  "z. B. Curriculum Implantologie",
  "z. B. Niedergelassen in eigener Praxis",
] as const;

type ProfileCareerPathEditorProps = {
  items: string[];
  onChange: (items: string[]) => void;
  disabled?: boolean;
  embedded?: boolean;
};

export function ProfileCareerPathEditor({
  items,
  onChange,
  disabled = false,
  embedded = false,
}: ProfileCareerPathEditorProps) {
  const addRow = () => {
    if (disabled || items.length >= MAX_ITEMS) return;
    onChange([...items, ""]);
  };

  const updateRow = (index: number, value: string) => {
    const next = [...items];
    next[index] = value.slice(0, PROFILE_LIMITS.career_line);
    onChange(next);
  };

  const removeRow = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  const displayItems = items.length > 0 ? items : [];

  return (
    <div>
      {embedded ? (
        <p className="mb-4 text-[11px] leading-snug text-slate-500">
          Relevante Stationen in chronologischer Reihenfolge — ohne Jahreszahlen-Pflicht.
        </p>
      ) : (
        <>
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
            Ausbildung &amp; Werdegang
          </p>
          <p className="mb-3 text-[11px] leading-snug text-slate-500">
            Optional — nur relevante Stationen, z. B. Studium, Promotion, Kliniken oder
            Spezialisierungen.
          </p>
        </>
      )}

      {displayItems.length === 0 ? (
        <div className="yd-pe-career-empty rounded-xl border border-dashed border-slate-300/35 bg-white/30 px-4 py-5">
          <p className="text-[12px] leading-relaxed text-slate-500">
            Noch keine Stationen. Fügen Sie Studium, Klinik oder Spezialisierung hinzu.
          </p>
          <button
            type="button"
            disabled={disabled}
            onClick={addRow}
            className="mt-3 inline-flex min-h-[40px] items-center gap-1.5 text-[12px] font-medium text-slate-600 transition hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden />
            Erste Station hinzufügen
          </button>
        </div>
      ) : (
        <ol className="yd-pe-career-timeline">
          {displayItems.map((line, index) => (
            <li key={index} className="yd-pe-career-timeline__item">
              <span className="yd-pe-career-timeline__marker" aria-hidden />
              <div className="yd-pe-career-timeline__body">
                <span className="yd-pe-career-timeline__hint">
                  {STATION_HINTS[Math.min(index, STATION_HINTS.length - 1)]}
                </span>
                <div className="flex items-center gap-2">
                  <FigmaTextInput
                    variant="quiet"
                    value={line}
                    disabled={disabled}
                    maxLength={PROFILE_LIMITS.career_line}
                    placeholder={STATION_PLACEHOLDERS[Math.min(index, STATION_PLACEHOLDERS.length - 1)]}
                    onChange={(e) => updateRow(index, e.target.value)}
                    className="min-w-0 flex-1"
                  />
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => removeRow(index)}
                    className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-white/60 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label="Station entfernen"
                  >
                    <X className="h-3.5 w-3.5" strokeWidth={1.75} />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ol>
      )}

      {displayItems.length > 0 && displayItems.length < MAX_ITEMS ? (
        <button
          type="button"
          disabled={disabled}
          onClick={addRow}
          className="mt-4 inline-flex min-h-[40px] items-center gap-1.5 text-[12px] font-medium text-slate-500 transition hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Plus className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden />
          Station hinzufügen
        </button>
      ) : null}
    </div>
  );
}

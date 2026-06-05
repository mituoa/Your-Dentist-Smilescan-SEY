"use client";

import { Plus, X } from "lucide-react";

import { FigmaTextInput } from "@/components/profile-editor/figma-form-fields";

const MAX_CREDENTIALS = 8;
const MAX_LEN = 120;

type ProfileCredentialsEditorProps = {
  credentials: string[];
  onChange: (items: string[]) => void;
  disabled?: boolean;
  embedded?: boolean;
};

export function ProfileCredentialsEditor({
  credentials,
  onChange,
  disabled = false,
  embedded = false,
}: ProfileCredentialsEditorProps) {
  const addRow = () => {
    if (disabled || credentials.length >= MAX_CREDENTIALS) return;
    onChange([...credentials, ""]);
  };

  const updateRow = (index: number, value: string) => {
    const next = [...credentials];
    next[index] = value.slice(0, MAX_LEN);
    onChange(next);
  };

  const removeRow = (index: number) => {
    onChange(credentials.filter((_, i) => i !== index));
  };

  const filledCount = credentials.filter((c) => c.trim()).length;

  return (
    <div>
      {!embedded ? (
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
          Fortbildungen &amp; Zertifikate
        </p>
      ) : null}

      {credentials.length === 0 ? (
        <button
          type="button"
          disabled={disabled}
          onClick={addRow}
          className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-slate-300/30 bg-white/50 px-3 text-[12px] font-medium text-slate-600 transition hover:bg-white/80 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Plus className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden />
          Eintrag hinzufügen
        </button>
      ) : (
        <div className="flex flex-col gap-1.5">
          {credentials.map((line, index) => (
            <div key={index} className="flex items-center gap-2">
              <FigmaTextInput
                variant="quiet"
                value={line}
                disabled={disabled}
                maxLength={MAX_LEN}
                placeholder="z. B. Curriculum Implantologie"
                onChange={(e) => updateRow(index, e.target.value)}
                className="min-w-0 flex-1"
              />
              <button
                type="button"
                disabled={disabled}
                onClick={() => removeRow(index)}
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-white/60 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Eintrag entfernen"
              >
                <X className="h-3.5 w-3.5" strokeWidth={1.75} />
              </button>
            </div>
          ))}
          {credentials.length < MAX_CREDENTIALS ? (
            <button
              type="button"
              disabled={disabled}
              onClick={addRow}
              className="mt-1 inline-flex min-h-[36px] items-center gap-1.5 text-[12px] font-medium text-slate-500 transition hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Plus className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden />
              Weiteren Eintrag
            </button>
          ) : null}
        </div>
      )}

      {filledCount > 0 ? (
        <p className="mt-3 text-[10px] text-slate-400">
          {filledCount} {filledCount === 1 ? "Eintrag" : "Einträge"} im Profil
        </p>
      ) : null}
    </div>
  );
}

"use client";

import { FigmaTextarea } from "@/components/profile-editor/figma-form-fields";
import { PROFILE_LIMITS } from "@/lib/validation/profile-limits";

const APPROACH_PROMPTS = [
  "Was ist Ihnen in der Behandlung wichtig?",
  "Wie möchten Sie mit Patienten umgehen?",
  "Welche Philosophie verfolgen Sie?",
] as const;

type ProfilePersonalApproachEditorProps = {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  embedded?: boolean;
};

export function ProfilePersonalApproachEditor({
  value,
  onChange,
  disabled = false,
  embedded = false,
}: ProfilePersonalApproachEditorProps) {
  const charCount = value.length;
  const max = PROFILE_LIMITS.personal_approach;

  return (
    <div>
      {embedded ? (
        <p className="mb-4 text-[11px] leading-snug text-slate-500">
          Ihr Behandlungsansatz in eigenen Worten — persönlich, sachlich, ohne Werbesprache.
        </p>
      ) : (
        <>
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
            Persönliche Worte
          </p>
          <p className="mb-3 text-[11px] leading-snug text-slate-500">
            Optional — warum Zahnmedizin, was Ihnen in der Behandlung wichtig ist, wie Sie mit
            Patienten umgehen.
          </p>
        </>
      )}

      <ul className="mb-3 flex flex-col gap-1">
        {APPROACH_PROMPTS.map((prompt) => (
          <li key={prompt} className="text-[10px] leading-snug text-slate-400">
            · {prompt}
          </li>
        ))}
      </ul>

      <FigmaTextarea
        variant="quiet"
        rows={6}
        disabled={disabled}
        maxLength={max}
        value={value}
        placeholder="Für mich steht der Mensch im Mittelpunkt — nicht nur der Befund. Ich nehme mir Zeit, erkläre verständlich und gestalte Behandlungen gemeinsam mit Ihnen."
        onChange={(e) => onChange(e.target.value.slice(0, max))}
        className="min-h-[8.5rem] text-[13px] leading-relaxed"
      />
      <p className="mt-2 text-right text-[10px] tabular-nums text-slate-400">
        {charCount}/{max}
      </p>
    </div>
  );
}

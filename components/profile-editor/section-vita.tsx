"use client";

import { FieldWithCounter } from "./field-with-counter";
import { PROFILE_LIMITS } from "@/lib/validation/profile-limits";

interface SectionVitaProps {
  vita: string;
  onUpdate: (value: string) => void;
}

export function SectionVita({ vita, onUpdate }: SectionVitaProps) {
  return (
    <section className="space-y-6">
      <div>
        <div className="flex items-baseline gap-3 mb-1">
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-text-tertiary">
            II
          </span>
          <h2 className="font-serif text-3xl font-light">Vita</h2>
        </div>
        <p className="text-sm text-text-secondary">
          Ihre persönliche Geschichte und Philosophie. Drei bis vier Absätze
          reichen.
        </p>
      </div>

      <FieldWithCounter
        id="vita_markdown"
        label="Vita-Text"
        value={vita}
        onChange={onUpdate}
        maxLength={PROFILE_LIMITS.vita_markdown}
        placeholder="Nach meinem Studium der Zahnmedizin an..."
        multiline
        rows={12}
        helper="Absätze durch Leerzeile trennen. Der erste Buchstabe wird als großes Initial dargestellt."
      />
    </section>
  );
}

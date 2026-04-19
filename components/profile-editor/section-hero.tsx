"use client";

import { FieldWithCounter } from "./field-with-counter";
import { PROFILE_LIMITS } from "@/lib/validation/profile-limits";

interface SectionHeroProps {
  firstName: string;
  lastName: string;
  title: string;
  foundingYear: number | null;
  onUpdate: (field: string, value: unknown) => void;
}

export function SectionHero({
  firstName,
  lastName,
  title,
  foundingYear,
  onUpdate,
}: SectionHeroProps) {
  return (
    <section className="space-y-6">
      <div>
        <div className="flex items-baseline gap-3 mb-1">
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-text-tertiary">
            I
          </span>
          <h2 className="font-serif text-3xl font-light">Name und Titel</h2>
        </div>
        <p className="text-sm text-text-secondary">
          Wie Sie auf Ihrem öffentlichen Profil erscheinen.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FieldWithCounter
          id="first_name"
          label="Vorname"
          value={firstName}
          onChange={(v) => onUpdate("first_name", v)}
          maxLength={PROFILE_LIMITS.first_name}
          placeholder="Berk"
          required
        />
        <FieldWithCounter
          id="last_name"
          label="Nachname"
          value={lastName}
          onChange={(v) => onUpdate("last_name", v)}
          maxLength={PROFILE_LIMITS.last_name}
          placeholder="Baysal"
          required
        />
      </div>

      <FieldWithCounter
        id="title"
        label="Titel"
        value={title}
        onChange={(v) => onUpdate("title", v)}
        maxLength={PROFILE_LIMITS.title}
        placeholder="Dr. med. dent."
        helper="Optional. Beispiele: 'Dr. med. dent.', 'Prof. Dr.', 'Zahnärztin'."
      />

      <FieldWithCounter
        id="founding_year"
        label="Gründungsjahr"
        value={foundingYear?.toString() || ""}
        onChange={(v) => {
          const num = parseInt(v, 10);
          onUpdate("founding_year", Number.isNaN(num) ? null : num);
        }}
        maxLength={4}
        placeholder="2019"
        type="number"
        helper="Optional. Wird als 'Est. 2019' im Header angezeigt."
      />
    </section>
  );
}

"use client";

import { FieldWithCounter } from "./field-with-counter";
import { PROFILE_LIMITS } from "@/lib/validation/profile-limits";

interface SectionPracticeProps {
  practice_name: string;
  practice_address: string;
  practice_employment_status: string;
  practice_phone: string;
  practice_email: string;
  practice_website: string;
  practice_hours: string;
  onUpdate: (field: string, value: string) => void;
}

export function SectionPractice({
  practice_name,
  practice_address,
  practice_employment_status,
  practice_phone,
  practice_email,
  practice_website,
  practice_hours,
  onUpdate,
}: SectionPracticeProps) {
  return (
    <section className="space-y-6">
      <div>
        <div className="flex items-baseline gap-3 mb-1">
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-text-tertiary">
            V
          </span>
          <h2 className="font-serif text-3xl font-light">Praxis</h2>
        </div>
        <p className="text-sm text-text-secondary">
          Kontaktdaten und Standort der Praxis.
        </p>
      </div>

      <FieldWithCounter
        id="practice_name"
        label="Praxisname"
        value={practice_name}
        onChange={(v) => onUpdate("practice_name", v)}
        maxLength={PROFILE_LIMITS.practice_name}
        placeholder="CY DENT"
      />

      <FieldWithCounter
        id="practice_address"
        label="Adresse"
        value={practice_address}
        onChange={(v) => onUpdate("practice_address", v)}
        maxLength={PROFILE_LIMITS.practice_address}
        placeholder={"Kollwitzstraße 62\n10405 Berlin"}
        multiline
        rows={3}
      />

      <FieldWithCounter
        id="practice_hours"
        label="Öffnungszeiten"
        value={practice_hours}
        onChange={(v) => onUpdate("practice_hours", v)}
        maxLength={PROFILE_LIMITS.practice_hours}
        placeholder={"Mo — Fr · 09 — 19\nSa · nach Vereinbarung"}
        multiline
        rows={3}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FieldWithCounter
          id="practice_phone"
          label="Telefon"
          value={practice_phone}
          onChange={(v) => onUpdate("practice_phone", v)}
          maxLength={PROFILE_LIMITS.practice_phone}
          placeholder="+49 30 123 456"
          type="tel"
        />
        <FieldWithCounter
          id="practice_email"
          label="E-Mail"
          value={practice_email}
          onChange={(v) => onUpdate("practice_email", v)}
          maxLength={PROFILE_LIMITS.practice_email}
          placeholder="praxis@beispiel.de"
          type="email"
        />
      </div>

      <FieldWithCounter
        id="practice_website"
        label="Website"
        value={practice_website}
        onChange={(v) => onUpdate("practice_website", v)}
        maxLength={PROFILE_LIMITS.practice_website}
        placeholder="https://www.beispiel.de"
        type="url"
      />

      <FieldWithCounter
        id="practice_employment_status"
        label="Anstellungsverhältnis"
        value={practice_employment_status}
        onChange={(v) => onUpdate("practice_employment_status", v)}
        maxLength={PROFILE_LIMITS.practice_employment_status}
        placeholder="Praxisinhaber · Selbständig"
        helper="Optional. Z.B. 'Praxisinhaber', 'Angestellt bei Dr. Muster'."
      />
    </section>
  );
}

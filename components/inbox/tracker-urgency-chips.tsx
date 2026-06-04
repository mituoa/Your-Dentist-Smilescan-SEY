"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

import {
  updateSubmissionUrgency,
  type SubmissionUrgencyValue,
} from "@/app/(protected)/inbox/[id]/actions";

const OPTIONS: { id: SubmissionUrgencyValue; label: string }[] = [
  { id: "today", label: "Heute" },
  { id: "this_week", label: "Diese Woche" },
  { id: "not_urgent", label: "Nicht dringend" },
];

interface TrackerUrgencyChipsProps {
  submissionId: string;
  initialUrgency: string | null;
  /** Sofortiges UI-Update in übergeordneten Flows (z. B. Freischaltung Antwort/Termin). */
  onUrgencyChange?: (urgency: SubmissionUrgencyValue) => void;
}

/**
 * Dringlichkeit — **persistente Einordnung** (`updateSubmissionUrgency`), kein reines Styling.
 * Gleich hohe Flächen: Desktop 3-Spalten-Raster, mobil gestapelt.
 */
export function TrackerUrgencyChips({
  submissionId,
  initialUrgency,
  onUrgencyChange,
}: TrackerUrgencyChipsProps) {
  const router = useRouter();
  const [urgency, setUrgency] = useState<string | null>(initialUrgency);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    setUrgency(initialUrgency);
  }, [initialUrgency]);

  const select = (id: SubmissionUrgencyValue) => {
    setError(null);
    startTransition(async () => {
      const res = await updateSubmissionUrgency(submissionId, id);
      if (res.error) {
        setError(res.error);
        return;
      }
      setUrgency(id);
      onUrgencyChange?.(id);
      router.refresh();
    });
  };

  return (
    <div className="tracker-mobile-chip-targets" aria-busy={pending}>
      <p id="tracker-urgency-label" className="sr-only">
        Dringlichkeit
      </p>
      <div
        className="grid grid-cols-1 gap-2 sm:grid-cols-3 sm:gap-2"
        role="group"
        aria-labelledby="tracker-urgency-label"
      >
        {OPTIONS.map((opt) => {
          const active = urgency === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              disabled={pending}
              aria-pressed={active}
              onClick={() => select(opt.id)}
              className="relative z-[1] min-h-10 w-full cursor-pointer touch-manipulation text-[13px] font-medium transition duration-150 ease-out disabled:opacity-50"
              style={{
                padding: "0 10px",
                borderRadius: "8px",
                border: active ? "1px solid #2B6FE8" : "1px solid #E5E7EB",
                background: active ? "#EEF6FF" : "#FFFFFF",
                color: active ? "#2B6FE8" : "#64748B",
                letterSpacing: "-0.005em",
              }}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
      {error ? (
        <p
          role="status"
          aria-live="polite"
          className="mt-2 border-l-2 border-slate-300 pl-2 text-[12px] leading-relaxed text-slate-600"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}

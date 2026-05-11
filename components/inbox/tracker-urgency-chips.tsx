"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { AlertCircle } from "lucide-react";

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
}

/**
 * Zeitraum-Chips — **persistente Einordnung** (`updateSubmissionUrgency`), kein reines Styling.
 * Figma: gap 8px, Chip 6px 12px / 6px radius / 13px.
 */
export function TrackerUrgencyChips({
  submissionId,
  initialUrgency,
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
      router.refresh();
    });
  };

  return (
    <div className="tracker-mobile-chip-targets" aria-busy={pending}>
      <p
        id="tracker-urgency-label"
        className="text-[12px]"
        style={{
          color: "#94A3B8",
          marginBottom: "8px",
          fontWeight: 500,
          letterSpacing: "0.01em",
        }}
      >
        Zeitraum setzen
      </p>
      <div
        className="flex flex-wrap gap-2"
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
              className="cursor-pointer text-[13px] font-medium transition duration-150 ease-out disabled:opacity-50"
              style={{
                padding: "6px 12px",
                borderRadius: "6px",
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
        <div
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className="mt-2 flex items-start gap-2 rounded-[10px] bg-[#FEF2F2] px-3 py-2.5 text-[13px] leading-relaxed text-[#B91C1C]"
        >
          <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" strokeWidth={2} aria-hidden />
          <span>{error}</span>
        </div>
      ) : null}
    </div>
  );
}

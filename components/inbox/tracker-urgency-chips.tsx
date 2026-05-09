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
}

/**
 * Zeitraum-Chips — Figma: Label „Zeitraum wählen“, gap 8px, Chip 6px 12px / 6px radius / 13px.
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
    <div>
      <p
        className="text-[12px]"
        style={{
          color: "#94A3B8",
          marginBottom: "8px",
          fontWeight: 500,
          letterSpacing: "0.01em",
        }}
      >
        Zeitraum wählen
      </p>
      <div className="flex flex-wrap gap-2">
        {OPTIONS.map((opt) => {
          const active = urgency === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              disabled={pending}
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
        <p className="mt-2 text-[13px] leading-snug text-red-700">{error}</p>
      ) : null}
    </div>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

import {
  updateSubmissionUrgency,
  type SubmissionUrgencyValue,
} from "@/app/(protected)/inbox/[id]/actions";
import {
  CLINICAL_URGENCY_OPTIONS,
  normalizeClinicalUrgency,
  type ClinicalUrgencyId,
} from "@/lib/inbox/tracker-v9-clinical";
import { cn } from "@/lib/utils";

type TrackerClinicalUrgencyProps = {
  submissionId: string;
  initialUrgency: string | null;
  suggestedUrgency: ClinicalUrgencyId;
  onUrgencyChange?: (urgency: ClinicalUrgencyId) => void;
};

/** V9 — Dringlichkeit in der Klinischen Voranalyse (steuert Folgeaktionen). */
export function TrackerClinicalUrgency({
  submissionId,
  initialUrgency,
  suggestedUrgency,
  onUrgencyChange,
}: TrackerClinicalUrgencyProps) {
  const router = useRouter();
  const [urgency, setUrgency] = useState<ClinicalUrgencyId | null>(
    normalizeClinicalUrgency(initialUrgency) ?? suggestedUrgency
  );
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    setUrgency(normalizeClinicalUrgency(initialUrgency) ?? suggestedUrgency);
  }, [initialUrgency, suggestedUrgency]);

  const select = (id: ClinicalUrgencyId) => {
    setError(null);
    startTransition(async () => {
      const res = await updateSubmissionUrgency(
        submissionId,
        id as SubmissionUrgencyValue
      );
      if (res.error) {
        setError(res.error);
        return;
      }
      setUrgency(id);
      onUrgencyChange?.(id);
      router.refresh();
    });
  };

  const active = urgency ?? suggestedUrgency;

  return (
    <div className="yd-tracker-v9-urgency" aria-busy={pending}>
      <p className="yd-tracker-v9-urgency__hint">
        KI-Vorschlag:{" "}
        {CLINICAL_URGENCY_OPTIONS.find((o) => o.id === suggestedUrgency)?.label}
      </p>
      <div
        className="yd-tracker-v9-urgency__grid"
        role="radiogroup"
        aria-label="Dringlichkeit"
      >
        {CLINICAL_URGENCY_OPTIONS.map((opt) => {
          const isActive = active === opt.id;
          const isSuggested = suggestedUrgency === opt.id && !initialUrgency;
          return (
            <button
              key={opt.id}
              type="button"
              role="radio"
              aria-checked={isActive}
              disabled={pending}
              className={cn(
                "yd-tracker-v9-urgency__btn",
                isActive && "yd-tracker-v9-urgency__btn--active",
                isSuggested && !isActive && "yd-tracker-v9-urgency__btn--suggested"
              )}
              onClick={() => select(opt.id)}
            >
              <span className="yd-tracker-v9-urgency__radio" aria-hidden />
              {opt.label}
            </button>
          );
        })}
      </div>
      {error ? (
        <p className="yd-tracker-v9-urgency__error" role="status">
          {error}
        </p>
      ) : null}
    </div>
  );
}

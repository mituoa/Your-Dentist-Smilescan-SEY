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

/** V10+ — Klinische Dringlichkeit mit „Empfohlen“ unter der KI-Option. */
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
    if (pending) return;
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
  const showSuggestedBadge = !normalizeClinicalUrgency(initialUrgency);

  return (
    <div className="yd-tracker-v11-urgency" aria-busy={pending}>
      {showSuggestedBadge ? (
        <p className="yd-tracker-v11-urgency__ki">KI-Vorschlag</p>
      ) : null}
      <div
        className="yd-tracker-v11-urgency__segmented"
        role="radiogroup"
        aria-label="Dringlichkeit"
      >
        {CLINICAL_URGENCY_OPTIONS.map((opt) => {
          const isActive = active === opt.id;
          const isRecommended = showSuggestedBadge && suggestedUrgency === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              role="radio"
              aria-checked={isActive}
              disabled={pending}
              className={cn(
                "yd-tracker-v11-urgency__option",
                isActive && "yd-tracker-v11-urgency__option--active"
              )}
              onClick={() => select(opt.id)}
            >
              <span className="yd-tracker-v11-urgency__option-label">{opt.label}</span>
              {isRecommended ? (
                <span className="yd-tracker-v11-urgency__badge">Empfohlen</span>
              ) : null}
            </button>
          );
        })}
      </div>
      {pending ? (
        <p className="yd-tracker-v11-urgency__pending" role="status">
          Wird gespeichert…
        </p>
      ) : null}
      {error ? (
        <p className="yd-tracker-v11-urgency__error" role="status" aria-live="polite">
          {error}
        </p>
      ) : null}
    </div>
  );
}

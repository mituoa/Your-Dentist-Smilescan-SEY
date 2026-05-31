import Link from "next/link";

import { PreparationStatusBlock } from "@/components/command-ai/preparation-status-block";
import { buildSubmissionPreparation } from "@/lib/command-ai/submission-preparation";
import { frameSituation } from "@/lib/command-ai/safety-copy";

type TrackerAiSummaryProps = {
  submissionId: string;
  patientName: string | null;
  patientNotes: string | null;
  photoCount: number;
  seenAt: string | null;
};

/** Tracker intelligence block — workflow support, not diagnosis. */
export function TrackerAiSummary({
  submissionId,
  patientName,
  patientNotes,
  photoCount,
  seenAt,
}: TrackerAiSummaryProps) {
  const preparation = buildSubmissionPreparation({
    id: submissionId,
    patient_name: patientName,
    patient_notes: patientNotes,
    seen_at: seenAt,
    photo_count: photoCount,
  });

  const name = patientName?.trim() || "Patient";
  const hasPhotos = photoCount > 0;

  const actionClass =
    "inline-flex items-center justify-center rounded-lg border border-[rgba(15,23,42,0.08)] bg-[#F8FAFC] px-3 py-2 text-[12px] font-medium text-[#334155] transition-colors hover:bg-[#F1F5F9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(43,111,232,0.28)]";

  return (
    <section
      id="tracker-assistenz"
      className="scroll-mt-6 rounded-2xl border border-[rgba(180,198,218,0.28)] bg-white px-4 py-4 md:px-5 md:py-5"
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#64748B]">
        AI vorbereitet
      </p>

      {preparation.responseSummary ? (
        <p className="mt-2 text-[13px] leading-relaxed text-[#475569]">
          {preparation.responseSummary}
        </p>
      ) : (
        <p className="mt-2 text-[13px] leading-relaxed text-[#475569]">
          {frameSituation(patientNotes, name)}
        </p>
      )}

      <div className="mt-3">
        <PreparationStatusBlock preparation={preparation} />
      </div>

      {hasPhotos ? (
        <div className="mt-3 border-t border-[rgba(15,23,42,0.06)] pt-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.07em] text-[#64748B]">
            Foto-Workflow
          </p>
          <ul className="mt-1.5 space-y-0.5">
            {preparation.photoChecks.map((check) => (
              <li key={check.id} className="text-[11px] leading-snug text-[#475569]">
                {check.done ? "✓" : "○"} {check.label}
              </li>
            ))}
          </ul>
          <p className="mt-1.5 text-[10px] leading-relaxed text-[#94A3B8]">
            Zur klinischen Prüfung — keine automatische Diagnose.
          </p>
        </div>
      ) : null}

      <p className="mt-3 text-[12px] font-medium leading-snug text-[#1E293B]">
        {preparation.suggestedNextStep}
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        <Link href={`/inbox/${submissionId}#tracker-korrespondenz`} className={actionClass}>
          Antwort prüfen
        </Link>
        <Link href={`/inbox/${submissionId}#tracker-termin`} className={actionClass}>
          Termin vorbereiten
        </Link>
        <Link href="/relay" className={actionClass}>
          Aufgabe erstellen
        </Link>
      </div>

      <p className="mt-3 text-[11px] leading-relaxed text-[#94A3B8]">
        Vorschläge basieren auf verfügbaren Angaben — klinische Bestätigung durch Sie erforderlich.
      </p>
    </section>
  );
}

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
  patientName,
  patientNotes,
  photoCount,
  seenAt,
}: TrackerAiSummaryProps) {
  const preparation = buildSubmissionPreparation({
    id: "tracker",
    patient_name: patientName,
    patient_notes: patientNotes,
    seen_at: seenAt,
    photo_count: photoCount,
  });

  const name = patientName?.trim() || "Patient";

  return (
    <section
      id="tracker-assistenz"
      className="scroll-mt-6 rounded-2xl border border-[rgba(180,198,218,0.28)] bg-white px-4 py-4 md:px-5 md:py-5"
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#64748B]">
        Assistenz-Zusammenfassung
      </p>
      <p className="mt-2 text-[13px] leading-relaxed text-[#475569]">
        {frameSituation(patientNotes, name)}
      </p>
      <div className="mt-3">
        <PreparationStatusBlock preparation={preparation} />
      </div>
      <p className="mt-3 text-[11px] leading-relaxed text-[#94A3B8]">
        Vorschläge basieren auf verfügbaren Angaben — klinische Bestätigung durch Sie erforderlich.
      </p>
    </section>
  );
}

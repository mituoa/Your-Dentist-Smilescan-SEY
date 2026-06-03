import { PhotoDocumentationSection } from "@/components/inbox/photo-documentation-section";
import { PhotoViewer } from "@/components/inbox/photo-viewer";
import { TrackerUrgencyChips } from "@/components/inbox/tracker-urgency-chips";
import { deriveSubmissionIssueShortLine } from "@/lib/inbox/derive-submission-issue-short-line";
import type { TrackerStatusDisplay } from "@/lib/inbox/tracker-inbox-logic";
import { getIntakeChannelLabel, type IntakeChannel } from "@/lib/submissions/intake-channel";
import { cn } from "@/lib/utils";

type TrackerCaseOverviewProps = {
  submission: {
    id: string;
    patient_name: string | null;
    patient_email: string | null;
    patient_phone: string | null;
    patient_notes: string | null;
    patient_birth_date: string | null;
    patient_external_id: string | null;
    urgency: string | null;
    created_at: string;
    is_draft: boolean;
    seen_at: string | null;
    intake_channel: IntakeChannel;
    photos: {
      id: string;
      sort_order: number;
      created_at: string;
      signed_url: string | null;
    }[];
  };
  status: TrackerStatusDisplay;
};

function formatBirthDe(value: string | null): string | null {
  if (!value) return null;
  const part = value.split("T")[0];
  const [y, m, d] = part.split("-").map((x) => parseInt(x, 10));
  if (!y || !m || !d) return null;
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("de-DE", {
    day: "numeric",
    month: "numeric",
    year: "numeric",
  });
}

function formatIntakeDate(iso: string): string {
  return new Date(iso).toLocaleDateString("de-DE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function hasMultiDayPhotos(
  photos: { created_at: string }[]
): boolean {
  const keys = new Set(photos.map((p) => p.created_at.slice(0, 10)));
  return keys.size > 1;
}

export function TrackerCaseOverview({ submission, status }: TrackerCaseOverviewProps) {
  const patientLabel = submission.patient_name?.trim() || "Unbekannter Patient";
  const birthStr = formatBirthDe(submission.patient_birth_date);
  const idStr = submission.patient_external_id?.trim() || null;
  const concern = deriveSubmissionIssueShortLine(
    submission.patient_notes,
    submission.patient_name,
    { maxLen: 100, emptyLabel: "" }
  );

  const showPhotoTimeline =
    submission.photos.length > 0 && hasMultiDayPhotos(submission.photos);
  const note = submission.patient_notes?.trim();

  const metaParts: string[] = [];
  if (birthStr) metaParts.push(birthStr);
  if (idStr) metaParts.push(idStr);
  metaParts.push(`Eingang ${formatIntakeDate(submission.created_at)}`);

  const intakeLabel = getIntakeChannelLabel(submission.intake_channel);

  return (
    <div className="yd-tracker-case-overview">
      <header className="yd-tracker-case-overview__header">
        <div className="flex flex-wrap items-center gap-2.5">
          <h2 className="yd-tracker-case-overview__title">{patientLabel}</h2>
          <span className={cn("yd-tracker-table__status", status.className)}>
            <span className="yd-tracker-table__status-dot" aria-hidden />
            {status.label}
          </span>
          {submission.is_draft ? (
            <span className="yd-tracker-case-overview__tag">Entwurf</span>
          ) : null}
        </div>
        {concern ? (
          <p className="yd-tracker-case-overview__concern">{concern}</p>
        ) : null}
        <p className="yd-tracker-case-overview__meta">
          {metaParts.join(" · ")} · {intakeLabel}
        </p>
        {submission.patient_email?.trim() || submission.patient_phone?.trim() ? (
          <p className="yd-tracker-case-overview__contact">
            {[submission.patient_email?.trim(), submission.patient_phone?.trim()]
              .filter(Boolean)
              .join(" · ")}
          </p>
        ) : null}
      </header>

      <section className="yd-tracker-case-overview__photos" aria-label="Fotos">
        <PhotoViewer
          submissionId={submission.id}
          photos={submission.photos.map(({ id, sort_order, signed_url }) => ({
            id,
            sort_order,
            signed_url,
          }))}
          patientName={patientLabel}
        />
      </section>

      {showPhotoTimeline ? (
        <PhotoDocumentationSection
          photos={submission.photos}
          patientNotes={null}
        />
      ) : null}

      {note ? (
        <section className="yd-tracker-case-overview__note" aria-label="Patientennotiz">
          <h3 className="yd-tracker-case-overview__section-label">Anliegen</h3>
          <p className="yd-tracker-case-overview__note-text">{note}</p>
        </section>
      ) : null}

      <section
        id="tracker-empfehlung"
        className="yd-tracker-case-overview__urgency scroll-mt-16 md:scroll-mt-20"
        aria-labelledby="tracker-urgency-label"
      >
        <h3 className="yd-tracker-case-overview__section-label">Zeitraum</h3>
        <TrackerUrgencyChips
          submissionId={submission.id}
          initialUrgency={submission.urgency}
        />
      </section>
    </div>
  );
}

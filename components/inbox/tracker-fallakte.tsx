import { TrackerCaseTimeline } from "@/components/inbox/tracker-case-timeline";
import { TrackerMetadataPanel } from "@/components/inbox/tracker-metadata-panel";
import { TrackerPhotoStage } from "@/components/inbox/tracker-photo-stage";
import type { TrackerTimelineEvent } from "@/lib/inbox/build-tracker-workspace";
import type { TrackerStatusDisplay } from "@/lib/inbox/tracker-inbox-logic";
import type { YdCaseProductStatus } from "@/lib/inbox/tracker-product-status";
import type { IntakeChannel } from "@/lib/submissions/intake-channel";

type TrackerFallakteProps = {
  submissionId: string;
  patientName: string;
  productStatus: YdCaseProductStatus;
  concernLine: string | null;
  photos: {
    id: string;
    sort_order: number;
    created_at: string;
    signed_url: string | null;
  }[];
  showPhotoTrailHint: boolean;
  timeline: TrackerTimelineEvent[];
  status: TrackerStatusDisplay;
  birthDate: string | null;
  createdAt: string;
  urgency: string | null;
  intakeChannel: IntakeChannel;
  isDraft?: boolean;
  patientEmail?: string | null;
  patientPhone?: string | null;
};

export function TrackerFallakte({
  submissionId,
  patientName,
  productStatus,
  concernLine,
  photos,
  showPhotoTrailHint,
  timeline,
  status,
  birthDate,
  createdAt,
  urgency,
  intakeChannel,
  isDraft,
  patientEmail,
  patientPhone,
}: TrackerFallakteProps) {
  return (
    <div className="yd-tracker-fallakte">
      <header className="yd-tracker-fallakte__head">
        <h2 className="yd-tracker-fallakte__patient">{patientName}</h2>
        <p className="yd-tracker-fallakte__status">{productStatus.fallakteLabel}</p>
        {concernLine ? (
          <p className="yd-tracker-fallakte__concern">{concernLine}</p>
        ) : null}
      </header>

      <TrackerPhotoStage
        submissionId={submissionId}
        photos={photos}
        patientName={patientName}
        dominant
        quietHeader
        showTrailHint={showPhotoTrailHint}
      />

      <TrackerCaseTimeline events={timeline} className="yd-tracker-fallakte__timeline" />

      <TrackerMetadataPanel
        variant="minimal"
        submissionId={submissionId}
        patientName={patientName}
        status={status}
        birthDate={birthDate}
        createdAt={createdAt}
        urgency={urgency}
        intakeChannel={intakeChannel}
        isDraft={isDraft}
        patientEmail={patientEmail}
        patientPhone={patientPhone}
      />
    </div>
  );
}

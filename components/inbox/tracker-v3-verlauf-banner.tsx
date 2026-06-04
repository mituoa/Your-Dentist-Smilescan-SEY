import type { VerlaufSummary } from "@/lib/inbox/tracker-v3-presentational";

type TrackerV3VerlaufBannerProps = {
  summary: VerlaufSummary;
};

/** Eine Verlaufskontrolle — nicht vier getrennte Fälle. */
export function TrackerV3VerlaufBanner({ summary }: TrackerV3VerlaufBannerProps) {
  return (
    <section className="yd-tracker-v3-verlauf" aria-label="Verlaufskontrolle">
      <div className="yd-tracker-v3-verlauf__main">
        <h2 className="yd-tracker-v3-verlauf__title">{summary.title}</h2>
        <p className="yd-tracker-v3-verlauf__progress">{summary.progressLabel}</p>
      </div>
      <div className="yd-tracker-v3-verlauf__meta">
        <p>{summary.submissionsLabel}</p>
        <p>{summary.lastLabel}</p>
      </div>
    </section>
  );
}

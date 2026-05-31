import Link from "next/link";

import { COCKPIT_SECTIONS } from "@/lib/product/workflow";
import type { PatientCaseRow } from "@/lib/dashboard/command-center";

type AtlasInboxListProps = {
  cases: PatientCaseRow[];
};

const STATUS_CLASS: Record<PatientCaseRow["statusLabel"], string> = {
  Neu: "yd-med-inbox-pill--new",
  "In Bearbeitung": "yd-med-inbox-pill--progress",
  "Wartet auf Freigabe": "yd-med-inbox-pill--approval",
  Abgeschlossen: "yd-med-inbox-pill--done",
};

export function AtlasInboxList({ cases }: AtlasInboxListProps) {
  return (
    <section className="yd-med-inbox" aria-labelledby="yd-med-inbox-title">
      <div className="yd-med-inbox__head">
        <h2 id="yd-med-inbox-title" className="yd-med-section-title">
          {COCKPIT_SECTIONS.todayImportant}
        </h2>
        <Link href="/inbox" className="yd-med-link">
          {COCKPIT_SECTIONS.tracker}
        </Link>
      </div>

      {cases.length === 0 ? (
        <p className="yd-med-quiet">Keine offenen Anfragen — alles aktuell.</p>
      ) : (
        <ul className="yd-med-inbox__list">
          {cases.map((row) => (
            <li key={row.id}>
              <article className="yd-med-inbox-row">
                <span className="yd-med-inbox-row__avatar" aria-hidden>
                  {row.initials}
                </span>
                <div className="yd-med-inbox-row__main">
                  <p className="yd-med-inbox-row__name">{row.patientName}</p>
                  <p className="yd-med-inbox-row__meta">
                    {row.requestType}
                    <span className="yd-med-inbox-row__dot" aria-hidden>
                      ·
                    </span>
                    {row.receivedLabel}
                  </p>
                  <ul className="yd-med-inbox-row__checks" aria-label="Vorbereitung">
                    <li className={row.hasImages ? "yd-med-inbox-check--ok" : ""}>
                      {row.hasImages ? "✓" : "○"} Bilder vorhanden
                    </li>
                    <li className={row.replyPrepared ? "yd-med-inbox-check--ok" : ""}>
                      {row.replyPrepared ? "✓" : "○"} Antwort vorbereitet
                    </li>
                  </ul>
                </div>
                <div className="yd-med-inbox-row__actions">
                  <span className={`yd-med-inbox-pill ${STATUS_CLASS[row.statusLabel]}`}>
                    {row.statusLabel}
                  </span>
                  <Link href={row.href} className="yd-med-inbox-row__cta">
                    Prüfen
                  </Link>
                </div>
              </article>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

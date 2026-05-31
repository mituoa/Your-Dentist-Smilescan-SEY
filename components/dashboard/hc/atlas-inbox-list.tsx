import Link from "next/link";

import { COCKPIT_SECTIONS } from "@/lib/product/workflow";
import type { PatientCaseRow } from "@/lib/dashboard/command-center";

type AtlasInboxListProps = {
  cases: PatientCaseRow[];
};

const STATUS_CLASS: Record<PatientCaseRow["statusLabel"], string> = {
  Neu: "yd-cockpit-patient__pill--new",
  "In Bearbeitung": "yd-cockpit-patient__pill--progress",
  "Wartet auf Freigabe": "yd-cockpit-patient__pill--approval",
  Abgeschlossen: "yd-cockpit-patient__pill--done",
};

export function AtlasInboxList({ cases }: AtlasInboxListProps) {
  return (
    <section
      className="yd-cockpit-module yd-cockpit-module--patients"
      aria-labelledby="yd-cockpit-patients-title"
    >
      <div className="yd-cockpit-module__head">
        <h2 id="yd-cockpit-patients-title" className="yd-cockpit-module__title">
          {COCKPIT_SECTIONS.todayImportant}
        </h2>
        <Link href="/inbox" className="yd-cockpit-module__link">
          {COCKPIT_SECTIONS.tracker}
        </Link>
      </div>

      {cases.length === 0 ? (
        <p className="yd-cockpit-module__quiet">Keine offenen Anfragen — alles aktuell.</p>
      ) : (
        <ul className="yd-cockpit-patients__grid">
          {cases.map((row) => (
            <li key={row.id}>
              <article className="yd-cockpit-patient">
                <span className={`yd-cockpit-patient__pill ${STATUS_CLASS[row.statusLabel]}`}>
                  {row.statusLabel}
                </span>
                <div className="yd-cockpit-patient__top">
                  <span className="yd-cockpit-patient__avatar" aria-hidden>
                    {row.initials}
                  </span>
                  <div className="yd-cockpit-patient__intro">
                    <p className="yd-cockpit-patient__name">{row.patientName}</p>
                    <p className="yd-cockpit-patient__reason">{row.requestType}</p>
                    <p className="yd-cockpit-patient__date">{row.receivedLabel}</p>
                  </div>
                </div>
                <ul className="yd-cockpit-patient__checks" aria-label="Vorbereitung">
                  <li className={row.hasImages ? "yd-cockpit-patient__check--ok" : ""}>
                    {row.hasImages ? "✓" : "○"} Bilder vorhanden
                  </li>
                  <li className={row.replyPrepared ? "yd-cockpit-patient__check--ok" : ""}>
                    {row.replyPrepared ? "✓" : "○"} Antwort vorbereitet
                  </li>
                </ul>
                <div className="yd-cockpit-patient__foot">
                  <Link href={row.href} className="yd-cockpit-patient__cta">
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

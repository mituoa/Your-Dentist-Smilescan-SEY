import Link from "next/link";

import { COCKPIT_SECTIONS } from "@/lib/product/workflow";
import type { PatientCaseRow } from "@/lib/dashboard/command-center";

type AtlasPatientCasesProps = {
  cases: PatientCaseRow[];
};

const STATUS_CLASS: Record<PatientCaseRow["statusLabel"], string> = {
  Neu: "yd-patient-case-status--new",
  "In Bearbeitung": "yd-patient-case-status--progress",
  "Wartet auf Freigabe": "yd-patient-case-status--approval",
  Abgeschlossen: "yd-patient-case-status--done",
};

export function AtlasPatientCases({ cases }: AtlasPatientCasesProps) {
  return (
    <section className="yd-patient-cases" aria-labelledby="yd-patient-cases-title">
      <div className="yd-patient-cases-head">
        <h2 id="yd-patient-cases-title" className="yd-cockpit-section-title">
          {COCKPIT_SECTIONS.patientCases}
        </h2>
        <Link href="/inbox" className="yd-cockpit-link">
          {COCKPIT_SECTIONS.tracker}
        </Link>
      </div>
      {cases.length === 0 ? (
        <div className="yd-cockpit-empty-block">
          <p className="yd-cockpit-quiet">Keine offenen Anfragen</p>
          <p className="yd-cockpit-empty-hint">
            Neue Patienteneingänge erscheinen automatisch hier.
          </p>
        </div>
      ) : (
        <ul className="yd-patient-cases-list">
          {cases.map((row) => (
            <li key={row.id}>
              <article className="yd-patient-request-card">
                <div className="yd-patient-request-head">
                  <span className="yd-patient-request-avatar" aria-hidden>
                    {row.initials}
                  </span>
                  <div className="yd-patient-request-intro">
                    <p className="yd-patient-case-name">{row.patientName}</p>
                    <p className="yd-patient-request-type">{row.requestType}</p>
                    <p className="yd-patient-request-time">{row.receivedLabel}</p>
                  </div>
                  <span className={`yd-patient-case-status ${STATUS_CLASS[row.statusLabel]}`}>
                    {row.statusLabel}
                  </span>
                </div>
                <ul className="yd-patient-request-checks" aria-label="Vorbereitung">
                  <li className={row.hasImages ? "yd-patient-request-check--ok" : ""}>
                    {row.hasImages ? "✓" : "○"} Bilder vorhanden
                  </li>
                  <li className={row.replyPrepared ? "yd-patient-request-check--ok" : ""}>
                    {row.replyPrepared ? "✓" : "○"} Antwort vorbereitet
                  </li>
                </ul>
                <Link href={row.href} className="yd-patient-request-cta">
                  Prüfen
                </Link>
              </article>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

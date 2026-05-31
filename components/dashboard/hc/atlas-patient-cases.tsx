import Link from "next/link";

import { COCKPIT_SECTIONS } from "@/lib/product/workflow";
import type { PatientCaseRow } from "@/lib/dashboard/command-center";

type AtlasPatientCasesProps = {
  cases: PatientCaseRow[];
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
        <p className="yd-cockpit-quiet">Alles aktuell</p>
      ) : (
        <ul className="yd-patient-cases-list">
          {cases.map((row) => (
            <li key={row.id}>
              <Link href={row.href} className="yd-patient-case-row yd-patient-case-row--rich">
                <div className="yd-patient-case-main">
                  <p className="yd-patient-case-name">{row.patientName}</p>
                  <p className="yd-patient-case-type">{row.concern}</p>
                </div>
                <div className="yd-patient-case-tags">
                  <span className="yd-patient-case-tag">{row.attachmentsLabel}</span>
                  <span
                    className={
                      row.urgencyLabel === "Dringend"
                        ? "yd-patient-case-tag yd-patient-case-tag--urgent"
                        : "yd-patient-case-tag"
                    }
                  >
                    {row.urgencyLabel}
                  </span>
                </div>
                <p className="yd-patient-case-ai">{row.aiPrepared}</p>
                <div className="yd-patient-case-foot">
                  <span className="yd-patient-case-status">{row.statusLabel}</span>
                  <span className="yd-patient-case-action">{row.nextAction}</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

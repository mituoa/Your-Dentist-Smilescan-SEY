"use client";

import Link from "next/link";

import { YD } from "@/lib/design/yd-design-tokens";

export type KpiReviewPatientLine = {
  name: string;
  concern: string;
};

type KpiReviewHoverPreviewProps = {
  patients: KpiReviewPatientLine[];
  ctaHref?: string;
};

export function KpiReviewHoverPreview({
  patients,
  ctaHref = "/inbox",
}: KpiReviewHoverPreviewProps) {
  return (
    <div className="yd-dash-kpi-review-preview">
      <ul className="yd-dash-kpi-review-preview__list">
        {patients.length === 0 ? (
          <li className="yd-dash-kpi-review-preview__empty text-[11px] leading-snug">
            Keine Antworten warten auf Ihre Prüfung.
          </li>
        ) : (
          patients.map((patient) => (
            <li key={`${patient.name}-${patient.concern}`} className="yd-dash-kpi-review-preview__item">
              <p className="yd-dash-kpi-review-preview__name">{patient.name}</p>
              <p className="yd-dash-kpi-review-preview__concern">{patient.concern}</p>
              <p className="yd-dash-kpi-review-preview__status">Antwort vorbereitet</p>
            </li>
          ))
        )}
      </ul>
      {patients.length > 0 ? (
        <Link
          href={ctaHref}
          className="yd-dash-kpi-review-preview__cta"
          style={{ color: YD.accent.core }}
        >
          Alle prüfen
        </Link>
      ) : null}
    </div>
  );
}

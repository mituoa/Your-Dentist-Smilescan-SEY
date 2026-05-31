import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";

import { HcCard } from "@/components/design/hc-card";
import { deriveSubmissionIssueShortLine } from "@/lib/inbox/derive-submission-issue-short-line";
import { YD } from "@/lib/design/yd-design-tokens";
import type { DashboardPriorityItem } from "@/lib/queries/dashboard";

function patientInitials(name: string | null): string {
  const parts = (name || "Patient").trim().split(/\s+/).filter(Boolean);
  return parts
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("") || "P";
}

type DashboardTodayPriorityProps = {
  items: DashboardPriorityItem[] | null;
  readyCount: number | null;
};

export function DashboardTodayPriority({ items, readyCount }: DashboardTodayPriorityProps) {
  const countLabel =
    readyCount === null
      ? "—"
      : readyCount === 1
        ? "1 Antwort wartet auf Ihre Prüfung"
        : `${readyCount} Antworten warten auf Ihre Prüfung`;

  return (
    <section className="yd-dash-today min-w-0" aria-labelledby="yd-dash-today-title">
      <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 id="yd-dash-today-title" className="yd-dash-section text-[1.0625rem] md:text-[1.125rem]">
            Heute wichtig
          </h2>
          <p className="yd-dash-today-count mt-0.5 text-[13px] font-medium" style={{ color: YD.text.secondary }}>
            {countLabel}
          </p>
        </div>
        <Link
          href="/inbox"
          className="text-[12px] font-medium transition hover:opacity-80"
          style={{ color: YD.accent.core }}
        >
          Alle Fälle
        </Link>
      </div>

      {items === null ? (
        <HcCard tone="default" className="yd-dash-surface p-5">
          <p className="text-[13px]" style={{ color: YD.text.secondary }}>
            Fälle momentan nicht verfügbar.
          </p>
        </HcCard>
      ) : items.length === 0 ? (
        <HcCard tone="default" className="yd-dash-surface p-5">
          <p className="text-[13px] font-medium" style={{ color: YD.text.primary }}>
            Keine offenen Prüfungen
          </p>
          <p className="mt-1 text-[12px]" style={{ color: YD.text.muted }}>
            Neue Patientenfälle erscheinen hier zuerst.
          </p>
        </HcCard>
      ) : (
        <ul className="flex flex-col gap-3">
          {items.map((item) => {
            const isUnseen = !item.seen_at;
            const issue = deriveSubmissionIssueShortLine(item.patient_notes, item.patient_name, {
              maxLen: 72,
              emptyLabel: "Anliegen in der Fallakte",
            });
            const displayName = (item.patient_name || "Patient").trim();

            return (
              <li key={item.id}>
                <HcCard
                  tone="default"
                  className="yd-dash-surface yd-dash-patient-card yd-dash-interactive-card p-4 md:p-5"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex min-w-0 gap-3">
                      <div
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[12px] font-semibold tracking-wide text-white"
                        style={{
                          background: YD.accent.iconGradient,
                          boxShadow: "0 4px 14px rgba(47, 128, 237, 0.22)",
                        }}
                        aria-hidden
                      >
                        {patientInitials(item.patient_name)}
                      </div>
                      <div className="min-w-0">
                        <p className="yd-dash-patient-name truncate text-[15px] font-semibold md:text-[16px]">
                          {displayName}
                        </p>
                        <p
                          className="mt-0.5 line-clamp-2 text-[13px] leading-snug"
                          style={{ color: YD.text.secondary }}
                        >
                          {issue}
                        </p>
                        <ul className="mt-2.5 flex flex-wrap gap-2">
                          {isUnseen ? (
                            <li className="yd-dash-chip yd-dash-chip--ok">
                              <Check className="h-3 w-3 shrink-0" strokeWidth={2.5} aria-hidden />
                              Antwort vorbereitet
                            </li>
                          ) : (
                            <li className="yd-dash-chip">In Bearbeitung</li>
                          )}
                          {item.photo_count > 0 ? (
                            <li className="yd-dash-chip yd-dash-chip--ok">
                              <Check className="h-3 w-3 shrink-0" strokeWidth={2.5} aria-hidden />
                              Bilder geprüft
                            </li>
                          ) : null}
                          {item.patient_notes?.trim() ? (
                            <li className="yd-dash-chip yd-dash-chip--ok">
                              <Check className="h-3 w-3 shrink-0" strokeWidth={2.5} aria-hidden />
                              Anliegen erfasst
                            </li>
                          ) : null}
                        </ul>
                      </div>
                    </div>
                    <Link
                      href={`/inbox/${item.id}`}
                      className="yd-dash-primary-action inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-full px-5 text-[13px] font-semibold text-white transition hover:brightness-[1.03] active:scale-[0.99] sm:min-w-[168px]"
                    >
                      {isUnseen ? "Prüfen" : "Fall öffnen"}
                      <ArrowRight className="h-4 w-4" strokeWidth={2} aria-hidden />
                    </Link>
                  </div>
                </HcCard>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

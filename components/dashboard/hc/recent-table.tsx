import Link from "next/link";

import { MessageDraftStatusBadge } from "@/components/inbox/message-draft-status-badge";
import { PreparationStatusBlock } from "@/components/command-ai/preparation-status-block";
import { isSubmissionReadyForReview } from "@/lib/message-drafts/list-status";
import { HcCard } from "@/components/design/hc-card";
import { YdStatusPill } from "@/components/design-system/yd-status-pill";
import type { SubmissionPreparation } from "@/lib/command-ai/types";
import { deriveSubmissionIssueShortLine } from "@/lib/inbox/derive-submission-issue-short-line";
import { YD } from "@/lib/design/yd-design-tokens";
import type { SubmissionPreviewRow } from "@/lib/queries/dashboard";

type SubmissionStatus = {
  label: string;
  variant: "active" | "calm" | "done" | "pending";
};

function resolveSubmissionStatus(
  row: SubmissionPreviewRow,
  preparation?: SubmissionPreparation
): SubmissionStatus {
  if (preparation?.readyForReview) {
    return { label: "Freigabe ausstehend", variant: "pending" };
  }
  if (!row.seen_at) {
    return { label: "Neu", variant: "active" };
  }
  return { label: "In Bearbeitung", variant: "calm" };
}

type RecentTableProps = {
  rows: SubmissionPreviewRow[] | null;
  preparationById?: Record<string, SubmissionPreparation>;
};

export function HcRecentTable({ rows, preparationById = {} }: RecentTableProps) {
  const columns = ["Patient", "Anliegen", "Vorbereitung", "Status", "Datum", "Aktion"] as const;
  const orderedRows =
    rows === null
      ? null
      : [...rows].sort((a, b) => {
          const pa = preparationById[a.id];
          const pb = preparationById[b.id];
          const aNeeds = pa?.readyForReview ? 1 : 0;
          const bNeeds = pb?.readyForReview ? 1 : 0;
          if (aNeeds !== bNeeds) return bNeeds - aNeeds;
          const aUnseen = !a.seen_at ? 1 : 0;
          const bUnseen = !b.seen_at ? 1 : 0;
          if (aUnseen !== bUnseen) return bUnseen - aUnseen;
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });

  return (
    <HcCard tone="primary" ambient={false} className="yd-dash-surface yd-dash-recent-table max-w-full overflow-hidden p-0">
      <div
        className="flex items-center justify-between gap-4 px-5 py-4 md:px-6 md:py-5"
        style={{
          background: YD.surface.tableHead,
          borderBottom: `1px solid ${YD.border.soft}`,
        }}
      >
        <div>
          <p className="yd-dash-section yd-dash-section--primary">Aktuelle Einsendungen</p>
          <p className="mt-1 text-[11px] font-medium leading-snug" style={{ color: YD.text.muted }}>
            Vorbereitung wird automatisch erstellt — Sie prüfen und geben frei.
          </p>
        </div>
        <Link
          href="/inbox"
          prefetch
          className="shrink-0 text-[12px] font-medium transition hover:opacity-80"
          style={{ color: YD.accent.core }}
        >
          Alle anzeigen
        </Link>
      </div>

      <div className="yd-dash-recent-mobile md:hidden">
        {orderedRows === null ? (
          <div className="yd-mobile-empty">
            <p className="yd-mobile-empty__title">Übersicht momentan nicht verfügbar</p>
            <p className="yd-mobile-empty__copy">
              Bitte Seite erneut laden — Ihre Patientenfälle bleiben unverändert.
            </p>
          </div>
        ) : orderedRows.length === 0 ? (
          <div className="yd-mobile-empty">
            <p className="yd-mobile-empty__title">Keine offenen Vorgänge</p>
            <p className="yd-mobile-empty__copy">
              Alle Patientenfälle sind bearbeitet. Neue Einsendungen erscheinen automatisch hier.
            </p>
          </div>
        ) : (
          <div className="yd-mobile-row-cards">
            {orderedRows.map((row) => {
              const name = row.patient_name?.trim() || "Patient";
              const issue = deriveSubmissionIssueShortLine(row.patient_notes, row.patient_name, {
                maxLen: 80,
                emptyLabel: "—",
              });
              const date = new Date(row.created_at).toLocaleDateString("de-DE", {
                day: "2-digit",
                month: "short",
              });
              const preparation = preparationById[row.id];
              const status = resolveSubmissionStatus(row, preparation);
              const actionLabel = preparation?.readyForReview ? "Prüfen" : "Fall öffnen";

              return (
                <Link key={row.id} href={`/inbox/${row.id}`} prefetch className="yd-mobile-row-card">
                  <div className="yd-mobile-row-card__head">
                    <p className="yd-mobile-row-card__title">{name}</p>
                    <YdStatusPill label={status.label} variant={status.variant} className="shrink-0 text-[10px] font-medium" />
                  </div>
                  <p className="yd-mobile-row-card__line">{issue}</p>
                  <div className="yd-mobile-row-card__meta-row">
                    <MessageDraftStatusBadge
                      draftStatus={row.message_draft_status ?? "none"}
                      readyForReview={preparation?.readyForReview ?? isSubmissionReadyForReview(row)}
                    />
                  </div>
                  <div className="yd-mobile-row-card__foot">
                    <span className="yd-mobile-row-card__date">{date}</span>
                    <span className="yd-mobile-row-card__cta">{actionLabel}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      <div className="hidden max-w-full overflow-x-auto overscroll-x-contain md:block">
        <table className="w-full min-w-[760px] border-collapse text-left">
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col}
                  className="whitespace-nowrap px-5 py-3 text-[10px] font-medium uppercase tracking-[0.07em] md:px-6"
                  style={{ color: YD.text.faint }}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {orderedRows === null ? (
              <tr>
                <td colSpan={6} className="px-6 py-12">
                  <div className="yd-dash-empty-state mx-auto max-w-sm text-center">
                    <p className="text-[13px] font-medium" style={{ color: YD.text.primary }}>
                      Übersicht momentan nicht verfügbar
                    </p>
                    <p className="mt-1 text-[12px] leading-relaxed" style={{ color: YD.text.muted }}>
                      Bitte Seite erneut laden — Ihre Patientenfälle bleiben unverändert.
                    </p>
                  </div>
                </td>
              </tr>
            ) : orderedRows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12">
                  <div className="yd-dash-empty-state mx-auto max-w-sm text-center">
                    <p className="text-[13px] font-medium" style={{ color: YD.text.primary }}>
                      Keine offenen Vorgänge
                    </p>
                    <p className="mt-1 text-[12px] leading-relaxed" style={{ color: YD.text.muted }}>
                      Alle Patientenfälle sind bearbeitet. Neue Einsendungen erscheinen automatisch hier.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              orderedRows.map((row) => {
                const name = row.patient_name?.trim() || "Patient";
                const issue = deriveSubmissionIssueShortLine(row.patient_notes, row.patient_name, {
                  maxLen: 52,
                  emptyLabel: "—",
                });
                const date = new Date(row.created_at).toLocaleDateString("de-DE", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                });
                const preparation = preparationById[row.id];
                const status = resolveSubmissionStatus(row, preparation);
                const actionLabel = preparation?.readyForReview ? "Prüfen" : "Fall öffnen";
                const doneChecks = preparation?.checks?.filter((c) => c.done).length ?? 0;
                const prepSummary = preparation
                  ? preparation.readyForReview
                    ? "Vorbereitet · Freigabe ausstehend"
                    : doneChecks > 0
                      ? `Vorarbeit vorhanden · ${doneChecks} ${doneChecks === 1 ? "Schritt" : "Schritte"}`
                      : "Noch keine Vorarbeit"
                  : "Noch keine Vorarbeit";

                return (
                  <tr
                    key={row.id}
                    className="group border-t transition-colors duration-200 hover:bg-[rgba(248,252,255,0.94)]"
                    style={{ borderColor: "rgba(180, 198, 218, 0.22)" }}
                  >
                    <td className="min-w-[128px] px-5 py-3.5 md:px-6">
                      <span
                        className="yd-dash-patient-name block truncate text-[13px] font-semibold leading-snug"
                        style={{ color: YD.text.primary }}
                      >
                        {name}
                      </span>
                    </td>
                    <td
                      className="max-w-[180px] truncate px-5 py-3.5 text-[12px] leading-snug md:px-6"
                      style={{ color: YD.text.secondary }}
                      title={issue}
                    >
                      {issue}
                    </td>
                    <td className="min-w-[168px] max-w-[220px] px-5 py-3.5 md:px-6">
                      <div className="yd-dash-prep-cell min-w-0">
                        <div className="flex min-w-0 flex-wrap items-center gap-1.5">
                          <span className="yd-dash-prep-summary text-[11px]" style={{ color: YD.text.faint }}>
                            {prepSummary}
                          </span>
                          <MessageDraftStatusBadge
                            draftStatus={row.message_draft_status ?? "none"}
                            readyForReview={
                              preparation?.readyForReview ?? isSubmissionReadyForReview(row)
                            }
                          />
                        </div>
                        {preparation ? (
                          <div className="yd-dash-prep-details mt-1">
                            <PreparationStatusBlock preparation={preparation} compact />
                          </div>
                        ) : null}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-5 py-3.5 md:px-6">
                      <YdStatusPill
                        label={status.label}
                        variant={status.variant}
                        className="text-[10px] font-medium"
                      />
                    </td>
                    <td
                      className="whitespace-nowrap px-5 py-3.5 text-[12px] tabular-nums md:px-6"
                      style={{ color: YD.text.muted }}
                    >
                      {date}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3.5 md:px-6">
                      <Link
                        href={`/inbox/${row.id}`}
                        prefetch
                        className="yd-dash-table-action text-[12px] font-medium no-underline transition hover:opacity-75"
                        style={{
                          color: preparation?.readyForReview ? YD.accent.core : YD.text.secondary,
                        }}
                      >
                        {actionLabel}
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </HcCard>
  );
}

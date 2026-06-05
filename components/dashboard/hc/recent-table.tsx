import Link from "next/link";

import { HcCard } from "@/components/design/hc-card";
import {
  buildDashboardAttentionRowCopy,
  dashboardRowNeedsAttention,
} from "@/lib/dashboard/dashboard-status-copy";
import type { SubmissionPreparation } from "@/lib/command-ai/types";
import { deriveSubmissionIssueShortLine } from "@/lib/inbox/derive-submission-issue-short-line";
import { YD } from "@/lib/design/yd-design-tokens";
import type { SubmissionPreviewRow } from "@/lib/queries/dashboard";
import { cn } from "@/lib/utils";

type RecentTableProps = {
  rows: SubmissionPreviewRow[] | null;
  preparationById?: Record<string, SubmissionPreparation>;
  /** Mobile: maximale Anzahl sichtbarer Karten (Rest über „Alle anzeigen“). */
  mobileLimit?: number;
  /** Mobile: kompaktere Kopfzeile ohne Vollbild-Wirkung. */
  compactMobile?: boolean;
};

function sortAttentionRows(
  rows: SubmissionPreviewRow[],
  preparationById: Record<string, SubmissionPreparation>
): SubmissionPreviewRow[] {
  return [...rows].sort((a, b) => {
    const copyA = buildDashboardAttentionRowCopy(a, preparationById[a.id]);
    const copyB = buildDashboardAttentionRowCopy(b, preparationById[b.id]);
    if (copyA.priority !== copyB.priority) return copyA.priority - copyB.priority;
    const aUnseen = !a.seen_at ? 1 : 0;
    const bUnseen = !b.seen_at ? 1 : 0;
    if (aUnseen !== bUnseen) return bUnseen - aUnseen;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
}

function AttentionRow({
  row,
  preparation,
  className,
}: {
  row: SubmissionPreviewRow;
  preparation?: SubmissionPreparation;
  className?: string;
}) {
  const name = row.patient_name?.trim() || "Patient";
  const issue = deriveSubmissionIssueShortLine(row.patient_notes, row.patient_name, {
    maxLen: 80,
    emptyLabel: "Patientenanliegen",
  });
  const { preparationLine, actionLabel } = buildDashboardAttentionRowCopy(row, preparation);

  return (
    <Link
      href={`/inbox/${row.id}`}
      prefetch
      className={cn("yd-dash-attention-row", className)}
    >
      <div className="yd-dash-attention-row__main">
        <p className="yd-dash-attention-row__name">{name}</p>
        <p className="yd-dash-attention-row__issue">{issue}</p>
        <p className="yd-dash-attention-row__prep">{preparationLine}</p>
      </div>
      <span className="yd-dash-attention-row__action">{actionLabel}</span>
    </Link>
  );
}

export function HcRecentTable({
  rows,
  preparationById = {},
  mobileLimit,
  compactMobile = false,
}: RecentTableProps) {
  const attentionRows =
    rows === null
      ? null
      : sortAttentionRows(
          rows.filter((row) => dashboardRowNeedsAttention(row, preparationById[row.id])),
          preparationById
        );

  const mobileRows =
    attentionRows === null || mobileLimit == null
      ? attentionRows
      : attentionRows.slice(0, mobileLimit);
  const mobileOverflow =
    attentionRows !== null && mobileLimit != null && attentionRows.length > mobileLimit
      ? attentionRows.length - mobileLimit
      : 0;

  return (
    <HcCard
      tone="primary"
      ambient={false}
      className={cn(
        "yd-dash-surface yd-dash-recent-table max-w-full overflow-hidden p-0",
        compactMobile && "yd-dash-recent-table--compact-mobile"
      )}
    >
      <div
        className={cn(
          "flex items-center justify-between gap-4 px-5 py-4 md:px-6 md:py-5",
          compactMobile && "max-md:px-4 max-md:py-3"
        )}
        style={{
          background: YD.surface.tableHead,
          borderBottom: `1px solid ${YD.border.soft}`,
        }}
      >
        <div className="min-w-0">
          <p className="yd-dash-section yd-dash-section--primary">Aufmerksamkeit benötigt</p>
          {!compactMobile ? (
            <p className="mt-1 text-[11px] font-medium leading-snug" style={{ color: YD.text.muted }}>
              Was heute Ihre Entscheidung oder Freigabe erwartet — vollständige Fälle im Tracker.
            </p>
          ) : (
            <p
              className="mt-0.5 text-[10px] font-medium leading-snug max-md:block md:hidden"
              style={{ color: YD.text.muted }}
            >
              Vollständige Liste im Tracker
            </p>
          )}
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
        {mobileRows === null ? (
          <div className="yd-mobile-empty">
            <p className="yd-mobile-empty__title">Übersicht momentan nicht verfügbar</p>
            <p className="yd-mobile-empty__copy">
              Bitte Seite erneut laden — Ihre Patientenfälle bleiben unverändert.
            </p>
          </div>
        ) : mobileRows.length === 0 ? (
          <div className="yd-mobile-empty">
            <p className="yd-mobile-empty__title">Keine dringenden Vorgänge</p>
            <p className="yd-mobile-empty__copy">
              Heute liegt nichts vor, das sofort Ihre Aufmerksamkeit benötigt.
            </p>
          </div>
        ) : (
          <div className="yd-dash-attention-list">
            {mobileRows.map((row) => (
              <AttentionRow
                key={row.id}
                row={row}
                preparation={preparationById[row.id]}
              />
            ))}
          </div>
        )}
        {mobileOverflow > 0 ? (
          <div className="yd-dash-recent-mobile-more px-4 pb-3 pt-0">
            <Link
              href="/inbox"
              prefetch
              className="inline-flex min-h-[40px] w-full items-center justify-center rounded-xl border border-[rgba(180,198,218,0.32)] bg-[rgba(248,251,254,0.9)] text-[12px] font-semibold text-[#2F80ED] no-underline"
            >
              {mobileOverflow} weitere {mobileOverflow === 1 ? "Vorgang" : "Vorgänge"} im Tracker
            </Link>
          </div>
        ) : null}
      </div>

      <div className="hidden md:block">
        {attentionRows === null ? (
          <div className="yd-dash-empty-state px-6 py-12 text-center">
            <p className="text-[13px] font-medium" style={{ color: YD.text.primary }}>
              Übersicht momentan nicht verfügbar
            </p>
            <p className="mt-1 text-[12px] leading-relaxed" style={{ color: YD.text.muted }}>
              Bitte Seite erneut laden — Ihre Patientenfälle bleiben unverändert.
            </p>
          </div>
        ) : attentionRows.length === 0 ? (
          <div className="yd-dash-empty-state px-6 py-12 text-center">
            <p className="text-[13px] font-medium" style={{ color: YD.text.primary }}>
              Keine dringenden Vorgänge
            </p>
            <p className="mt-1 text-[12px] leading-relaxed" style={{ color: YD.text.muted }}>
              Heute liegt nichts vor, das sofort Ihre Aufmerksamkeit benötigt.
            </p>
          </div>
        ) : (
          <div className="yd-dash-attention-list">
            {attentionRows.map((row) => (
              <AttentionRow
                key={row.id}
                row={row}
                preparation={preparationById[row.id]}
              />
            ))}
          </div>
        )}
      </div>
    </HcCard>
  );
}

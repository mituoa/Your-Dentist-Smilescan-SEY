import Link from "next/link";

import { HcCard } from "@/components/design/hc-card";
import { YdStatusPill } from "@/components/design-system/yd-status-pill";
import { deriveSubmissionIssueShortLine } from "@/lib/inbox/derive-submission-issue-short-line";
import { YD } from "@/lib/design/yd-design-tokens";
import type { SubmissionPreviewRow } from "@/lib/queries/dashboard";

type SubmissionStatus = {
  label: string;
  variant: "active" | "calm" | "done" | "pending";
};

function resolveSubmissionStatus(row: SubmissionPreviewRow): SubmissionStatus {
  if (!row.seen_at) {
    return { label: "Neu", variant: "active" };
  }
  return { label: "In Bearbeitung", variant: "calm" };
}

type RecentTableProps = {
  rows: SubmissionPreviewRow[] | null;
};

export function HcRecentTable({ rows }: RecentTableProps) {
  const columns = ["Patient", "Anliegen", "Status", "Datum", "Aktion"] as const;

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
          <p className="yd-dash-section yd-dash-section--secondary">Aktuelle Einsendungen</p>
        </div>
        <Link
          href="/inbox"
          className="shrink-0 text-[12px] font-medium transition hover:opacity-80"
          style={{ color: YD.accent.core }}
        >
          Alle anzeigen
        </Link>
      </div>

      <div className="max-w-full overflow-x-auto overscroll-x-contain">
        <table className="w-full min-w-[620px] border-collapse text-left">
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
            {rows === null ? (
              <tr>
                <td colSpan={5} className="px-6 py-12">
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
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12">
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
              rows.map((row) => {
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
                const status = resolveSubmissionStatus(row);

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
                      className="max-w-[200px] truncate px-5 py-3.5 text-[12px] leading-snug md:px-6"
                      style={{ color: YD.text.secondary }}
                      title={issue}
                    >
                      {issue}
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
                        className="yd-dash-table-action text-[12px] font-medium no-underline transition hover:opacity-75"
                        style={{ color: YD.text.secondary }}
                      >
                        Fall öffnen
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

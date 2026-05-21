import Link from "next/link";
import { Calendar } from "lucide-react";

import { HcCard } from "@/components/design/hc-card";
import { HcFilterChip } from "@/components/dashboard/hc/hc-filter-chip";
import { YdStatusPill } from "@/components/design-system/yd-status-pill";
import { YD } from "@/lib/design/yd-design-tokens";
import type { SubmissionPreviewRow } from "@/lib/queries/dashboard";

function statusVariant(row: SubmissionPreviewRow): "active" | "calm" {
  return row.seen_at ? "calm" : "active";
}

function statusLabel(row: SubmissionPreviewRow) {
  return row.seen_at ? "In Bearbeitung" : "Ungelesen";
}

function roomId(id: string) {
  return `R${id.replace(/-/g, "").slice(0, 5).toUpperCase()}`;
}

type RecentTableProps = {
  rows: SubmissionPreviewRow[] | null;
};

export function HcRecentTable({ rows }: RecentTableProps) {
  const columns = ["", "Fall", "Patient", "Eingang", "Status"] as const;

  return (
    <HcCard tone="primary" className="max-w-full overflow-hidden p-0">
      <div
        className="flex items-center justify-between gap-4 px-6 py-5 md:px-7"
        style={{
          background: YD.surface.tableHead,
          borderBottom: `1px solid ${YD.border.soft}`,
        }}
      >
        <div>
          <p className="yd-dash-section">Aktuelle Einsendungen</p>
          <p className="yd-dash-meta mt-1.5 normal-case tracking-normal">
            Klinische Übersicht — schnell scannbar
          </p>
        </div>
        <HcFilterChip icon={<Calendar className="h-3.5 w-3.5" strokeWidth={1.65} />}>
          Aktuell
        </HcFilterChip>
      </div>

      <div className="max-w-full overflow-x-auto overscroll-x-contain">
        <table className="yd-dash-table w-full border-collapse text-left">
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col || "cb"}
                  className="whitespace-nowrap px-5 py-4 text-[10px] font-medium uppercase tracking-[0.1em] md:px-6"
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
                <td
                  colSpan={5}
                  className="px-6 py-12 text-center text-[13px] leading-relaxed"
                  style={{ color: YD.text.secondary }}
                >
                  Daten momentan nicht verfügbar.
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-12 text-center text-[13px] leading-relaxed"
                  style={{ color: YD.text.secondary }}
                >
                  Noch keine Einsendungen in diesem Ausschnitt.
                </td>
              </tr>
            ) : (
              rows.map((row) => {
                const name = row.patient_name?.trim() || "Patient";
                const email = row.patient_email?.trim() || "—";
                const date = new Date(row.created_at).toLocaleDateString("de-DE", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                });
                return (
                  <tr
                    key={row.id}
                    className="yd-dash-table-row group border-t"
                  >
                    <td className="px-5 py-4 md:px-6">
                      <span
                        className="inline-block h-[17px] w-[17px] rounded-[6px] border bg-white/90 transition-colors group-hover:border-[rgba(47,128,237,0.25)]"
                        style={{ borderColor: "rgba(180, 198, 218, 0.5)" }}
                        aria-hidden
                      />
                    </td>
                    <td
                      className="whitespace-nowrap px-5 py-4 font-medium tabular-nums md:px-6"
                      style={{ color: YD.text.muted }}
                    >
                      <span className="text-[12px] tracking-wide">{roomId(row.id)}</span>
                    </td>
                    <td className="min-w-[200px] px-5 py-4 md:px-6">
                      <Link
                        href={`/inbox/${row.id}`}
                        className="flex items-center gap-3.5 no-underline"
                      >
                        <span
                          className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full text-[12px] font-medium"
                          style={{
                            background: "linear-gradient(145deg, #E8F3FC 0%, #D6E8F8 100%)",
                            color: YD.accent.deep,
                            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.9)",
                          }}
                        >
                          {name.charAt(0).toUpperCase()}
                        </span>
                        <span className="min-w-0">
                          <span
                            className="block truncate text-[14px] font-medium leading-snug"
                            style={{ color: YD.text.primary }}
                          >
                            {name}
                          </span>
                          <span
                            className="mt-0.5 block truncate text-[12px] leading-relaxed"
                            style={{ color: YD.text.faint }}
                          >
                            {email}
                          </span>
                        </span>
                      </Link>
                    </td>
                    <td
                      className="whitespace-nowrap px-5 py-4 text-[13px] leading-relaxed md:px-6"
                      style={{ color: YD.text.muted }}
                    >
                      {date}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 md:px-6">
                      <YdStatusPill
                        label={statusLabel(row)}
                        variant={statusVariant(row)}
                        className="text-[11px] font-medium"
                      />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div
        className="flex justify-end px-6 py-4 md:px-7"
        style={{ borderTop: `1px solid ${YD.border.soft}` }}
      >
        <Link
          href="/inbox"
          className="text-[12px] font-medium tracking-wide transition hover:underline"
          style={{ color: YD.accent.core }}
        >
          Alle Einsendungen öffnen →
        </Link>
      </div>
    </HcCard>
  );
}

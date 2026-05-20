import Link from "next/link";
import { Calendar } from "lucide-react";

import { HcCard } from "@/components/design/hc-card";
import { HcFilterChip } from "@/components/dashboard/hc/hc-filter-chip";
import { HC } from "@/lib/design/healthcare-dashboard-tokens";
import type { SubmissionPreviewRow } from "@/lib/queries/dashboard";

function statusForRow(row: SubmissionPreviewRow) {
  if (!row.seen_at) {
    return { label: "Ungelesen", ...HC.statusHospital, dot: HC.statusHospital.dot };
  }
  return { label: "In Bearbeitung", ...HC.statusConsultation, dot: HC.statusConsultation.dot };
}

function roomId(id: string) {
  return `R${id.replace(/-/g, "").slice(0, 5).toUpperCase()}`;
}

type RecentTableProps = {
  rows: SubmissionPreviewRow[] | null;
};

export function HcRecentTable({ rows }: RecentTableProps) {
  const columns = ["", "Nr. / Raum", "Patient", "Eingang", "Status"] as const;

  return (
    <HcCard className="max-w-full overflow-hidden p-0">
      <div
        className="flex items-center justify-between gap-3 border-b px-5 py-4 md:px-6"
        style={{ borderColor: HC.borderSoft }}
      >
        <p className="text-[15px] font-semibold" style={{ color: HC.text }}>
          Aktuelle Einsendungen
        </p>
        <HcFilterChip icon={<Calendar className="h-3.5 w-3.5" />}>Aktuell</HcFilterChip>
      </div>

      <div className="max-w-full overflow-x-auto overscroll-x-contain">
        <table className="w-full border-collapse text-left text-[13px]">
          <thead>
            <tr style={{ backgroundColor: "#F1F5F9" }}>
              {columns.map((col) => (
                <th
                  key={col || "cb"}
                  className="whitespace-nowrap px-4 py-3.5 text-[10px] font-semibold uppercase tracking-[0.06em] md:px-5"
                  style={{ color: HC.textMuted }}
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
                  className="px-5 py-10 text-center text-[13px]"
                  style={{ color: HC.textSecondary }}
                >
                  Daten momentan nicht verfügbar.
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-5 py-10 text-center text-[13px]"
                  style={{ color: HC.textSecondary }}
                >
                  Noch keine Einsendungen in diesem Ausschnitt.
                </td>
              </tr>
            ) : (
              rows.map((row) => {
                const status = statusForRow(row);
                const name = row.patient_name?.trim() || "Patient";
                const email = row.patient_email?.trim() || "—";
                const date = new Date(row.created_at).toLocaleDateString("de-DE", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                });
                return (
                  <tr
                    key={row.id}
                    className="border-t transition-colors hover:bg-[#FAFCFF]"
                    style={{ borderColor: HC.borderSoft }}
                  >
                    <td className="px-4 py-4 md:px-5">
                      <span
                        className="inline-block h-[18px] w-[18px] rounded-[5px] border-[1.5px] bg-white"
                        style={{ borderColor: HC.border }}
                        aria-hidden
                      />
                    </td>
                    <td
                      className="whitespace-nowrap px-4 py-4 font-semibold md:px-5"
                      style={{ color: HC.textSecondary }}
                    >
                      {roomId(row.id)}
                    </td>
                    <td className="min-w-[180px] px-4 py-4 md:px-5">
                      <Link
                        href={`/inbox/${row.id}`}
                        className="flex items-center gap-3 no-underline"
                      >
                        <span
                          className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full text-[13px] font-semibold shadow-sm"
                          style={{ background: HC.primarySoft, color: HC.primaryDark }}
                        >
                          {name.charAt(0).toUpperCase()}
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate font-semibold" style={{ color: HC.text }}>
                            {name}
                          </span>
                          <span className="block truncate text-[12px]" style={{ color: HC.textMuted }}>
                            {email}
                          </span>
                        </span>
                      </Link>
                    </td>
                    <td
                      className="whitespace-nowrap px-4 py-4 md:px-5"
                      style={{ color: HC.textSecondary }}
                    >
                      {date}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 md:px-5">
                      <span
                        className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[12px] font-semibold"
                        style={{ backgroundColor: status.bg, color: status.text }}
                      >
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: status.dot }}
                        />
                        {status.label}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div
        className="flex justify-end border-t px-5 py-3.5 md:px-6"
        style={{ borderColor: HC.borderSoft }}
      >
        <Link
          href="/inbox"
          className="text-[13px] font-semibold hover:underline"
          style={{ color: HC.primary }}
        >
          Alle Einsendungen →
        </Link>
      </div>
    </HcCard>
  );
}

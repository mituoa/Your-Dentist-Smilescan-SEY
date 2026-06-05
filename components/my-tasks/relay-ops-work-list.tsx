"use client";

import Link from "next/link";

import { YdStatusPill } from "@/components/design-system/yd-status-pill";
import { YD } from "@/lib/design/yd-design-tokens";
import type { RelayOpsWorkRow } from "@/lib/relay/build-relay-ops-snapshot";
import type { RelayOpsStatus } from "@/lib/relay/relay-ops-status";
import { cn } from "@/lib/utils";

type RelayOpsWorkListProps = {
  items: RelayOpsWorkRow[];
};

const COLUMNS = [
  "Aufgabe",
  "Patient",
  "Status",
  "Verantwortlich",
  "Fällig",
  "Aktivität",
  "Herkunft",
] as const;

function statusPillVariant(
  status: RelayOpsStatus,
  critical: boolean
): "urgent" | "active" | "calm" | "done" | "pending" {
  if (status === "done") return "done";
  if (status === "overdue" || critical) return "urgent";
  if (status === "new") return "active";
  if (status === "in_progress") return "calm";
  return "pending";
}

function statusPillLabel(item: RelayOpsWorkRow): string {
  if (item.isCritical && item.status !== "done") {
    return `Kritisch · ${item.statusLabel}`;
  }
  return item.statusLabel;
}

export function RelayOpsWorkList({ items }: RelayOpsWorkListProps) {
  return (
    <div className="yd-relay-work-table-wrap min-h-0 flex-1 overflow-x-auto overflow-y-auto overscroll-x-contain">
      <table className="yd-relay-work-table w-full min-w-[920px] border-collapse text-left">
        <thead>
          <tr>
            {COLUMNS.map((col) => (
              <th
                key={col}
                className="whitespace-nowrap px-4 py-3 text-[10px] font-medium uppercase tracking-[0.07em] md:px-5"
                style={{ color: YD.text.faint }}
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <tr>
              <td
                colSpan={COLUMNS.length}
                className="px-5 py-4 text-[12px] font-medium"
                style={{ color: YD.text.faint }}
              >
                Keine Vorgänge in dieser Ansicht.
              </td>
            </tr>
          ) : (
            items.map((item) => (
              <tr
                key={item.id}
                className={cn(
                  "group border-t transition-colors duration-200",
                  item.isCritical && !item.isDone && "yd-relay-work-table__row--critical"
                )}
                style={{ borderColor: "rgba(180, 198, 218, 0.22)" }}
              >
                <td className="min-w-[180px] max-w-[280px] px-4 py-3 md:px-5">
                  <Link
                    href={item.href}
                    prefetch
                    className="block min-w-0 no-underline transition hover:opacity-80"
                  >
                    <span
                      className="yd-relay-work-table__title block truncate text-[13px] font-semibold leading-snug"
                      style={{ color: YD.text.primary }}
                    >
                      {item.title}
                    </span>
                    {item.submissionRef ? (
                      <span
                        className="mt-0.5 block truncate text-[11px] font-medium"
                        style={{ color: YD.text.faint }}
                      >
                        {item.submissionRef}
                      </span>
                    ) : null}
                  </Link>
                </td>
                <td
                  className="min-w-[108px] max-w-[160px] truncate px-4 py-3 text-[12px] md:px-5"
                  style={{ color: YD.text.secondary }}
                >
                  {item.patientLabel ?? "—"}
                </td>
                <td className="whitespace-nowrap px-4 py-3 md:px-5">
                  <YdStatusPill
                    label={statusPillLabel(item)}
                    variant={statusPillVariant(item.status, item.isCritical)}
                    className="text-[10px] font-medium"
                  />
                </td>
                <td
                  className="min-w-[96px] max-w-[140px] truncate px-4 py-3 text-[12px] md:px-5"
                  style={{ color: YD.text.secondary }}
                >
                  {item.assigneeLabel}
                </td>
                <td
                  className={cn(
                    "whitespace-nowrap px-4 py-3 text-[12px] tabular-nums md:px-5",
                    item.status === "overdue" && "font-semibold"
                  )}
                  style={{
                    color: item.status === "overdue" ? "#B91C1C" : YD.text.muted,
                  }}
                >
                  {item.dueLabel ?? "—"}
                </td>
                <td
                  className="whitespace-nowrap px-4 py-3 text-[12px] tabular-nums md:px-5"
                  style={{ color: YD.text.muted }}
                >
                  {item.lastActivityLabel}
                </td>
                <td
                  className="whitespace-nowrap px-4 py-3 text-[12px] font-medium md:px-5"
                  style={{ color: item.sourceLabel === "Tracker" ? YD.accent.deep : YD.text.faint }}
                >
                  {item.sourceLabel ?? "—"}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

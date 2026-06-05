"use client";

import Link from "next/link";

import { YdStatusPill } from "@/components/design-system/yd-status-pill";
import { YD } from "@/lib/design/yd-design-tokens";
import type { RelayV3OperationsRow } from "@/lib/relay/build-relay-v3-snapshot";
import type { RelayOpsStatus } from "@/lib/relay/relay-ops-status";
import { cn } from "@/lib/utils";

type RelayOpsWorkListProps = {
  items: RelayV3OperationsRow[];
  isDoctor?: boolean;
};

const COLUMNS = [
  "Aufgabe",
  "Patient / Bezug",
  "Kategorie",
  "Verantwortlich",
  "Fällig",
  "Status",
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

function statusPillLabel(item: RelayV3OperationsRow): string {
  if (item.isCritical && item.status !== "done") {
    return `Kritisch · ${item.statusLabel}`;
  }
  return item.statusLabel;
}

export function RelayOpsWorkList({ items, isDoctor }: RelayOpsWorkListProps) {
  const meta =
    items.length > 0
      ? `${items.length} ${items.length === 1 ? "Vorgang" : "Vorgänge"}`
      : "Aktuell keine offenen Vorgänge";

  return (
    <div className="yd-relay-work-table-wrap min-h-0 flex-1 overflow-x-auto overflow-y-auto overscroll-x-contain">
      <div
        className="yd-relay-work-table__bar"
        style={{
          background: YD.surface.tableHead,
          borderBottom: `1px solid ${YD.border.soft}`,
        }}
      >
        <div>
          <p className="yd-relay-work-table__bar-title">Praxisbetrieb</p>
          <p className="yd-relay-work-table__bar-meta">
            {meta}
            {isDoctor === false ? " · Team-Ansicht (ohne ärztliche Freigaben)" : ""}
          </p>
        </div>
      </div>

      <div className="yd-relay-ops-mobile md:hidden">
        {items.length === 0 ? (
          <div className="yd-mobile-empty">
            <p className="yd-mobile-empty__title">Keine offenen Vorgänge in dieser Ansicht.</p>
            <p className="yd-mobile-empty__copy">
              Neue Aufgaben aus Tracker, Recall oder Praxisorganisation erscheinen hier.
            </p>
          </div>
        ) : (
          <div className="yd-mobile-row-cards">
            {items.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                prefetch
                className={cn("yd-mobile-row-card", item.isCritical && "yd-mobile-row-card--critical")}
              >
                <div className="yd-mobile-row-card__head">
                  <p className="yd-mobile-row-card__title">{item.title}</p>
                  <YdStatusPill
                    label={statusPillLabel(item)}
                    variant={statusPillVariant(item.status, item.isCritical)}
                    className="shrink-0 text-[10px] font-medium"
                  />
                </div>
                {item.referenceLabel ? (
                  <p className="yd-mobile-row-card__line">{item.referenceLabel}</p>
                ) : null}
                <div className="yd-mobile-row-card__meta-row">
                  <span className="yd-mobile-row-card__label">{item.categoryLabel}</span>
                  <span className="yd-mobile-row-card__value">{item.assigneeLabel}</span>
                </div>
                <div className="yd-mobile-row-card__foot">
                  <span className="yd-mobile-row-card__date">{item.dueLabel ?? "—"}</span>
                  <span className="yd-mobile-row-card__cta">{item.sourceLabel ?? "Öffnen"}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <table className="yd-relay-work-table hidden w-full min-w-[980px] border-collapse text-left md:table">
        <thead>
          <tr>
            {COLUMNS.map((col) => (
              <th
                key={col}
                className="whitespace-nowrap px-4 py-2.5 text-[10px] font-medium uppercase tracking-[0.07em] md:px-5"
                style={{ color: YD.text.faint }}
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <tr className="yd-relay-work-table__empty-row">
              <td colSpan={COLUMNS.length} className="yd-relay-work-table__empty-cell">
                <div className="yd-relay-work-table__empty">
                  <p className="yd-relay-work-table__empty-title">Keine offenen Vorgänge in dieser Ansicht.</p>
                  <p className="yd-relay-work-table__empty-copy">
                    Neue Aufgaben aus Tracker, Recall oder Praxisorganisation erscheinen hier.
                  </p>
                </div>
              </td>
            </tr>
          ) : (
            items.map((item) => (
              <tr
                key={item.id}
                className={cn(
                  "group border-t transition-colors duration-200",
                  item.isCritical && "yd-relay-work-table__row--critical"
                )}
                style={{ borderColor: "rgba(180, 198, 218, 0.22)" }}
              >
                <td className="min-w-[168px] max-w-[240px] px-4 py-2.5 md:px-5">
                  <Link href={item.href} prefetch className="block min-w-0 no-underline transition hover:opacity-80">
                    <span
                      className="block truncate text-[13px] font-semibold leading-snug"
                      style={{ color: YD.text.primary }}
                    >
                      {item.title}
                    </span>
                  </Link>
                </td>
                <td
                  className="min-w-[100px] max-w-[148px] truncate px-4 py-2.5 text-[12px] leading-snug md:px-5"
                  style={{ color: YD.text.secondary }}
                >
                  {item.referenceLabel ?? "—"}
                </td>
                <td
                  className="whitespace-nowrap px-4 py-2.5 text-[11px] font-medium md:px-5"
                  style={{ color: YD.text.muted }}
                >
                  {item.categoryLabel}
                </td>
                <td
                  className="min-w-[88px] max-w-[132px] truncate px-4 py-2.5 text-[12px] leading-snug md:px-5"
                  style={{ color: YD.text.secondary }}
                >
                  {item.assigneeLabel}
                </td>
                <td
                  className={cn(
                    "whitespace-nowrap px-4 py-2.5 text-[12px] tabular-nums leading-snug md:px-5",
                    item.status === "overdue" && "font-semibold"
                  )}
                  style={{ color: item.status === "overdue" ? "#B91C1C" : YD.text.muted }}
                >
                  {item.dueLabel ?? "—"}
                </td>
                <td className="whitespace-nowrap px-4 py-2.5 md:px-5">
                  <YdStatusPill
                    label={statusPillLabel(item)}
                    variant={statusPillVariant(item.status, item.isCritical)}
                    className="text-[10px] font-medium"
                  />
                </td>
                <td
                  className="whitespace-nowrap px-4 py-2.5 text-[12px] tabular-nums leading-snug md:px-5"
                  style={{ color: YD.text.muted }}
                >
                  {item.lastActivityLabel}
                </td>
                <td
                  className="whitespace-nowrap px-4 py-2.5 text-[12px] font-medium leading-snug md:px-5"
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

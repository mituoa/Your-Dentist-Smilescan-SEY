"use client";

import Link from "next/link";

import { YdStatusPill } from "@/components/design-system/yd-status-pill";
import { YD } from "@/lib/design/yd-design-tokens";
import type { RelayV3RoutineRow } from "@/lib/relay/build-relay-v3-snapshot";
import { cn } from "@/lib/utils";

type RelayRoutinesListProps = {
  items: RelayV3RoutineRow[];
};

const COLUMNS = ["Aufgabe", "Rhythmus", "Verantwortlich", "Nächste Fälligkeit", "Letzte Aktivität", "Status", "Herkunft"] as const;

export function RelayRoutinesList({ items }: RelayRoutinesListProps) {
  return (
    <div className="yd-relay-work-table-wrap min-h-0 flex-1 overflow-x-auto overflow-y-auto overscroll-x-contain">
      <div
        className="yd-relay-work-table__bar"
        style={{ background: YD.surface.tableHead, borderBottom: `1px solid ${YD.border.soft}` }}
      >
        <div>
          <p className="yd-relay-work-table__bar-title">Routinen</p>
          <p className="yd-relay-work-table__bar-meta">
            {items.length > 0
              ? `${items.length} wiederkehrende ${items.length === 1 ? "Routine" : "Routinen"}`
              : "Keine aktiven Routinen"}
          </p>
        </div>
      </div>

      <div className="yd-relay-routines-mobile md:hidden">
        {items.length === 0 ? (
          <div className="yd-mobile-empty">
            <p className="yd-mobile-empty__title">Keine offenen Vorgänge in dieser Ansicht.</p>
            <p className="yd-mobile-empty__copy">
              Wiederkehrende Aufgaben aus Recall, Nachsorge oder QM erscheinen hier bei Fälligkeit.
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
                    label={item.statusLabel}
                    variant={item.isCritical ? "urgent" : "calm"}
                    className="shrink-0 text-[10px] font-medium"
                  />
                </div>
                <div className="yd-mobile-row-card__meta-row">
                  <span className="yd-mobile-row-card__label">Rhythmus</span>
                  <span className="yd-mobile-row-card__value">{item.rhythmLabel}</span>
                </div>
                <div className="yd-mobile-row-card__foot">
                  <span className="yd-mobile-row-card__line">
                    {item.assigneeLabel}
                    {item.nextDueLabel ? ` · ${item.nextDueLabel}` : ""}
                  </span>
                  <span className="yd-mobile-row-card__cta">Öffnen</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <table className="yd-relay-work-table hidden w-full min-w-[880px] border-collapse text-left md:table">
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
                    Wiederkehrende Aufgaben aus Recall, Nachsorge oder QM erscheinen hier bei Fälligkeit.
                  </p>
                </div>
              </td>
            </tr>
          ) : (
            items.map((item) => (
              <tr
                key={item.id}
                className={cn("group border-t transition-colors duration-200", item.isCritical && "yd-relay-work-table__row--critical")}
                style={{ borderColor: "rgba(180, 198, 218, 0.22)" }}
              >
                <td className="min-w-[160px] px-4 py-2.5 md:px-5">
                  <Link href={item.href} prefetch className="block truncate text-[13px] font-semibold leading-snug no-underline" style={{ color: YD.text.primary }}>
                    {item.title}
                  </Link>
                </td>
                <td className="whitespace-nowrap px-4 py-2.5 text-[12px] capitalize md:px-5" style={{ color: YD.text.secondary }}>
                  {item.rhythmLabel}
                </td>
                <td className="truncate px-4 py-2.5 text-[12px] md:px-5" style={{ color: YD.text.secondary }}>
                  {item.assigneeLabel}
                </td>
                <td className="whitespace-nowrap px-4 py-2.5 text-[12px] tabular-nums md:px-5" style={{ color: YD.text.muted }}>
                  {item.nextDueLabel ?? "—"}
                </td>
                <td className="whitespace-nowrap px-4 py-2.5 text-[12px] tabular-nums md:px-5" style={{ color: YD.text.muted }}>
                  {item.lastActivityLabel}
                </td>
                <td className="whitespace-nowrap px-4 py-2.5 md:px-5">
                  <YdStatusPill label={item.statusLabel} variant={item.isCritical ? "urgent" : "calm"} className="text-[10px] font-medium" />
                </td>
                <td className="whitespace-nowrap px-4 py-2.5 text-[12px] font-medium md:px-5" style={{ color: item.sourceLabel === "Tracker" ? YD.accent.deep : YD.text.faint }}>
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

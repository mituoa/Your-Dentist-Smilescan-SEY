"use client";

import Link from "next/link";

import { YdStatusPill } from "@/components/design-system/yd-status-pill";
import { YD } from "@/lib/design/yd-design-tokens";
import type { RelayV3HandoffRow } from "@/lib/relay/build-relay-v3-snapshot";
import { cn } from "@/lib/utils";

type RelayHandoffsListProps = {
  items: RelayV3HandoffRow[];
  isDoctor?: boolean;
};

const COLUMNS = ["Aufgabe", "Von", "An", "Grund", "Patient", "Zeitpunkt", "Status", "Nächster Schritt"] as const;

export function RelayHandoffsList({ items, isDoctor }: RelayHandoffsListProps) {
  return (
    <div className="yd-relay-handoffs-table-wrap min-h-0 overflow-x-auto overflow-y-auto overscroll-x-contain">
      <div
        className="yd-relay-work-table__bar"
        style={{ background: YD.surface.tableHead, borderBottom: `1px solid ${YD.border.soft}` }}
      >
        <div>
          <p className="yd-relay-work-table__bar-title">Aufgaben-Übergaben</p>
          <p className="yd-relay-work-table__bar-meta">
            {items.length > 0
              ? `${items.length} offene ${items.length === 1 ? "Übergabe" : "Übergaben"}`
              : "Keine offenen Aufgaben-Übergaben"}
            {isDoctor === false ? " · ohne ärztliche Freigaben" : ""}
          </p>
        </div>
      </div>

      <div className="yd-relay-handoffs-mobile md:hidden">
        {items.length === 0 ? (
          <div className="yd-mobile-empty">
            <p className="yd-mobile-empty__title">Keine offenen Vorgänge in dieser Ansicht.</p>
            <p className="yd-mobile-empty__copy">
              Übergaben entstehen bei Wartezuständen, Freigaben oder internen Weitergaben.
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
                    variant={item.isCritical ? "urgent" : "pending"}
                    className="shrink-0 text-[10px] font-medium"
                  />
                </div>
                <p className="yd-mobile-row-card__line">
                  {item.fromLabel} → {item.toLabel}
                </p>
                <p className="yd-mobile-row-card__line">{item.reasonLabel}</p>
                <div className="yd-mobile-row-card__foot">
                  <span className="yd-mobile-row-card__date">{item.timeLabel}</span>
                  <span className="yd-mobile-row-card__cta">{item.nextStepLabel}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <table className="yd-relay-work-table hidden w-full min-w-[1020px] border-collapse text-left md:table">
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
                <div className="yd-relay-work-table__empty yd-relay-work-table__empty--compact">
                  <p className="yd-relay-work-table__empty-title">Keine offenen Vorgänge in dieser Ansicht.</p>
                  <p className="yd-relay-work-table__empty-copy">
                    Übergaben entstehen bei Wartezuständen, Freigaben oder internen Weitergaben.
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
                <td className="min-w-[140px] max-w-[220px] px-4 py-2.5 md:px-5">
                  <Link href={item.href} prefetch className="block truncate text-[13px] font-semibold leading-snug no-underline" style={{ color: YD.text.primary }}>
                    {item.title}
                  </Link>
                </td>
                <td className="whitespace-nowrap px-4 py-2.5 text-[12px] md:px-5" style={{ color: YD.text.secondary }}>
                  {item.fromLabel}
                </td>
                <td className="whitespace-nowrap px-4 py-2.5 text-[12px] font-medium md:px-5" style={{ color: YD.text.primary }}>
                  {item.toLabel}
                </td>
                <td className="max-w-[160px] truncate px-4 py-2.5 text-[12px] md:px-5" style={{ color: YD.text.muted }}>
                  {item.reasonLabel}
                </td>
                <td className="max-w-[120px] truncate px-4 py-2.5 text-[12px] md:px-5" style={{ color: YD.text.secondary }}>
                  {item.patientLabel ?? "—"}
                </td>
                <td className="whitespace-nowrap px-4 py-2.5 text-[12px] tabular-nums md:px-5" style={{ color: YD.text.muted }}>
                  {item.timeLabel}
                </td>
                <td className="whitespace-nowrap px-4 py-2.5 md:px-5">
                  <YdStatusPill label={item.statusLabel} variant={item.isCritical ? "urgent" : "pending"} className="text-[10px] font-medium" />
                </td>
                <td className="max-w-[180px] truncate px-4 py-2.5 text-[12px] md:px-5" style={{ color: YD.text.secondary }}>
                  {item.nextStepLabel}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

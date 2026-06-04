"use client";

import Link from "next/link";

import type { RelayStatusTone, RelayTaskListItem } from "@/lib/relay/build-relay-snapshot";
import { cn } from "@/lib/utils";

type RelayTaskListProps = {
  items: RelayTaskListItem[];
  /** Kompakter Modus für lange Listen (50+). */
  dense?: boolean;
};

const STATUS_TONE_CLASS: Record<RelayStatusTone, string> = {
  new: "yd-relay-status--new",
  critical: "yd-relay-status--critical",
  overdue: "yd-relay-status--overdue",
  pending: "yd-relay-status--pending",
  open: "yd-relay-status--open",
  done: "yd-relay-status--done",
};

function RelayStatusIndicator({ tone, label }: { tone: RelayStatusTone; label: string }) {
  return (
    <span className={cn("yd-relay-status", STATUS_TONE_CLASS[tone])} title={label}>
      <span className="yd-relay-status__dot" aria-hidden />
      <span className="yd-relay-status__label">{label}</span>
    </span>
  );
}

export function RelayTaskList({ items, dense = true }: RelayTaskListProps) {
  if (items.length === 0) {
    return (
      <div className="yd-relay-empty-state">
        <p className="yd-relay-empty-state__title">Praxis unter Kontrolle</p>
        <p className="yd-relay-empty-state__text">
          Keine Aufgaben in dieser Ansicht — neue Einträge erscheinen hier automatisch.
        </p>
      </div>
    );
  }

  return (
    <div className={cn("yd-relay-task-table", dense && "yd-relay-task-table--dense")}>
      <div className="yd-relay-task-table__head" aria-hidden>
        <span className="yd-relay-task-table__col yd-relay-task-table__col--title">Aufgabe</span>
        <span className="yd-relay-task-table__col yd-relay-task-table__col--status">Status</span>
        <span className="yd-relay-task-table__col yd-relay-task-table__col--assignee">Zuständig</span>
        <span className="yd-relay-task-table__col yd-relay-task-table__col--due">Fällig</span>
        <span className="yd-relay-task-table__col yd-relay-task-table__col--patient">Patient</span>
        <span className="yd-relay-task-table__col yd-relay-task-table__col--source">Herkunft</span>
      </div>
      <ul className="yd-relay-v4-task-list">
        {items.map((item) => (
          <li key={item.id}>
            <Link
              href={item.href}
              className={cn(
                "yd-relay-v4-task-row yd-relay-task-table__row",
                item.isDone && "yd-relay-v4-task-row--done"
              )}
            >
              <span className="yd-relay-task-table__col yd-relay-task-table__col--title">
                <span
                  className={cn(
                    "yd-relay-task-table__title",
                    item.statusTone === "critical" && "yd-relay-task-table__title--emphasis",
                    item.statusTone === "overdue" && "yd-relay-task-table__title--overdue"
                  )}
                >
                  {item.title}
                </span>
                {item.completionLine ? (
                  <span className="yd-relay-v4-task-row__done">{item.completionLine}</span>
                ) : null}
              </span>
              <span className="yd-relay-task-table__col yd-relay-task-table__col--status">
                <RelayStatusIndicator tone={item.statusTone} label={item.statusLabel} />
              </span>
              <span className="yd-relay-task-table__col yd-relay-task-table__col--assignee">
                {item.assigneeLabel}
              </span>
              <span
                className={cn(
                  "yd-relay-task-table__col yd-relay-task-table__col--due",
                  item.statusTone === "overdue" && "yd-relay-task-table__due--overdue"
                )}
              >
                {item.dueLabel ?? "—"}
              </span>
              <span className="yd-relay-task-table__col yd-relay-task-table__col--patient">
                {item.patientLabel ?? "—"}
              </span>
              <span className="yd-relay-task-table__col yd-relay-task-table__col--source">
                {item.sourceLabel ?? "—"}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

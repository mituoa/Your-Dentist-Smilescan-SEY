"use client";

import Link from "next/link";

import type { RelayOpsWorkRow } from "@/lib/relay/build-relay-ops-snapshot";
import type { RelayOpsStatus } from "@/lib/relay/relay-ops-status";
import { cn } from "@/lib/utils";

type RelayOpsWorkListProps = {
  items: RelayOpsWorkRow[];
};

const STATUS_CLASS: Record<RelayOpsStatus, string> = {
  new: "yd-relay-ops-status--new",
  in_progress: "yd-relay-ops-status--progress",
  waiting_patient: "yd-relay-ops-status--patient",
  waiting_practice: "yd-relay-ops-status--practice",
  overdue: "yd-relay-ops-status--overdue",
  done: "yd-relay-ops-status--done",
};

function OpsStatus({ status, label, critical }: { status: RelayOpsStatus; label: string; critical: boolean }) {
  return (
    <span className={cn("yd-relay-ops-status", STATUS_CLASS[status], critical && "yd-relay-ops-status--critical")}>
      <span className="yd-relay-ops-status__dot" aria-hidden />
      <span className="yd-relay-ops-status__label">{critical && status !== "done" ? `Kritisch · ${label}` : label}</span>
    </span>
  );
}

export function RelayOpsWorkList({ items }: RelayOpsWorkListProps) {
  if (items.length === 0) {
    return (
      <div className="yd-relay-empty-state">
        <p className="yd-relay-empty-state__title">Praxisbetrieb unter Kontrolle</p>
        <p className="yd-relay-empty-state__text">
          Alle Aufgaben erledigt — heute keine offenen Vorgänge in dieser Ansicht.
        </p>
      </div>
    );
  }

  return (
    <div className="yd-relay-ops-work">
      <div className="yd-relay-ops-work__head" aria-hidden>
        <span className="yd-relay-ops-work__col yd-relay-ops-work__col--status">Status</span>
        <span className="yd-relay-ops-work__col yd-relay-ops-work__col--task">Aufgabe</span>
        <span className="yd-relay-ops-work__col yd-relay-ops-work__col--patient">Patient</span>
        <span className="yd-relay-ops-work__col yd-relay-ops-work__col--assignee">Verantwortlich</span>
        <span className="yd-relay-ops-work__col yd-relay-ops-work__col--due">Fällig</span>
        <span className="yd-relay-ops-work__col yd-relay-ops-work__col--activity">Aktivität</span>
      </div>
      <ul className="yd-relay-ops-work__list">
        {items.map((item) => (
          <li key={item.id}>
            <Link
              href={item.href}
              className={cn("yd-relay-ops-work__row", item.isDone && "yd-relay-ops-work__row--done")}
            >
              <span className="yd-relay-ops-work__col yd-relay-ops-work__col--status">
                <OpsStatus status={item.status} label={item.statusLabel} critical={item.isCritical} />
              </span>
              <span className="yd-relay-ops-work__col yd-relay-ops-work__col--task">
                <span className="yd-relay-ops-work__title">{item.title}</span>
                {item.descriptionPreview ? (
                  <span className="yd-relay-ops-work__desc">{item.descriptionPreview}</span>
                ) : null}
                {item.recommendation ? (
                  <span className="yd-relay-ops-work__rec">Empfehlung: {item.recommendation}</span>
                ) : null}
                {item.submissionRef ? (
                  <span className="yd-relay-ops-work__ref">Tracker · {item.submissionRef}</span>
                ) : null}
                {item.completionLine ? (
                  <span className="yd-relay-ops-work__done-line">{item.completionLine}</span>
                ) : null}
              </span>
              <span className="yd-relay-ops-work__col yd-relay-ops-work__col--patient">
                {item.patientLabel ?? "—"}
              </span>
              <span className="yd-relay-ops-work__col yd-relay-ops-work__col--assignee">
                {item.assigneeLabel}
              </span>
              <span
                className={cn(
                  "yd-relay-ops-work__col yd-relay-ops-work__col--due",
                  item.status === "overdue" && "yd-relay-ops-work__due--overdue"
                )}
              >
                {item.dueLabel ?? "—"}
              </span>
              <span className="yd-relay-ops-work__col yd-relay-ops-work__col--activity">
                {item.lastActivityLabel}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

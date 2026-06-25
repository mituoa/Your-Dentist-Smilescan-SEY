"use client";

import Link from "next/link";

import type { RelayTeamInboxRow } from "@/lib/relay/relay-work-center-model";
import { cn } from "@/lib/utils";

type RelayTeamInboxListProps = {
  rows: RelayTeamInboxRow[];
};

export function RelayTeamInboxList({ rows }: RelayTeamInboxListProps) {
  if (rows.length === 0) {
    return (
      <div className="relay-team-inbox__empty">
        <p>Keine Team-Nachrichten in dieser Ansicht.</p>
      </div>
    );
  }

  return (
    <ul className="relay-team-inbox__list">
      {rows.map((row) => (
        <li key={row.id}>
          <Link href={row.href} className="relay-team-inbox__row">
            <span
              className="relay-team-inbox__avatar"
              style={{ background: row.senderColor }}
              aria-hidden
            >
              {row.senderInitials}
            </span>
            <span className="relay-team-inbox__body">
              <span className="relay-team-inbox__top">
                <strong className="relay-team-inbox__name">{row.senderName}</strong>
                <span
                  className={cn(
                    "relay-team-inbox__tag",
                    row.areaTone === "green" && "relay-team-inbox__tag--green",
                    row.areaTone === "neutral" && "relay-team-inbox__tag--neutral"
                  )}
                >
                  {row.areaLabel}
                </span>
              </span>
              <span className="relay-team-inbox__preview">{row.preview}</span>
            </span>
            <span className="relay-team-inbox__aside">
              <time className="relay-team-inbox__time">{row.timeLabel}</time>
              {row.unread ? <span className="relay-team-inbox__dot" aria-label="Ungelesen" /> : null}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

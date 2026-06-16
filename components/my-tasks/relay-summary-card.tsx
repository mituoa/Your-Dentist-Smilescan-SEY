"use client";

import { ArrowRight, ClipboardList, RefreshCw, UserCheck, Users, UserRound } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import type { RelayPracticeSection, RelayWorkRow } from "@/lib/relay/build-relay-practice-snapshot";
import { cn } from "@/lib/utils";

const SECTION_ICONS: Record<RelayPracticeSection, LucideIcon> = {
  attention: UserCheck,
  practice: ClipboardList,
  teamwork: Users,
  patient_waiting: UserRound,
  routines: RefreshCw,
};

type RelaySummaryCardProps = {
  id: RelayPracticeSection;
  title: string;
  rows: RelayWorkRow[];
  active: boolean;
  footerLabel: string;
  emptyTitle: string;
  emptyBody: string;
  onSelect: () => void;
};

function previewRows(rows: RelayWorkRow[], max: number): RelayWorkRow[] {
  return rows.filter((r) => !r.isGhost).slice(0, max);
}

const PREVIEW_LIMIT: Record<RelayPracticeSection, number> = {
  attention: 2,
  practice: 1,
  teamwork: 1,
  patient_waiting: 1,
  routines: 1,
};

/** V5 — intelligente Vorschaukarte mit Icon, Gewichtung, echten Inhalten. */
export function RelaySummaryCard({
  id,
  title,
  rows,
  active,
  footerLabel,
  emptyTitle,
  emptyBody: _emptyBody,
  onSelect,
}: RelaySummaryCardProps) {
  const realRows = rows.filter((r) => !r.isGhost);
  const count = realRows.length;
  const previews = previewRows(rows, PREVIEW_LIMIT[id]);
  const empty = count === 0;
  const Icon = SECTION_ICONS[id];

  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      className={cn(
        "yd-relay-v5-card",
        `yd-relay-v5-card--${id}`,
        active && "yd-relay-v5-card--active",
        empty && "yd-relay-v5-card--empty"
      )}
      onClick={onSelect}
    >
      <span className="yd-relay-v5-card__head">
        <span className="yd-relay-v5-card__icon" aria-hidden>
          <Icon className="h-4 w-4" strokeWidth={1.75} />
        </span>
        <span className="yd-relay-v5-card__titles">
          <span className="yd-relay-v5-card__title">{title}</span>
          {!empty ? (
            <span className="yd-relay-v5-card__count">
              {count === 1 ? "1 Vorgang" : `${count} Vorgänge`}
            </span>
          ) : (
            <span className="yd-relay-v5-card__count yd-relay-v5-card__count--quiet">Keine offenen</span>
          )}
        </span>
      </span>

      {previews.length > 0 ? (
        <ul className="yd-relay-v5-card__previews">
          {previews.map((row) => (
            <li key={row.id} className="yd-relay-v5-card__preview">
              <span className="yd-relay-v5-card__preview-title">{row.primaryLabel}</span>
              <span className="yd-relay-v5-card__preview-meta">
                {row.fromLabel} → {row.toLabel}
                {(row.dueLabel ?? row.timeLabel) ? ` · ${row.dueLabel ?? row.timeLabel}` : ""}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="yd-relay-v5-card__empty-line">{emptyTitle}</p>
      )}

      {!empty ? (
        <span className="yd-relay-v5-card__footer">
          {footerLabel}
          <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
        </span>
      ) : null}
    </button>
  );
}

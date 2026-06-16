"use client";

import type { ReactNode } from "react";
import {
  Calendar,
  ClipboardList,
  Clock,
  FileCheck,
  Inbox,
  Users,
} from "lucide-react";

import type { RelayPracticeSnapshot } from "@/lib/relay/build-relay-practice-snapshot";
import {
  RELAY_WORK_AREAS,
  relayTotalOpenCount,
  relayWorkAreaCount,
  type RelayWorkAreaId,
} from "@/lib/relay/relay-work-areas";
import { cn } from "@/lib/utils";

const AREA_ICONS: Record<RelayWorkAreaId, ReactNode> = {
  attention: <Inbox className="yd-ref-side__icon" strokeWidth={1.75} aria-hidden />,
  teamwork: <Users className="yd-ref-side__icon" strokeWidth={1.75} aria-hidden />,
  patient_waiting: <Clock className="yd-ref-side__icon" strokeWidth={1.75} aria-hidden />,
  freigaben: <FileCheck className="yd-ref-side__icon" strokeWidth={1.75} aria-hidden />,
  routines: <ClipboardList className="yd-ref-side__icon" strokeWidth={1.75} aria-hidden />,
};

type Props = {
  snapshot: RelayPracticeSnapshot;
  active: RelayWorkAreaId;
  onSelect: (areaId: RelayWorkAreaId) => void;
};

export function RelayReferenceSidebar({ snapshot, active, onSelect }: Props) {
  const total = relayTotalOpenCount(snapshot);

  return (
    <aside className="yd-ref-side" aria-label="Arbeitsbereiche">
      <div className="yd-ref-side__section">
        <p className="yd-ref-side__section-label">Workspace</p>
        <ul className="yd-ref-side__list">
          {RELAY_WORK_AREAS.map((area) => {
            const count = relayWorkAreaCount(snapshot, area.id);
            const isActive = area.id === active;
            return (
              <li key={area.id}>
                <button
                  type="button"
                  className={cn("yd-ref-side__item", isActive && "yd-ref-side__item--active")}
                  onClick={() => onSelect(area.id)}
                  aria-current={isActive ? "true" : undefined}
                >
                  {AREA_ICONS[area.id]}
                  <span className="yd-ref-side__label">{area.title}</span>
                  {count > 0 ? <span className="yd-ref-side__badge">{count}</span> : null}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
      <div className="yd-ref-side__footer">
        <span className="yd-ref-side__footer-num">{total}</span>
        <span className="yd-ref-side__footer-text">offen</span>
      </div>
    </aside>
  );
}

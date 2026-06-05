"use client";

import type {
  RelayHandoffsBand,
  RelayOperationsBand,
  RelayRoutinesBand,
  RelayV3Section,
} from "@/lib/relay/build-relay-v3-snapshot";
import { cn } from "@/lib/utils";

type RelayOpsStripProps = {
  section: RelayV3Section;
  operations?: RelayOperationsBand;
  routines?: RelayRoutinesBand;
  handoffs?: RelayHandoffsBand;
};

function CalmLead({ calm, action }: { calm: boolean; action: boolean }) {
  return (
    <div className="yd-relay-ops-band__lead">
      <span className="yd-relay-ops-band__kicker">Betriebslage</span>
      {calm ? (
        <span className="yd-relay-ops-band__calm">
          <span className="yd-relay-ops-band__calm-dot" aria-hidden />
          Praxisbetrieb unter Kontrolle
        </span>
      ) : (
        <span className="yd-relay-ops-band__action">{action ? "Handlungsbedarf" : "Übersicht"}</span>
      )}
    </div>
  );
}

function Metric({
  value,
  label,
  hot,
  sep,
}: {
  value: number;
  label: string;
  hot?: boolean;
  sep?: boolean;
}) {
  return (
    <span className="yd-relay-ops-strip__item">
      {sep ? (
        <span className="yd-dash-status-line__sep yd-relay-ops-strip__sep" aria-hidden>
          ·
        </span>
      ) : null}
      <span className={cn("yd-relay-ops-strip__value", hot && value > 0 && "yd-relay-ops-strip__value--hot")}>
        {value}
      </span>{" "}
      <span className="yd-relay-ops-strip__label">{label}</span>
    </span>
  );
}

export function RelayOpsStrip({ section, operations, routines, handoffs }: RelayOpsStripProps) {
  if (section === "operations" && operations) {
    const calm = operations.openCount === 0 && operations.overdue === 0;
    const metrics = [
      { value: operations.openCount, label: "Heute offen" },
      { value: operations.overdue, label: "Überfällig", hot: true },
      { value: operations.waitingPatient, label: "Wartet auf Patient" },
      { value: operations.waitingTeam, label: "Wartet auf Team" },
      { value: operations.doneToday, label: "Erledigt heute" },
    ];
    return (
      <div className="yd-relay-ops-band" role="status" aria-label="Praxisbetrieb">
        <CalmLead calm={calm} action={!calm} />
        <p className="yd-relay-ops-strip yd-dash-status-line">
          {metrics.map((m, i) => (
            <Metric key={m.label} {...m} sep={i > 0} />
          ))}
        </p>
      </div>
    );
  }

  if (section === "routines" && routines) {
    const calm = routines.dueToday === 0 && routines.overdue === 0;
    const metrics = [
      { value: routines.dueToday, label: "Heute fällig" },
      { value: routines.dueThisWeek, label: "Diese Woche" },
      { value: routines.overdue, label: "Überfällig", hot: true },
      { value: routines.paused, label: "Pausiert" },
      { value: routines.doneToday, label: "Erledigt" },
    ];
    return (
      <div className="yd-relay-ops-band" role="status" aria-label="Routinen">
        <CalmLead calm={calm} action={!calm} />
        <p className="yd-relay-ops-strip yd-dash-status-line">
          {metrics.map((m, i) => (
            <Metric key={m.label} {...m} sep={i > 0} />
          ))}
        </p>
      </div>
    );
  }

  if (section === "handoffs" && handoffs) {
    const calm =
      handoffs.waitingDoctor === 0 &&
      handoffs.waitingTeam === 0 &&
      handoffs.critical === 0 &&
      handoffs.newCount === 0;
    const metrics = [
      { value: handoffs.waitingDoctor, label: "Wartet auf Arzt", hot: true },
      { value: handoffs.waitingTeam, label: "Wartet auf Team" },
      { value: handoffs.critical, label: "Kritisch", hot: true },
      { value: handoffs.newCount, label: "Neue Übergaben" },
      { value: handoffs.doneToday, label: "Erledigt" },
    ];
    return (
      <div className="yd-relay-ops-band" role="status" aria-label="Übergaben">
        <CalmLead calm={calm} action={!calm} />
        <p className="yd-relay-ops-strip yd-dash-status-line">
          {metrics.map((m, i) => (
            <Metric key={m.label} {...m} sep={i > 0} />
          ))}
        </p>
      </div>
    );
  }

  return null;
}

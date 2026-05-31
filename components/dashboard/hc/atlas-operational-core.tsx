import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";

import { DashboardRelayCommsPanel } from "@/components/dashboard/hc/dashboard-relay-comms-panel";
import { DashboardRelayOpsPanel } from "@/components/dashboard/hc/dashboard-relay-ops-panel";
import type { RelayConversationRow } from "@/lib/queries/relay-messages";
import type {
  ActivityEvent,
  DashboardRoutineRow,
  OpenTaskRow,
  SubmissionPreviewRow,
} from "@/lib/queries/dashboard";
import { YD } from "@/lib/design/yd-design-tokens";

function formatRelative(iso: string): string {
  const diffMin = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (diffMin < 1) return "gerade eben";
  if (diffMin < 60) return `vor ${diffMin} Min`;
  const h = Math.floor(diffMin / 60);
  if (h < 24) return `vor ${h} Std`;
  return new Date(iso).toLocaleDateString("de-DE", { day: "2-digit", month: "short" });
}

function patientLabel(row: SubmissionPreviewRow): string {
  return row.patient_name?.trim() || row.patient_email?.trim() || "Patient";
}

type AtlasOperationalCoreProps = {
  unseenCount: number | null;
  previewRows: SubmissionPreviewRow[] | null;
  openTasks: OpenTaskRow[] | null;
  routines: DashboardRoutineRow[] | null;
  relayConversations: RelayConversationRow[];
  relayUnread: number;
  reminderCount: number;
  activityEvents: ActivityEvent[] | null;
};

export function AtlasOperationalCore({
  unseenCount,
  previewRows,
  openTasks,
  routines,
  relayConversations,
  relayUnread,
  reminderCount,
  activityEvents,
}: AtlasOperationalCoreProps) {
  const openTaskCount = openTasks?.length ?? 0;
  const waitingIntake = unseenCount !== null && unseenCount > 0;
  const hasRelayPressure = relayUnread > 0;
  const hasTaskPressure = openTaskCount > 0;
  const hasReminderPressure = reminderCount > 0;

  const intakeRows = [...(previewRows ?? [])].sort((a, b) => {
    if (!a.seen_at && b.seen_at) return -1;
    if (a.seen_at && !b.seen_at) return 1;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  const unreadRows = intakeRows.filter((r) => !r.seen_at).slice(0, 8);
  const recentSeen = intakeRows.filter((r) => r.seen_at).slice(0, 3);

  const continuityEvents = activityEvents?.slice(0, 5) ?? null;

  return (
    <div className="yd-atlas-core">
      <div className="yd-atlas-state-block" role="status">
        {waitingIntake ? (
          <p className="yd-atlas-state yd-atlas-state--pressure">
            <span className="yd-atlas-state-lead">
              {unseenCount} {unseenCount === 1 ? "Einsendung wartet" : "Einsendungen warten"} auf
              klinische Sichtung.
            </span>
            <span className="yd-atlas-state-sub">
              Verantwortung liegt im Eingang — Entscheidungen zuerst dort.
            </span>
          </p>
        ) : (
          <p className="yd-atlas-state yd-atlas-state--steady">
            <span className="yd-atlas-state-lead">Eingang ist auf dem aktuellen Stand.</span>
            <span className="yd-atlas-state-sub">
              Betrieb läuft weiter in Relay, Aufgaben und Teamübergaben.
            </span>
          </p>
        )}
      </div>

      <div className="yd-atlas-pressure-strip" aria-label="Operative Spannung">
        {hasRelayPressure ? (
          <Link href="/relay" className="yd-atlas-pressure-item yd-atlas-pressure-item--active">
            <span className="yd-atlas-pressure-label">Relay</span>
            <span className="yd-atlas-pressure-value">{relayUnread} ungelesen</span>
          </Link>
        ) : (
          <span className="yd-atlas-pressure-item yd-atlas-pressure-item--idle">
            <span className="yd-atlas-pressure-label">Relay</span>
            <span className="yd-atlas-pressure-value">ruhig</span>
          </span>
        )}
        {hasTaskPressure ? (
          <Link href="/my-tasks" className="yd-atlas-pressure-item yd-atlas-pressure-item--active">
            <span className="yd-atlas-pressure-label">Aufgaben</span>
            <span className="yd-atlas-pressure-value">{openTaskCount} offen</span>
          </Link>
        ) : (
          <span className="yd-atlas-pressure-item yd-atlas-pressure-item--idle">
            <span className="yd-atlas-pressure-label">Aufgaben</span>
            <span className="yd-atlas-pressure-value">keine offenen</span>
          </span>
        )}
        {hasReminderPressure ? (
          <Link href="/my-tasks" className="yd-atlas-pressure-item yd-atlas-pressure-item--active">
            <span className="yd-atlas-pressure-label">Erinnerungen</span>
            <span className="yd-atlas-pressure-value">{reminderCount} anstehend</span>
          </Link>
        ) : null}
      </div>

      <div className="yd-atlas-main-grid">
        <section className="yd-atlas-primary" aria-labelledby="yd-atlas-intake-title">
          <header className="yd-atlas-panel-head">
            <div>
              <h2 id="yd-atlas-intake-title" className="yd-atlas-panel-title">
                Wartende Einsendungen
              </h2>
              <p className="yd-atlas-panel-hint">Eingang · klinische Verantwortung</p>
            </div>
            <Link href="/inbox" className="yd-atlas-panel-action">
              Tracker öffnen
              <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden />
            </Link>
          </header>

          <div className="yd-atlas-intake-list">
            {previewRows === null ? (
              <p className="yd-atlas-empty">Eingang momentan nicht verfügbar.</p>
            ) : unreadRows.length === 0 && recentSeen.length === 0 ? (
              <p className="yd-atlas-empty">Keine Einsendungen im aktuellen Ausschnitt.</p>
            ) : (
              <>
                {unreadRows.length > 0 ? (
                  <ul className="yd-atlas-queue" aria-label="Zu sichten">
                    {unreadRows.map((row) => (
                      <li key={row.id}>
                        <Link href={`/inbox/${row.id}`} className="yd-atlas-queue-row yd-atlas-queue-row--waiting">
                          <div className="min-w-0 flex-1">
                            <p className="yd-atlas-queue-name">{patientLabel(row)}</p>
                            <p className="yd-atlas-queue-meta">
                              <Clock className="inline h-3 w-3 opacity-60" strokeWidth={1.65} aria-hidden />{" "}
                              {formatRelative(row.created_at)} · wartet auf Sichtung
                            </p>
                          </div>
                          <span className="yd-atlas-queue-state">Zu sichten</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="yd-atlas-empty yd-atlas-empty--inline">
                    Keine unbearbeiteten Einsendungen — Eingang auf Stand.
                  </p>
                )}
                {recentSeen.length > 0 ? (
                  <div className="yd-atlas-queue-secondary">
                    <p className="yd-atlas-queue-secondary-label">Zuletzt in Bearbeitung</p>
                    <ul className="yd-atlas-queue yd-atlas-queue--muted">
                      {recentSeen.map((row) => (
                        <li key={row.id}>
                          <Link href={`/inbox/${row.id}`} className="yd-atlas-queue-row">
                            <div className="min-w-0 flex-1">
                              <p className="yd-atlas-queue-name">{patientLabel(row)}</p>
                              <p className="yd-atlas-queue-meta">{formatRelative(row.created_at)}</p>
                            </div>
                            <span className="yd-atlas-queue-state yd-atlas-queue-state--muted">
                              In Bearbeitung
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </>
            )}
          </div>
        </section>

        <aside className="yd-atlas-secondary">
          <div className="yd-atlas-secondary-stack">
            <DashboardRelayOpsPanel tasks={openTasks} routines={routines} />
            <DashboardRelayCommsPanel conversations={relayConversations} />
          </div>
        </aside>
      </div>

      {continuityEvents && continuityEvents.length > 0 ? (
        <section className="yd-atlas-continuity" aria-labelledby="yd-atlas-continuity-title">
          <h2 id="yd-atlas-continuity-title" className="yd-atlas-continuity-title">
            Kontinuität
          </h2>
          <ul className="yd-atlas-continuity-list">
            {continuityEvents.map((event) => (
              <li key={`${event.type}-${event.id}`}>
                {event.link ? (
                  <Link href={event.link} className="yd-atlas-continuity-row">
                    <span className="yd-atlas-continuity-time">{formatRelative(event.timestamp)}</span>
                    <span className="yd-atlas-continuity-text">{event.text}</span>
                  </Link>
                ) : (
                  <div className="yd-atlas-continuity-row">
                    <span className="yd-atlas-continuity-time">{formatRelative(event.timestamp)}</span>
                    <span className="yd-atlas-continuity-text">{event.text}</span>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

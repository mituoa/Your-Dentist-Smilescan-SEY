import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";

import { DashboardActivityStream } from "@/components/dashboard/hc/dashboard-activity-stream";
import { DashboardCommandStrip } from "@/components/dashboard/hc/dashboard-command-strip";
import { DashboardPracticeFlow } from "@/components/dashboard/hc/dashboard-practice-flow";
import { DashboardRelayCommsPanel } from "@/components/dashboard/hc/dashboard-relay-comms-panel";
import { DashboardRelayOpsPanel } from "@/components/dashboard/hc/dashboard-relay-ops-panel";
import { DashboardWorkzone } from "@/components/dashboard/hc/dashboard-workzone";
import { buildDashboardCommandHints } from "@/lib/dashboard/command-hints";
import type { RelayConversationRow } from "@/lib/queries/relay-messages";
import type {
  ActivityEvent,
  DashboardRoutineRow,
  OpenTaskRow,
  SubmissionPreviewRow,
} from "@/lib/queries/dashboard";

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
  const routineCount = routines?.length ?? 0;
  const waitingIntake = unseenCount !== null && unseenCount > 0;

  const intakeRows = [...(previewRows ?? [])].sort((a, b) => {
    if (!a.seen_at && b.seen_at) return -1;
    if (a.seen_at && !b.seen_at) return 1;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  const unreadRows = intakeRows.filter((r) => !r.seen_at).slice(0, 8);
  const recentSeen = intakeRows.filter((r) => r.seen_at).slice(0, 3);

  const commandHints = buildDashboardCommandHints({
    unseenCount,
    openTaskCount,
    relayUnread,
    reminderCount,
    routineCount,
  });

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
              Eingang zuerst — Relay, Aufgaben und Routinen laufen parallel im Praxisbereich.
            </span>
          </p>
        ) : (
          <p className="yd-atlas-state yd-atlas-state--steady">
            <span className="yd-atlas-state-lead">Eingang ist auf dem aktuellen Stand.</span>
            <span className="yd-atlas-state-sub">
              Relay, Aufgaben, Routinen und Command AI bleiben im Blick — ohne zusätzliche Lautstärke.
            </span>
          </p>
        )}
      </div>

      <DashboardPracticeFlow
        unseenCount={unseenCount}
        openTaskCount={openTaskCount}
        routineCount={routineCount}
        relayUnread={relayUnread}
        reminderCount={reminderCount}
      />

      <DashboardWorkzone
        rail="Eingang"
        title="Einsendungen"
        hint="Patient:innen · Fotos und Anliegen strukturiert"
        className="yd-atlas-zone yd-atlas-zone--intake"
      >
        <div className="yd-atlas-primary">
          <header className="yd-atlas-panel-head">
            <div>
              <h2 className="yd-atlas-panel-title">Wartende & aktuelle Fälle</h2>
              <p className="yd-atlas-panel-hint">Tracker · Sichtung und Weiterleitung</p>
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
        </div>
      </DashboardWorkzone>

      <DashboardWorkzone
        rail="Betrieb"
        title="Relay, Aufgaben & Routinen"
        hint="Interne Rückfragen, offene Schritte, wiederkehrende Abläufe"
        className="yd-atlas-zone yd-atlas-zone--ops"
      >
        <div className="yd-atlas-ops-grid">
          <div className="yd-atlas-ops-grid__relay">
            <DashboardRelayOpsPanel tasks={openTasks} routines={routines} />
          </div>
          <div className="yd-atlas-ops-grid__comms">
            <DashboardRelayCommsPanel conversations={relayConversations} />
          </div>
        </div>
      </DashboardWorkzone>

      <div className="yd-atlas-support-grid" aria-label="Assistenz und aktuelle Aktivität">
        <div className="yd-atlas-support-cell yd-atlas-support-cell--command">
          <DashboardCommandStrip hints={commandHints} />
        </div>
        <div className="yd-atlas-support-cell yd-atlas-support-cell--activity">
          <DashboardActivityStream events={activityEvents} />
        </div>
      </div>
    </div>
  );
}

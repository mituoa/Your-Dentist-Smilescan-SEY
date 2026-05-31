import Link from "next/link";
import { Plus } from "lucide-react";

import { AtlasMobileActivity } from "@/components/dashboard/hc/atlas-mobile-activity";
import { AtlasMobileCommandPanel } from "@/components/dashboard/hc/atlas-mobile-command-panel";
import {
  buildTodaySummaryLines,
  formatIntakeDate,
  intakeSubjectLine,
  patientDisplayName,
  taskTitleShort,
} from "@/lib/dashboard/atlas-mobile-helpers";
import type { RelayConversationRow } from "@/lib/queries/relay-messages";
import type {
  ActivityEvent,
  DashboardRoutineRow,
  OpenTaskRow,
  SubmissionPreviewRow,
} from "@/lib/queries/dashboard";

type AtlasMobileWorkspaceProps = {
  unseenCount: number | null;
  previewRows: SubmissionPreviewRow[] | null;
  openTasks: OpenTaskRow[] | null;
  routines: DashboardRoutineRow[] | null;
  relayConversations: RelayConversationRow[];
  relayUnread: number;
  reminderCount: number;
  activityEvents: ActivityEvent[] | null;
};

function conversationTitle(c: RelayConversationRow): string {
  if (c.title?.trim()) return c.title.trim();
  if (c.kind === "group") return "Gruppe";
  if (c.other_party_email) {
    const local = c.other_party_email.split("@")[0];
    return local ? local.replace(/\./g, " ") : c.other_party_email;
  }
  return "Direktnachricht";
}

/** Mobile Atlas — eigenes Layout, nicht Desktop gestapelt. */
export function AtlasMobileWorkspace({
  unseenCount,
  previewRows,
  openTasks,
  routines,
  relayConversations,
  relayUnread,
  reminderCount: _reminderCount,
  activityEvents,
}: AtlasMobileWorkspaceProps) {
  void _reminderCount;

  const openTaskCount = openTasks?.length ?? 0;
  const routineCount = routines?.length ?? 0;
  const summaryLines = buildTodaySummaryLines({
    unseenCount,
    openTaskCount,
    relayUnread,
  });

  const intakeRows = [...(previewRows ?? [])].sort((a, b) => {
    if (!a.seen_at && b.seen_at) return -1;
    if (a.seen_at && !b.seen_at) return 1;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
  const intakePreview = intakeRows.slice(0, 5);

  const taskPreview = openTasks?.slice(0, 3) ?? [];
  const routinePreview = routines?.slice(0, 2) ?? [];
  const commsPreview = relayConversations.slice(0, 2);
  const relayHasOpen =
    relayUnread > 0 || commsPreview.some((c) => c.unread_count > 0);

  return (
    <div className="yd-atlas-mobile md:hidden" aria-label="Praxisüberblick">
      <AtlasMobileCommandPanel />

      <section className="yd-atlas-m-card yd-atlas-m-card--today" aria-labelledby="yd-atlas-m-today-title">
        <h2 id="yd-atlas-m-today-title" className="yd-atlas-m-card-title">
          Heute
        </h2>
        <ul className="yd-atlas-m-metrics">
          {summaryLines.map((line) => (
            <li key={line} className="yd-atlas-m-metric">
              {line}
            </li>
          ))}
        </ul>
      </section>

      <section className="yd-atlas-m-card" aria-labelledby="yd-atlas-m-intake-title">
        <div className="yd-atlas-m-card-head">
          <h2 id="yd-atlas-m-intake-title" className="yd-atlas-m-card-title">
            Eingänge
          </h2>
          <Link href="/inbox" className="yd-atlas-m-card-link">
            Tracker
          </Link>
        </div>

        {intakePreview.length === 0 ? (
          <p className="yd-atlas-m-empty-positive">Alles aktuell.</p>
        ) : (
          <ul className="yd-atlas-m-intake-list">
            {intakePreview.map((row) => (
              <li key={row.id}>
                <Link href={`/inbox/${row.id}`} className="yd-atlas-m-intake-row">
                  <div className="min-w-0 flex-1">
                    <p className="yd-atlas-m-intake-name">{patientDisplayName(row)}</p>
                    <p className="yd-atlas-m-intake-subject">{intakeSubjectLine(row)}</p>
                  </div>
                  <time className="yd-atlas-m-intake-date" dateTime={row.created_at}>
                    {formatIntakeDate(row.created_at)}
                  </time>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="yd-atlas-m-card" aria-labelledby="yd-atlas-m-relay-title">
        <div className="yd-atlas-m-card-head">
          <h2 id="yd-atlas-m-relay-title" className="yd-atlas-m-card-title">
            Relay · Team
          </h2>
          <Link href="/relay?panel=messages" className="yd-atlas-m-card-link">
            Öffnen
          </Link>
        </div>

        {relayHasOpen ? (
          <ul className="yd-atlas-m-mini-list">
            {commsPreview
              .filter((c) => c.unread_count > 0)
              .map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/relay?panel=messages&conversation=${c.id}`}
                    className="yd-atlas-m-mini-row"
                  >
                    {conversationTitle(c)}
                    <span className="yd-atlas-m-badge">{c.unread_count}</span>
                  </Link>
                </li>
              ))}
          </ul>
        ) : (
          <p className="yd-atlas-m-empty-positive">Keine offenen Rückfragen</p>
        )}

        <Link href="/relay?panel=messages" className="yd-atlas-m-secondary-action">
          <Plus className="h-4 w-4" strokeWidth={1.75} aria-hidden />
          Nachricht
        </Link>
      </section>

      <section className="yd-atlas-m-card yd-atlas-m-card--split" aria-label="Aufgaben und Routinen">
        <div className="yd-atlas-m-split-block">
          <div className="yd-atlas-m-card-head">
            <h2 className="yd-atlas-m-card-title">Aufgaben</h2>
            <Link href="/my-tasks" className="yd-atlas-m-card-link">
              Öffnen
            </Link>
          </div>
          {taskPreview.length > 0 ? (
            <ul className="yd-atlas-m-mini-list">
              {taskPreview.map((task) => (
                <li key={task.id}>
                  <Link href={`/my-tasks/${task.id}`} className="yd-atlas-m-mini-row">
                    {taskTitleShort(task)}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="yd-atlas-m-empty-positive">Keine Aufgaben für heute</p>
          )}
        </div>

        <div className="yd-atlas-m-split-divider" aria-hidden />

        <div className="yd-atlas-m-split-block">
          <div className="yd-atlas-m-card-head">
            <h2 className="yd-atlas-m-card-title">Routinen</h2>
            <Link href="/relay" className="yd-atlas-m-card-link">
              Relay
            </Link>
          </div>
          {routinePreview.length > 0 ? (
            <ul className="yd-atlas-m-mini-list">
              {routinePreview.map((routine) => (
                <li key={routine.id}>
                  <Link href={`/my-tasks/${routine.id}`} className="yd-atlas-m-mini-row">
                    {routine.title}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="yd-atlas-m-empty-positive">Keine Routine offen</p>
          )}
        </div>
      </section>

      <AtlasMobileActivity events={activityEvents} />
    </div>
  );
}

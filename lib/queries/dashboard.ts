import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { isLikelyMissingDbColumnError } from "@/lib/supabase/postgrest-errors";
import type { MessageDraftListStatus } from "@/lib/message-drafts/list-status";
import {
  normalizeIntakeChannel,
  type IntakeChannel,
} from "@/lib/submissions/intake-channel";

/**
 * Lesequeries für die **Arzt-Startseite** (`/dashboard`): Tagesüberblick, unbearbeitete Einsendungen,
 * offene Aufgaben, kurze Aktivitäts-Chronik. Bewusst leichtgewichtig — keine Analytics-Schicht.
 * `workspaceId` stammt wie überall aus `getCurrentWorkspace()` (Pilot: eine „aktive“ Mitgliedschaft,
 * älteste Zeile bei mehreren — siehe `getWorkspaceMembershipForUserId`).
 *
 * **Supabase / Auth (Punkt 3):** Alle Aufrufe laufen mit dem **User-JWT** des Server-Clients (`createClient()`).
 * Row-Level Security filtert nach `current_workspace_id()` / Rolle (z. B. `tasks`: Team sieht keine
 * `doctor_only`-Zeilen). Die Route `/dashboard` leitet **Nicht-Ärzte** serverseitig um — diese Queries
 * sind dennoch nur mit **explizitem `workspace_id`** formuliert, damit die Absicht im Code klar bleibt.
 * Bei PostgREST-Fehlern wird `ok: false` zurückgegeben (keine „Null als echte 0“); Logging nur mit
 * **Ereignis-Tag + Fehlercode**, keine vollständigen Fehlerobjekte in der Konsole.
 *
 * **Fehler / Recovery (Punkt 8):** Die Route mappt `ok: false` ausschließlich auf **ruhige,
 * nicht-technische** UI-Texte; keine Codes oder SQL/RLS-Fragmente für Nutzer. Teilfehler (z. B. nur
 * Chronik) bleiben auf der betroffenen Sektion sichtbar; der Seitenkopf fasst nur bei Bedarf zusammen.
 *
 * **Mobile (Punkt 9):** Darstellung und Abstände der `/dashboard`-Seite; dieses Modul liefert nur Daten,
 * kein Layout — UI-Touch- und Overflow-Regeln liegen in `app/(protected)/dashboard/page.tsx`.
 *
 * **Security (Punkt 10):** Jede Funktion prüft `workspaceId` auf ein **UUID-Format**, bevor PostgREST
 * aufgerufen wird (Fail-fast, keine Query mit leerem oder manipulierten String). Primäre Isolation
 * bleibt **RLS + JWT**; die explizite `.eq("workspace_id", …)`-Filterung spiegelt die Absicht im Code.
 * Chronik-Links zeigen nur IDs aus derselben gefilterten Antwort (`/inbox/…`, `/my-tasks/…` — keine
 * Workspace-Slug-URLs). Server-Logging nur **Ereignis + PostgREST-Code**, keine Fehlermeldungen.
 *
 * **MVP / Pilot (Punkt 11):** Bewusst **keine** Trend- oder Benchmark-Queries, keine Reporting-Schicht —
 * nur Counts, Listen und ein kurzer Aktivitätsauszug für den Tagesstart.
 *
 * **Nice / Future / Non-MVP (Punkt 12):** Entspricht dem UI-/Produktvertrag in
 * `app/(protected)/dashboard/page.tsx`. **Nice:** Integrationstests pro Query-Funktion; kurze
 * Entwickler-Notiz zur Semantik der Counts (24h-Fenster, `seen_at` / Lesestatus). **Future:** neue
 * Kennzahlen zuerst an **Arbeitsorte** (Inbox, Tasks) oder an Reporting-Infrastruktur koppeln, nicht
 * durch breitere `select()` / Joins „nur fürs Dashboard“. **Non-MVP:** Aggregates über lange Zeiträume,
 * Materialized Views, Feed-Pagination oder Analytics-Schichten in diesem Modul.
 *
 * **Priorität (Punkt 13):** P1 begleitend zur Page-Doku — bei Query-Änderungen zuerst **Semantik und
 * Vertrauen** (Counts vs. echte Fehler, RLS), nicht Feature-Fläche. Route **einfrieren** bis auf Bugfixes
 * oder expliziten Produktauftrag (siehe `page.tsx` Punkt 13).
 */

const DASHBOARD_WORKSPACE_ID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isDashboardWorkspaceId(workspaceId: string): boolean {
  return typeof workspaceId === "string" && DASHBOARD_WORKSPACE_ID_RE.test(workspaceId.trim());
}

export function logDashboardDbFailure(event: string, err: { code?: string } | null | undefined) {
  const code = err && typeof err.code === "string" && err.code ? err.code : "unknown";
  console.error(`[dashboard] event=${event} code=${code}`);
}

/** Count query: `ok: false` means DB/RLS error — UI must not show a fake zero. */
export type SafeCount = { ok: true; count: number } | { ok: false };

export type OpenTaskRow = {
  id: string;
  content: string;
  submission_id: string | null;
  created_at: string;
  status: string;
  patient_name?: string | null;
};

export type OpenTasksResult = { ok: true; tasks: OpenTaskRow[] } | { ok: false };

export type ActivityEvent = {
  type: "submission_received" | "task_created" | "task_done";
  id: string;
  text: string;
  timestamp: string;
  /** Ziel-URL; wenn fehlend, rendert die UI die Zeile nicht als Link (kein „falsch klickbar“). */
  link?: string;
};

export type RecentActivityResult = { ok: true; events: ActivityEvent[] } | { ok: false };

export type SubmissionPreviewRow = {
  id: string;
  patient_name: string | null;
  patient_email: string | null;
  patient_notes: string | null;
  created_at: string;
  seen_at: string | null;
  message_draft_status?: MessageDraftListStatus;
  intake_channel?: IntakeChannel;
};

export type DashboardPriorityItem = {
  id: string;
  patient_name: string | null;
  patient_notes: string | null;
  photo_count: number;
  seen_at: string | null;
  created_at: string;
};

export type DashboardPriorityResult =
  | { ok: true; items: DashboardPriorityItem[] }
  | { ok: false };

export type SubmissionPreviewResult =
  | { ok: true; rows: SubmissionPreviewRow[] }
  | { ok: false };

export type WeeklyCountsResult =
  | { ok: true; counts: number[] }
  | { ok: false };

export const getTotalSubmissionsCount = cache(
  async (workspaceId: string): Promise<SafeCount> => {
    if (!isDashboardWorkspaceId(workspaceId)) {
      logDashboardDbFailure("total_submissions_count_invalid_workspace_id", null);
      return { ok: false };
    }
    const supabase = await createClient();
    const { count, error } = await supabase
      .from("submissions")
      .select("id", { count: "exact", head: true })
      .eq("workspace_id", workspaceId);

    if (error) {
      logDashboardDbFailure("total_submissions_count_failed", error);
      return { ok: false };
    }
    return { ok: true, count: count || 0 };
  }
);

export const getWeeklySubmissionCounts = cache(
  async (workspaceId: string): Promise<WeeklyCountsResult> => {
    if (!isDashboardWorkspaceId(workspaceId)) {
      logDashboardDbFailure("weekly_submissions_invalid_workspace_id", null);
      return { ok: false };
    }
    const supabase = await createClient();
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - 6);

    const { data, error } = await supabase
      .from("submissions")
      .select("created_at")
      .eq("workspace_id", workspaceId)
      .gte("created_at", start.toISOString());

    if (error) {
      logDashboardDbFailure("weekly_submissions_failed", error);
      return { ok: false };
    }

    const counts = Array.from({ length: 7 }, () => 0);
    const dayIndex = (d: Date) => {
      const diff = Math.floor(
        (d.getTime() - start.getTime()) / (24 * 60 * 60 * 1000)
      );
      return Math.min(6, Math.max(0, diff));
    };

    (data || []).forEach((row) => {
      const created = new Date(row.created_at as string);
      counts[dayIndex(created)] += 1;
    });

    return { ok: true, counts };
  }
);

/** Ungelesene Fälle zuerst, danach jüngste — für „Heute wichtig“ auf dem Dashboard. */
export const getDashboardPriorityItems = cache(
  async (workspaceId: string, limit = 5): Promise<DashboardPriorityResult> => {
    if (!isDashboardWorkspaceId(workspaceId)) {
      logDashboardDbFailure("dashboard_priority_invalid_workspace_id", null);
      return { ok: false };
    }
    const supabase = await createClient();
    const selectWithDraft =
      "id, patient_name, patient_notes, seen_at, created_at, is_draft, submission_photos(count)";
    const selectBase =
      "id, patient_name, patient_notes, seen_at, created_at, submission_photos(count)";

    const queryLimit = Math.min(Math.max(limit, 1), 8) * 2;
    const orderOpts = {
      seenOrder: { ascending: true, nullsFirst: true } as const,
      createdOrder: { ascending: false } as const,
    };

    const first = await supabase
      .from("submissions")
      .select(selectWithDraft)
      .eq("workspace_id", workspaceId)
      .order("seen_at", orderOpts.seenOrder)
      .order("created_at", orderOpts.createdOrder)
      .limit(queryLimit);

    const resolved =
      first.error && isLikelyMissingDbColumnError(first.error)
        ? await supabase
            .from("submissions")
            .select(selectBase)
            .eq("workspace_id", workspaceId)
            .order("seen_at", orderOpts.seenOrder)
            .order("created_at", orderOpts.createdOrder)
            .limit(queryLimit)
        : first;

    if (resolved.error) {
      logDashboardDbFailure("dashboard_priority_failed", resolved.error);
      return { ok: false };
    }

    const rows = (resolved.data || []) as Record<string, unknown>[];
    const items: DashboardPriorityItem[] = [];

    for (const row of rows) {
      if (row.is_draft === true) continue;
      items.push({
        id: row.id as string,
        patient_name: (row.patient_name as string | null) ?? null,
        patient_notes: (row.patient_notes as string | null) ?? null,
        photo_count:
          (row.submission_photos as { count: number }[] | undefined)?.[0]?.count || 0,
        seen_at: (row.seen_at as string | null) ?? null,
        created_at: row.created_at as string,
      });
      if (items.length >= limit) break;
    }

    return { ok: true, items };
  }
);

export const getRecentSubmissionsPreview = cache(
  async (workspaceId: string): Promise<SubmissionPreviewResult> => {
    if (!isDashboardWorkspaceId(workspaceId)) {
      logDashboardDbFailure("submission_preview_invalid_workspace_id", null);
      return { ok: false };
    }
    const supabase = await createClient();
    const previewSelect =
      "id, patient_name, patient_email, patient_notes, created_at, seen_at, intake_channel";
    const previewRes = await supabase
      .from("submissions")
      .select(previewSelect)
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false })
      .limit(5);

    let intakeKnown = true;
    let rows: Array<Record<string, unknown>> | null =
      (previewRes.data as Array<Record<string, unknown>> | null) ?? null;
    let error = previewRes.error;

    if (error && isLikelyMissingDbColumnError(error)) {
      intakeKnown = false;
      const fallback = await supabase
        .from("submissions")
        .select("id, patient_name, patient_email, patient_notes, created_at, seen_at")
        .eq("workspace_id", workspaceId)
        .order("created_at", { ascending: false })
        .limit(5);
      rows = (fallback.data as Array<Record<string, unknown>> | null) ?? null;
      error = fallback.error;
    }

    if (error) {
      logDashboardDbFailure("submission_preview_failed", error);
      return { ok: false };
    }

    return {
      ok: true,
      rows: (rows || []).map((row) => {
        const r = row as {
          id: string;
          patient_name: string | null;
          patient_email: string | null;
          patient_notes: string | null;
          created_at: string;
          seen_at: string | null;
          intake_channel?: string | null;
        };
        return {
          id: r.id,
          patient_name: r.patient_name ?? null,
          patient_email: r.patient_email ?? null,
          patient_notes: r.patient_notes ?? null,
          created_at: r.created_at,
          seen_at: r.seen_at ?? null,
          intake_channel: intakeKnown
            ? normalizeIntakeChannel(r.intake_channel)
            : ("unknown" as const),
        };
      }),
    };
  }
);

export const getNewSubmissionsCount = cache(
  async (workspaceId: string): Promise<SafeCount> => {
    if (!isDashboardWorkspaceId(workspaceId)) {
      logDashboardDbFailure("new_submissions_count_invalid_workspace_id", null);
      return { ok: false };
    }
    const supabase = await createClient();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const { count, error } = await supabase
      .from("submissions")
      .select("id", { count: "exact", head: true })
      .eq("workspace_id", workspaceId)
      .gte("created_at", yesterday.toISOString());

    if (error) {
      logDashboardDbFailure("new_submissions_count_failed", error);
      return { ok: false };
    }

    return { ok: true, count: count || 0 };
  }
);

export const getTotalUnseenSubmissions = cache(
  async (workspaceId: string): Promise<SafeCount> => {
    if (!isDashboardWorkspaceId(workspaceId)) {
      logDashboardDbFailure("unseen_submissions_count_invalid_workspace_id", null);
      return { ok: false };
    }
    const supabase = await createClient();

    const { count, error } = await supabase
      .from("submissions")
      .select("id", { count: "exact", head: true })
      .eq("workspace_id", workspaceId)
      .is("seen_at", null);

    if (error) {
      logDashboardDbFailure("unseen_submissions_count_failed", error);
      return { ok: false };
    }

    return { ok: true, count: count || 0 };
  }
);

export const getOpenTasks = cache(async (workspaceId: string): Promise<OpenTasksResult> => {
  if (!isDashboardWorkspaceId(workspaceId)) {
    logDashboardDbFailure("open_tasks_invalid_workspace_id", null);
    return { ok: false };
  }
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("tasks")
    .select("id, content, submission_id, created_at, status, submissions(patient_name)")
    .eq("workspace_id", workspaceId)
    .in("status", ["open", "pending_review"])
    .order("created_at", { ascending: false })
    .limit(10);

  if (error) {
    logDashboardDbFailure("open_tasks_select_failed", error);
    return { ok: false };
  }

  const tasks: OpenTaskRow[] = (data || []).map((row) => {
    const r = row as {
      id: string;
      content: string;
      submission_id: string | null;
      created_at: string;
      status: string;
      submissions: { patient_name: string | null } | { patient_name: string | null }[] | null;
    };
    const submission = Array.isArray(r.submissions) ? r.submissions[0] : r.submissions;
    return {
      id: r.id,
      content: r.content,
      submission_id: r.submission_id ?? null,
      created_at: r.created_at,
      status: r.status,
      patient_name: submission?.patient_name ?? null,
    };
  });

  return { ok: true, tasks };
});

/**
 * Kurz-Chronik: bis zu drei neueste Zeilen je Quelle (Einsendungen, offene/erledigte Aufgaben),
 * danach gemischt höchstens vier Einträge — nur **reale** DB-Zeilen, kein Aufpolstern. Kein Anspruch
 * auf vollständige Praxishistorie.
 */
export const getRecentActivity = cache(
  async (workspaceId: string): Promise<RecentActivityResult> => {
    if (!isDashboardWorkspaceId(workspaceId)) {
      logDashboardDbFailure("recent_activity_invalid_workspace_id", null);
      return { ok: false };
    }
    const supabase = await createClient();

    const [submissionsRes, tasksRes, doneTasksRes] = await Promise.all([
    supabase
      .from("submissions")
      .select("id, patient_name, created_at")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false })
      .limit(3),
    supabase
      .from("tasks")
      .select("id, content, created_at, submission_id")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false })
      .limit(3),
    supabase
      .from("tasks")
      .select("id, content, done_at, submission_id, status")
      .eq("workspace_id", workspaceId)
      .eq("status", "done")
      .order("done_at", { ascending: false })
      .limit(3),
    ]);

    if (submissionsRes.error || tasksRes.error || doneTasksRes.error) {
      if (submissionsRes.error) {
        logDashboardDbFailure("recent_activity_submissions_failed", submissionsRes.error);
      }
      if (tasksRes.error) {
        logDashboardDbFailure("recent_activity_tasks_open_failed", tasksRes.error);
      }
      if (doneTasksRes.error) {
        logDashboardDbFailure("recent_activity_tasks_done_failed", doneTasksRes.error);
      }
      return { ok: false };
    }

    const events: ActivityEvent[] = [];

    (submissionsRes.data || []).forEach((s) => {
      events.push({
        type: "submission_received",
        id: s.id,
        text: `Neue Einsendung von ${s.patient_name || "Patient"}`,
        timestamp: s.created_at,
        link: `/inbox/${s.id}`,
      });
    });

    (tasksRes.data || []).forEach((t) => {
      events.push({
        type: "task_created",
        id: t.id,
        text: `Aufgabe: ${t.content.substring(0, 60)}${t.content.length > 60 ? "…" : ""}`,
        timestamp: t.created_at,
        link: `/my-tasks/${t.id}`,
      });
    });

    (doneTasksRes.data || []).forEach((t) => {
      if (t.done_at) {
        events.push({
          type: "task_done",
          id: `done-${t.id}`,
          text: `Aufgabe erledigt: ${t.content.substring(0, 60)}${t.content.length > 60 ? "…" : ""}`,
          timestamp: t.done_at,
          link: t.submission_id ? `/inbox/${t.submission_id}` : `/my-tasks/${t.id}`,
        });
      }
    });

    events.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    return { ok: true, events: events.slice(0, 4) };
  }
);

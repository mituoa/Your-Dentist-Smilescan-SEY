import type { MessageDraftListStatus } from "@/lib/message-drafts/list-status";
import type { MyTask } from "@/lib/queries/my-tasks";

/** Einheitliches Relay-Statusmodell (keine Duplikate). */
export type RelayOpsStatus =
  | "new"
  | "in_progress"
  | "waiting_patient"
  | "waiting_practice"
  | "overdue"
  | "done";

export type RelayOpsStatusMeta = {
  status: RelayOpsStatus;
  label: string;
  /** Ebene-1-Bucket (Kritisch ist Priorität, kein Status). */
  isCritical: boolean;
};

export type RelayTaskEnrichment = {
  messageDraftStatus: MessageDraftListStatus;
};

function isOverdue(task: MyTask): boolean {
  if (!task.due_date || task.status === "done") return false;
  return task.due_date.slice(0, 10) < new Date().toISOString().slice(0, 10);
}

function isDueToday(dueDate: string | null): boolean {
  if (!dueDate) return false;
  return dueDate.slice(0, 10) === new Date().toISOString().slice(0, 10);
}

function isRecentlyCreated(createdAt: string): boolean {
  const created = new Date(createdAt).getTime();
  if (Number.isNaN(created)) return false;
  return Date.now() - created < 48 * 60 * 60 * 1000;
}

function isDoneToday(task: MyTask): boolean {
  if (!task.done_at) return false;
  return task.done_at.slice(0, 10) === new Date().toISOString().slice(0, 10);
}

function titleImpliesPatientWait(title: string): boolean {
  return /rückruf|zurückruf|foto|bild|termin|nachfordern|antwort.*patient|patient.*antwort|bestätigung/i.test(
    title
  );
}

export function resolveRelayOpsStatus(
  task: MyTask,
  enrichment?: RelayTaskEnrichment
): RelayOpsStatusMeta {
  const isCritical = task.priority === "important" && task.status !== "done";

  if (task.status === "done") {
    return { status: "done", label: "Erledigt", isCritical: false };
  }

  if (isOverdue(task)) {
    return { status: "overdue", label: "Überfällig", isCritical };
  }

  if (task.status === "pending_review") {
    return { status: "waiting_practice", label: "Wartet auf Arzt", isCritical };
  }

  if (task.recipient_type === "doctor_only" && task.status === "open") {
    return { status: "waiting_practice", label: "Wartet auf Arzt", isCritical };
  }

  const draftStatus = enrichment?.messageDraftStatus ?? "none";
  const patientLinked = Boolean(task.submission_id);

  if (
    patientLinked &&
    (draftStatus === "sent" || titleImpliesPatientWait(task.title))
  ) {
    return { status: "waiting_patient", label: "Wartet auf Patient", isCritical };
  }

  if (patientLinked && (draftStatus === "draft" || draftStatus === "approved")) {
    return { status: "waiting_practice", label: "Wartet auf Praxis", isCritical };
  }

  if (isRecentlyCreated(task.created_at)) {
    return { status: "new", label: "Neu", isCritical };
  }

  return { status: "in_progress", label: "In Bearbeitung", isCritical };
}

export function taskLastActivityAt(task: MyTask): string {
  const candidates = [task.created_at, task.submitted_for_review_at, task.done_at].filter(
    (v): v is string => Boolean(v)
  );
  if (candidates.length === 0) return task.created_at;
  return candidates.sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0]!;
}

export function formatRelayRelativeTime(iso: string): string {
  const then = new Date(iso);
  if (Number.isNaN(then.getTime())) return "—";
  const diffMs = Date.now() - then.getTime();
  const diffMin = Math.floor(diffMs / 60_000);
  if (diffMin < 1) return "gerade eben";
  if (diffMin < 60) return `vor ${diffMin} Min.`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `vor ${diffH} Std.`;
  const diffD = Math.floor(diffH / 24);
  if (diffD === 1) return "gestern";
  if (diffD < 7) return `vor ${diffD} Tagen`;
  return then.toLocaleDateString("de-DE", { day: "numeric", month: "short" });
}

export function shortSubmissionRef(submissionId: string): string {
  return submissionId.replace(/-/g, "").slice(0, 8).toUpperCase();
}

export function inferTrackerRecommendation(
  title: string,
  description: string | null
): string | null {
  const fromTitle = (() => {
    if (/foto|bild/i.test(title)) return "Foto nachfordern";
    if (/termin/i.test(title)) return "Termin anbieten";
    if (/rückfrage|zurückruf|rückruf/i.test(title)) return "Rückfrage an Patient";
    if (/verlauf|kontrolle/i.test(title)) return "Verlaufskontrolle";
    if (/dokument/i.test(title)) return "Dokumentationsbedarf";
    return null;
  })();

  if (!description?.trim()) return fromTitle;

  const body = description.trim();
  const kontext = body.match(/^Kontext:\s*(.+?)(?:\n|$)/m)?.[1]?.trim();
  if (kontext) return kontext;

  const firstLine = body.split("\n")[0]?.trim();
  if (firstLine && firstLine.length < 120) return firstLine;

  return fromTitle;
}

export type RelayOpsTodayBand = {
  critical: number;
  waitingPatient: number;
  waitingDoctor: number;
  dueToday: number;
  overdue: number;
  doneToday: number;
};

export function buildRelayOpsTodayBand(
  open: MyTask[],
  pending: MyTask[],
  done: MyTask[],
  enrichments: Map<string, RelayTaskEnrichment>
): RelayOpsTodayBand {
  const active = [...open, ...pending];
  let critical = 0;
  let waitingPatient = 0;
  let waitingDoctor = 0;
  let dueToday = 0;
  let overdue = 0;

  for (const task of active) {
    const enrichment = task.submission_id
      ? enrichments.get(task.submission_id)
      : undefined;
    const meta = resolveRelayOpsStatus(task, enrichment);
    if (meta.isCritical) critical += 1;
    if (meta.status === "waiting_patient") waitingPatient += 1;
    if (meta.label === "Wartet auf Arzt") waitingDoctor += 1;
    if (isDueToday(task.due_date) && task.status !== "done") dueToday += 1;
    if (isOverdue(task)) overdue += 1;
  }

  const doneToday = done.filter(isDoneToday).length;

  return {
    critical,
    waitingPatient,
    waitingDoctor,
    dueToday,
    overdue,
    doneToday,
  };
}

export function isWaitingOnPatientTask(
  task: MyTask,
  enrichment?: RelayTaskEnrichment
): boolean {
  return resolveRelayOpsStatus(task, enrichment).status === "waiting_patient";
}

export function isWaitingOnDoctorTask(
  task: MyTask,
  enrichment?: RelayTaskEnrichment
): boolean {
  const meta = resolveRelayOpsStatus(task, enrichment);
  return meta.label === "Wartet auf Arzt";
}

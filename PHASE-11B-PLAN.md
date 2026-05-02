# PHASE 11b — Task-Workflow, Kommentare, Filter

> **Für Cursor Agent:** Großer Plan. Erweitert den Task-Flow um Two-Step-Approval, Kommentare, Tab-Filter und 5 E-Mail-Benachrichtigungen. Arbeite Schritte 1-18 systematisch ab. Teste mit `npm run build` nach Schritt 9 und nochmal nach Schritt 18.

> **Für den Menschen:** Nach Phase 11b hast du ein vollwertiges Aufgaben-Tracking-System — Team meldet "fertig", Doctor bestätigt/lehnt ab, beide kommentieren, alle kriegen Mails. So professionell wie Asana.

---

## Design-Entscheidungen (alle getroffen)

| Entscheidung | Gewählt |
|---|---|
| Flow nach "Erledigt melden" | Variante A — Task bleibt bei Team sichtbar mit "Auf Bestätigung wartend" |
| Doctor kann ablehnen? | Ja — Buttons "Bestätigen" und "Zurückweisen" |
| Filter-UI | Tabs oben mit Badge-Countern |
| Historie | Nur letzte 90 Tage |
| Kommentar-UI | Eigene Detail-Seite `/my-tasks/[id]` |
| E-Mail-Mails | Alle 5 Events |
| Doctor-Self-Assignment | Direkter Sprung auf `done`, kein Approval |

---

## Task-Status-Flow

```
       ┌─ Team klickt "Erledigt melden" ──┐
       │                                   │
   [ open ] ────────────────────────► [ pending_review ]
       ▲                                   │
       │                                   │
       │                          ┌────────┴─────────┐
       │                          │                  │
       └──── Doctor "Zurückweisen"                    ▼
                                            Doctor "Bestätigen"
                                                     │
                                                     ▼
                                                 [ done ]

Spezialfall: Doctor = assigned_user → Task geht direkt von [open] → [done]
```

Status `rejected` verwenden wir NICHT als separaten Status — bei Zurückweisen geht Task einfach zurück auf `open`. Rejected-Kommentar wird dokumentiert, aber Task ist wieder offen für zweite Runde.

---

## Übersicht der Dateien

### Neue Dateien

| Pfad | Zweck |
|---|---|
| `supabase/migrations/018_task_workflow.sql` | Status-Enum + Spalten + neue Tabelle |
| `lib/queries/task-detail.ts` | Task + Kommentare laden |
| `lib/queries/task-counts.ts` | Counters für Tab-Badges |
| `lib/mail/task-notifications.ts` | 5 Mail-Templates |
| `app/(protected)/my-tasks/[id]/page.tsx` | Task-Detail-Seite |
| `app/(protected)/my-tasks/actions.ts` | Server Actions (submit, approve, reject, comment) |
| `components/my-tasks/task-detail.tsx` | Detail-View mit Kommentaren |
| `components/my-tasks/task-status-badge.tsx` | Status-Anzeige (Pill) |
| `components/my-tasks/task-actions.tsx` | Buttons je Rolle + Status |
| `components/my-tasks/comment-thread.tsx` | Kommentar-Liste |
| `components/my-tasks/comment-form.tsx` | Kommentar-Eingabe |
| `components/my-tasks/tabs-nav.tsx` | Tab-Navigation Offen/Pending/Done |

### Geänderte Dateien

| Pfad | Änderung |
|---|---|
| `lib/queries/my-tasks.ts` | Status-aware Queries (nicht nur `done = false`) |
| `components/my-tasks/task-list.tsx` | Link zu Detail-Seite |
| `components/my-tasks/task-card.tsx` | Status-Badge anzeigen |
| `app/(protected)/my-tasks/page.tsx` | Tab-Nav, Tab-Content |
| `app/(protected)/inbox/actions.ts` | `createTask` mit Default-Status `open` |

---

## Schritt 1 — Datenmodell erweitern

### Datei: `supabase/migrations/018_task_workflow.sql`

```sql
-- Phase 11b: Task-Workflow, Kommentare

-- 1. Status-Enum
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'task_status') THEN
    CREATE TYPE task_status AS ENUM ('open', 'pending_review', 'done');
  END IF;
END $$;

-- 2. Neue Spalten in tasks
ALTER TABLE tasks
  ADD COLUMN IF NOT EXISTS status task_status NOT NULL DEFAULT 'open',
  ADD COLUMN IF NOT EXISTS submitted_for_review_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS submitted_by_user_id uuid REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS reviewed_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS reviewed_by_user_id uuid REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS rejection_reason text;

-- Bestehende erledigte Tasks auf 'done' migrieren
UPDATE tasks SET status = 'done' WHERE done_at IS NOT NULL AND status = 'open';

-- 3. Task-Comments Tabelle
CREATE TABLE IF NOT EXISTS task_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  author_id uuid NOT NULL REFERENCES auth.users(id),
  content text NOT NULL,
  is_system boolean DEFAULT false,  -- true für "Task wurde zurückgewiesen mit Begründung: ..."
  created_at timestamp with time zone DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_task_comments_task ON task_comments(task_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_tasks_status_workspace ON tasks(workspace_id, status);

-- 4. RLS für task_comments
ALTER TABLE task_comments ENABLE ROW LEVEL SECURITY;

-- Alle Workspace-Mitglieder können Kommentare lesen (falls sie Task sehen dürfen)
CREATE POLICY "workspace members read task comments"
  ON task_comments FOR SELECT
  USING (
    task_id IN (
      SELECT id FROM tasks WHERE workspace_id = current_workspace_id()
    )
  );

-- Alle Workspace-Mitglieder mit Zugriff auf die Task können kommentieren
CREATE POLICY "workspace members create task comments"
  ON task_comments FOR INSERT
  WITH CHECK (
    task_id IN (
      SELECT id FROM tasks WHERE workspace_id = current_workspace_id()
    )
    AND author_id = auth.uid()
  );

-- Eigene Kommentare können gelöscht werden
CREATE POLICY "authors delete own comments"
  ON task_comments FOR DELETE
  USING (author_id = auth.uid());

-- 5. RLS für tasks UPDATE nochmal anpassen für Status-Flow
DROP POLICY IF EXISTS "members mark tasks done" ON tasks;

CREATE POLICY "members update tasks per role"
  ON tasks FOR UPDATE
  USING (
    workspace_id = current_workspace_id()
    AND (
      -- Doctor darf alles
      current_user_is_doctor()
      -- Team darf Task updaten wenn es Empfänger ist
      OR recipient_type = 'all_team'::task_recipient
      OR (
        recipient_type = 'specific_person'::task_recipient
        AND specific_recipient_id = auth.uid()
      )
    )
  )
  WITH CHECK (
    workspace_id = current_workspace_id()
    AND (
      current_user_is_doctor()
      OR recipient_type = 'all_team'::task_recipient
      OR (
        recipient_type = 'specific_person'::task_recipient
        AND specific_recipient_id = auth.uid()
      )
    )
  );

NOTIFY pgrst, 'reload schema';
```

**Hinweis für Cursor:** Falls `current_user_is_doctor()` oder `current_workspace_id()` nicht existieren, in bestehenden Migrations suchen — die sind aus Phase 2/6 und sollten bereits da sein.

---

## Schritt 2 — Mail-Templates

### Datei: `lib/mail/task-notifications.ts`

```typescript
import "server-only";
import { escapeHtml } from "@/lib/mail/escape-html";

interface MailData {
  taskTitle: string;
  taskUrl: string;
  actorName: string;
  recipientEmail: string;
  commentText?: string;
  rejectionReason?: string;
}

export function buildTaskSubmittedForReview(d: MailData) {
  const subject = `Aufgabe wartet auf Bestätigung: ${d.taskTitle}`;
  const text = `Guten Tag,\n\n${d.actorName} hat die Aufgabe "${d.taskTitle}" als erledigt gemeldet.\n\nBitte überprüfen und bestätigen Sie:\n${d.taskUrl}\n\nMit freundlichen Grüßen\nSmileScan`;
  const html = `<p>Guten Tag,</p><p><strong>${escapeHtml(d.actorName)}</strong> hat die Aufgabe "<strong>${escapeHtml(d.taskTitle)}</strong>" als erledigt gemeldet.</p><p>Bitte überprüfen und bestätigen Sie.</p><table cellpadding="0" cellspacing="0" border="0" style="margin: 20px 0;"><tr><td style="background-color: #1A1A1A; border-radius: 2px;"><a href="${escapeHtml(d.taskUrl)}" style="display: inline-block; padding: 14px 28px; color: #FAFAF8; text-decoration: none; font-weight: 500; font-family: sans-serif;">Aufgabe öffnen</a></td></tr></table><p>Mit freundlichen Grüßen<br>SmileScan</p>`;
  return { subject, text, html };
}

export function buildTaskApproved(d: MailData) {
  const subject = `Aufgabe bestätigt: ${d.taskTitle}`;
  const text = `Guten Tag,\n\n${d.actorName} hat Ihre Erledigung der Aufgabe "${d.taskTitle}" bestätigt.\n\n${d.taskUrl}\n\nMit freundlichen Grüßen\nSmileScan`;
  const html = `<p>Guten Tag,</p><p><strong>${escapeHtml(d.actorName)}</strong> hat Ihre Erledigung der Aufgabe "<strong>${escapeHtml(d.taskTitle)}</strong>" bestätigt.</p><table cellpadding="0" cellspacing="0" border="0" style="margin: 20px 0;"><tr><td style="background-color: #1A1A1A; border-radius: 2px;"><a href="${escapeHtml(d.taskUrl)}" style="display: inline-block; padding: 14px 28px; color: #FAFAF8; text-decoration: none; font-weight: 500; font-family: sans-serif;">Aufgabe ansehen</a></td></tr></table><p>Mit freundlichen Grüßen<br>SmileScan</p>`;
  return { subject, text, html };
}

export function buildTaskRejected(d: MailData) {
  const reason = d.rejectionReason || "Keine Begründung angegeben.";
  const subject = `Aufgabe zurückgewiesen: ${d.taskTitle}`;
  const text = `Guten Tag,\n\n${d.actorName} hat Ihre Erledigung der Aufgabe "${d.taskTitle}" zurückgewiesen.\n\nBegründung: ${reason}\n\nAufgabe öffnen: ${d.taskUrl}\n\nMit freundlichen Grüßen\nSmileScan`;
  const html = `<p>Guten Tag,</p><p><strong>${escapeHtml(d.actorName)}</strong> hat Ihre Erledigung der Aufgabe "<strong>${escapeHtml(d.taskTitle)}</strong>" zurückgewiesen.</p><p><strong>Begründung:</strong><br>${escapeHtml(reason)}</p><table cellpadding="0" cellspacing="0" border="0" style="margin: 20px 0;"><tr><td style="background-color: #1A1A1A; border-radius: 2px;"><a href="${escapeHtml(d.taskUrl)}" style="display: inline-block; padding: 14px 28px; color: #FAFAF8; text-decoration: none; font-weight: 500; font-family: sans-serif;">Aufgabe öffnen</a></td></tr></table><p>Mit freundlichen Grüßen<br>SmileScan</p>`;
  return { subject, text, html };
}

export function buildTaskComment(d: MailData) {
  const comment = d.commentText || "";
  const subject = `Neuer Kommentar: ${d.taskTitle}`;
  const text = `Guten Tag,\n\n${d.actorName} hat einen Kommentar zur Aufgabe "${d.taskTitle}" hinterlassen:\n\n"${comment}"\n\nAufgabe öffnen: ${d.taskUrl}\n\nMit freundlichen Grüßen\nSmileScan`;
  const html = `<p>Guten Tag,</p><p><strong>${escapeHtml(d.actorName)}</strong> hat einen Kommentar zur Aufgabe "<strong>${escapeHtml(d.taskTitle)}</strong>" hinterlassen:</p><blockquote style="border-left: 3px solid #D4D1C7; padding: 8px 16px; margin: 16px 0; color: #5F5E5A; font-style: italic;">${escapeHtml(comment)}</blockquote><table cellpadding="0" cellspacing="0" border="0" style="margin: 20px 0;"><tr><td style="background-color: #1A1A1A; border-radius: 2px;"><a href="${escapeHtml(d.taskUrl)}" style="display: inline-block; padding: 14px 28px; color: #FAFAF8; text-decoration: none; font-weight: 500; font-family: sans-serif;">Antworten</a></td></tr></table><p>Mit freundlichen Grüßen<br>SmileScan</p>`;
  return { subject, text, html };
}

export function buildTaskAssigned(d: MailData) {
  const subject = `Neue Aufgabe: ${d.taskTitle}`;
  const text = `Guten Tag,\n\n${d.actorName} hat Ihnen eine neue Aufgabe zugewiesen: "${d.taskTitle}"\n\n${d.taskUrl}\n\nMit freundlichen Grüßen\nSmileScan`;
  const html = `<p>Guten Tag,</p><p><strong>${escapeHtml(d.actorName)}</strong> hat Ihnen eine neue Aufgabe zugewiesen:</p><p><strong>${escapeHtml(d.taskTitle)}</strong></p><table cellpadding="0" cellspacing="0" border="0" style="margin: 20px 0;"><tr><td style="background-color: #1A1A1A; border-radius: 2px;"><a href="${escapeHtml(d.taskUrl)}" style="display: inline-block; padding: 14px 28px; color: #FAFAF8; text-decoration: none; font-weight: 500; font-family: sans-serif;">Aufgabe öffnen</a></td></tr></table><p>Mit freundlichen Grüßen<br>SmileScan</p>`;
  return { subject, text, html };
}
```

---

## Schritt 3 — Queries für Detail und Counts

### Datei: `lib/queries/task-detail.ts`

```typescript
import "server-only";
import { createClient } from "@/lib/supabase/server";

export interface TaskDetail {
  id: string;
  content: string;
  description: string | null;
  status: "open" | "pending_review" | "done";
  recipient_type: "all_team" | "specific_person";
  specific_recipient_id: string | null;
  specific_recipient_email: string | null;
  submission_id: string;
  submission_patient_name: string | null;
  created_at: string;
  created_by_user_id: string;
  created_by_email: string | null;
  submitted_for_review_at: string | null;
  submitted_by_email: string | null;
  reviewed_at: string | null;
  reviewed_by_email: string | null;
  rejection_reason: string | null;
  done_at: string | null;
  due_date: string | null;
}

export interface TaskComment {
  id: string;
  task_id: string;
  author_id: string;
  author_email: string | null;
  content: string;
  is_system: boolean;
  created_at: string;
}

export async function getTaskWithComments(taskId: string, workspaceId: string): Promise<{ task: TaskDetail | null; comments: TaskComment[] }> {
  const supabase = await createClient();

  const { data: taskRow } = await supabase
    .from("tasks")
    .select(`
      id, content, description, status, recipient_type, specific_recipient_id,
      submission_id, created_at, created_by_user_id,
      submitted_for_review_at, submitted_by_user_id,
      reviewed_at, reviewed_by_user_id, rejection_reason, done_at, due_date,
      submissions(patient_name)
    `)
    .eq("id", taskId)
    .eq("workspace_id", workspaceId)
    .maybeSingle();

  if (!taskRow) return { task: null, comments: [] };

  // E-Mails der User-IDs laden (via Admin)
  const { createAdminClient } = await import("@/lib/supabase/admin");
  const admin = createAdminClient();

  const userIds = Array.from(new Set([
    taskRow.created_by_user_id,
    taskRow.submitted_by_user_id,
    taskRow.reviewed_by_user_id,
    taskRow.specific_recipient_id,
  ].filter(Boolean) as string[]));

  const emailMap: Record<string, string> = {};
  for (const id of userIds) {
    const { data } = await admin.auth.admin.getUserById(id);
    if (data?.user?.email) emailMap[id] = data.user.email;
  }

  const task: TaskDetail = {
    id: taskRow.id,
    content: taskRow.content,
    description: taskRow.description,
    status: taskRow.status,
    recipient_type: taskRow.recipient_type,
    specific_recipient_id: taskRow.specific_recipient_id,
    specific_recipient_email: taskRow.specific_recipient_id ? emailMap[taskRow.specific_recipient_id] || null : null,
    submission_id: taskRow.submission_id,
    submission_patient_name: (taskRow.submissions as any)?.patient_name || null,
    created_at: taskRow.created_at,
    created_by_user_id: taskRow.created_by_user_id,
    created_by_email: emailMap[taskRow.created_by_user_id] || null,
    submitted_for_review_at: taskRow.submitted_for_review_at,
    submitted_by_email: taskRow.submitted_by_user_id ? emailMap[taskRow.submitted_by_user_id] || null : null,
    reviewed_at: taskRow.reviewed_at,
    reviewed_by_email: taskRow.reviewed_by_user_id ? emailMap[taskRow.reviewed_by_user_id] || null : null,
    rejection_reason: taskRow.rejection_reason,
    done_at: taskRow.done_at,
    due_date: taskRow.due_date,
  };

  const { data: commentRows } = await supabase
    .from("task_comments")
    .select("*")
    .eq("task_id", taskId)
    .order("created_at", { ascending: true });

  const comments: TaskComment[] = [];
  for (const c of commentRows || []) {
    if (!emailMap[c.author_id]) {
      const { data } = await admin.auth.admin.getUserById(c.author_id);
      emailMap[c.author_id] = data?.user?.email || "unbekannt";
    }
    comments.push({
      id: c.id,
      task_id: c.task_id,
      author_id: c.author_id,
      author_email: emailMap[c.author_id] || null,
      content: c.content,
      is_system: c.is_system,
      created_at: c.created_at,
    });
  }

  return { task, comments };
}
```

### Datei: `lib/queries/task-counts.ts`

```typescript
import "server-only";
import { createClient } from "@/lib/supabase/server";

export interface TaskCounts {
  open: number;
  pending: number;
  done: number;
}

export async function getMyTaskCounts(userId: string, workspaceId: string, isDoctor: boolean): Promise<TaskCounts> {
  const supabase = await createClient();

  // Basis-Filter: Tasks die den User betreffen
  // Wenn Doctor: alle Tasks im Workspace die ihm relevant sind (empfänger oder selbst erstellt)
  // Wenn Team: nur Tasks wo er specific_recipient ist ODER recipient_type = 'all_team'

  const roleFilter = isDoctor
    ? `or(created_by_user_id.eq.${userId},specific_recipient_id.eq.${userId},recipient_type.eq.all_team)`
    : `or(specific_recipient_id.eq.${userId},recipient_type.eq.all_team)`;

  // Da Supabase-Client komplexe `or` nicht trivial supportet, brauchen wir 3 einzelne Abfragen:

  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();

  const baseQuery = supabase
    .from("tasks")
    .select("id", { count: "exact", head: true })
    .eq("workspace_id", workspaceId);

  const applyRoleFilter = (query: any) => {
    if (isDoctor) {
      return query.or(`created_by_user_id.eq.${userId},specific_recipient_id.eq.${userId},recipient_type.eq.all_team`);
    }
    return query.or(`specific_recipient_id.eq.${userId},recipient_type.eq.all_team`);
  };

  const [openResult, pendingResult, doneResult] = await Promise.all([
    applyRoleFilter(supabase.from("tasks").select("id", { count: "exact", head: true }).eq("workspace_id", workspaceId).eq("status", "open")),
    applyRoleFilter(supabase.from("tasks").select("id", { count: "exact", head: true }).eq("workspace_id", workspaceId).eq("status", "pending_review")),
    applyRoleFilter(supabase.from("tasks").select("id", { count: "exact", head: true }).eq("workspace_id", workspaceId).eq("status", "done").gte("done_at", ninetyDaysAgo)),
  ]);

  return {
    open: openResult.count || 0,
    pending: pendingResult.count || 0,
    done: doneResult.count || 0,
  };
}
```

---

## Schritt 4 — Queries für My-Tasks-Liste anpassen

### Update: `lib/queries/my-tasks.ts`

Ersetze `getMyOpenTasks` mit:

```typescript
export async function getMyTasks(
  userId: string,
  workspaceId: string,
  isDoctor: boolean,
  status: "open" | "pending_review" | "done"
): Promise<MyTask[]> {
  const supabase = await createClient();

  let query = supabase
    .from("tasks")
    .select(`
      id, content, description, due_date, status, done_at, created_at,
      submitted_for_review_at, submission_id,
      submissions!inner(patient_name, created_at, workspace_id)
    `)
    .eq("submissions.workspace_id", workspaceId)
    .eq("status", status);

  if (isDoctor) {
    query = query.or(`created_by_user_id.eq.${userId},specific_recipient_id.eq.${userId},recipient_type.eq.all_team`);
  } else {
    query = query.or(`specific_recipient_id.eq.${userId},recipient_type.eq.all_team`);
  }

  // Für "done": nur letzte 90 Tage
  if (status === "done") {
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
    query = query.gte("done_at", ninetyDaysAgo).order("done_at", { ascending: false });
  } else {
    query = query
      .order("due_date", { ascending: true, nullsFirst: false })
      .order("created_at", { ascending: true });
  }

  const { data, error } = await query;

  if (error) {
    console.error("[getMyTasks]", error);
    return [];
  }

  return (data || []).map((t: any) => ({
    id: t.id,
    title: t.content,
    description: t.description,
    due_date: t.due_date,
    status: t.status,
    done_at: t.done_at,
    submitted_for_review_at: t.submitted_for_review_at,
    completed: t.status === "done",
    created_at: t.created_at,
    submission_id: t.submission_id,
    submission_patient_name: t.submissions?.patient_name || null,
    submission_created_at: t.submissions?.created_at || t.created_at,
  }));
}
```

Und im Interface `MyTask` ergänze: `status`, `done_at`, `submitted_for_review_at`.

---

## Schritt 5 — Server Actions

### Datei: `app/(protected)/my-tasks/actions.ts`

```typescript
"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentWorkspace } from "@/lib/auth-helpers";
import { revalidatePath } from "next/cache";
import { sendTransactionalMailBestEffort } from "@/lib/mail/send-mail-best-effort";
import {
  buildTaskSubmittedForReview,
  buildTaskApproved,
  buildTaskRejected,
  buildTaskComment,
} from "@/lib/mail/task-notifications";
import { getAppBaseUrl } from "@/lib/env";

// Helper: E-Mail für User-ID
async function getUserEmail(userId: string): Promise<string | null> {
  const admin = createAdminClient();
  const { data } = await admin.auth.admin.getUserById(userId);
  return data?.user?.email || null;
}

// Helper: Doctor-Emails eines Workspaces holen
async function getWorkspaceDoctorEmails(workspaceId: string): Promise<string[]> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("workspace_members")
    .select("user_id")
    .eq("workspace_id", workspaceId)
    .eq("role", "doctor");

  const emails: string[] = [];
  for (const m of data || []) {
    const e = await getUserEmail(m.user_id);
    if (e) emails.push(e);
  }
  return emails;
}

// Helper: Empfänger-E-Mails einer Task (wer soll über Änderungen informiert werden)
async function getTaskAudienceEmails(taskId: string, excludeUserId?: string): Promise<string[]> {
  const admin = createAdminClient();
  const { data: task } = await admin.from("tasks").select("workspace_id, recipient_type, specific_recipient_id, created_by_user_id").eq("id", taskId).single();
  if (!task) return [];

  const userIds = new Set<string>();
  userIds.add(task.created_by_user_id); // Ersteller informieren
  if (task.recipient_type === "specific_person" && task.specific_recipient_id) {
    userIds.add(task.specific_recipient_id);
  } else if (task.recipient_type === "all_team") {
    // alle Team-Member
    const { data: members } = await admin.from("workspace_members").select("user_id").eq("workspace_id", task.workspace_id);
    for (const m of members || []) userIds.add(m.user_id);
  }
  if (excludeUserId) userIds.delete(excludeUserId);

  const emails: string[] = [];
  for (const id of userIds) {
    const e = await getUserEmail(id);
    if (e) emails.push(e);
  }
  return emails;
}

// ---------- SUBMIT FOR REVIEW (Team → Doctor) ----------

export async function submitTaskForReview(taskId: string): Promise<{ error?: string; success?: boolean }> {
  const workspace = await getCurrentWorkspace();
  if (!workspace) return { error: "Nicht angemeldet." };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Nicht angemeldet." };

  // Task laden
  const { data: task } = await supabase
    .from("tasks")
    .select("id, content, status, workspace_id, created_by_user_id")
    .eq("id", taskId)
    .eq("workspace_id", workspace.workspace_id)
    .single();

  if (!task) return { error: "Aufgabe nicht gefunden." };
  if (task.status !== "open") return { error: "Aufgabe kann nicht gemeldet werden." };

  // Special case: Doctor submits own task → direkt auf done
  const isDoctorSelfAssignment = workspace.role === "doctor" && task.created_by_user_id === user.id;

  const newStatus = isDoctorSelfAssignment ? "done" : "pending_review";
  const updates: any = {
    status: newStatus,
  };
  if (newStatus === "pending_review") {
    updates.submitted_for_review_at = new Date().toISOString();
    updates.submitted_by_user_id = user.id;
  } else if (newStatus === "done") {
    updates.done_at = new Date().toISOString();
    updates.reviewed_by_user_id = user.id;
    updates.reviewed_at = new Date().toISOString();
  }

  const { error } = await supabase
    .from("tasks")
    .update(updates)
    .eq("id", taskId);

  if (error) return { error: "Aktion fehlgeschlagen." };

  // Mail senden (nur bei echter Review-Anforderung, nicht bei Self-Doctor)
  if (newStatus === "pending_review") {
    const actorEmail = user.email || "Team-Mitglied";
    const doctorEmails = await getWorkspaceDoctorEmails(workspace.workspace_id);
    const taskUrl = `${getAppBaseUrl()}/my-tasks/${taskId}`;
    const mail = buildTaskSubmittedForReview({
      taskTitle: task.content,
      taskUrl,
      actorName: actorEmail,
      recipientEmail: doctorEmails[0] || "",
    });

    for (const to of doctorEmails) {
      await sendTransactionalMailBestEffort(
        { to, subject: mail.subject, text: mail.text, html: mail.html },
        "task_submitted_for_review"
      );
    }
  }

  revalidatePath("/my-tasks");
  revalidatePath(`/my-tasks/${taskId}`);
  return { success: true };
}

// ---------- APPROVE (Doctor) ----------

export async function approveTask(taskId: string): Promise<{ error?: string; success?: boolean }> {
  const workspace = await getCurrentWorkspace();
  if (!workspace) return { error: "Nicht angemeldet." };
  if (workspace.role !== "doctor") return { error: "Nur Ärzte können bestätigen." };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Nicht angemeldet." };

  const { data: task } = await supabase
    .from("tasks")
    .select("id, content, status, workspace_id, submitted_by_user_id")
    .eq("id", taskId)
    .eq("workspace_id", workspace.workspace_id)
    .single();

  if (!task) return { error: "Aufgabe nicht gefunden." };
  if (task.status !== "pending_review") return { error: "Aufgabe ist nicht im Review-Zustand." };

  const now = new Date().toISOString();
  const { error } = await supabase
    .from("tasks")
    .update({
      status: "done",
      done_at: now,
      reviewed_at: now,
      reviewed_by_user_id: user.id,
    })
    .eq("id", taskId);

  if (error) return { error: "Bestätigung fehlgeschlagen." };

  // Mail an Einreicher
  if (task.submitted_by_user_id) {
    const submitterEmail = await getUserEmail(task.submitted_by_user_id);
    if (submitterEmail) {
      const taskUrl = `${getAppBaseUrl()}/my-tasks/${taskId}`;
      const mail = buildTaskApproved({
        taskTitle: task.content,
        taskUrl,
        actorName: user.email || "Arzt",
        recipientEmail: submitterEmail,
      });
      await sendTransactionalMailBestEffort(
        { to: submitterEmail, subject: mail.subject, text: mail.text, html: mail.html },
        "task_approved"
      );
    }
  }

  revalidatePath("/my-tasks");
  revalidatePath(`/my-tasks/${taskId}`);
  return { success: true };
}

// ---------- REJECT (Doctor) ----------

export async function rejectTask(taskId: string, reason: string): Promise<{ error?: string; success?: boolean }> {
  const workspace = await getCurrentWorkspace();
  if (!workspace) return { error: "Nicht angemeldet." };
  if (workspace.role !== "doctor") return { error: "Nur Ärzte können zurückweisen." };

  if (!reason.trim()) return { error: "Begründung ist erforderlich." };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Nicht angemeldet." };

  const { data: task } = await supabase
    .from("tasks")
    .select("id, content, status, workspace_id, submitted_by_user_id")
    .eq("id", taskId)
    .eq("workspace_id", workspace.workspace_id)
    .single();

  if (!task) return { error: "Aufgabe nicht gefunden." };
  if (task.status !== "pending_review") return { error: "Aufgabe ist nicht im Review-Zustand." };

  // Task zurück auf open
  const { error } = await supabase
    .from("tasks")
    .update({
      status: "open",
      submitted_for_review_at: null,
      submitted_by_user_id: null,
      rejection_reason: reason,
      reviewed_at: new Date().toISOString(),
      reviewed_by_user_id: user.id,
    })
    .eq("id", taskId);

  if (error) return { error: "Zurückweisen fehlgeschlagen." };

  // System-Kommentar hinzufügen für Doku
  await supabase.from("task_comments").insert({
    task_id: taskId,
    author_id: user.id,
    content: `Aufgabe zurückgewiesen. Begründung: ${reason}`,
    is_system: true,
  });

  // Mail an Einreicher
  if (task.submitted_by_user_id) {
    const submitterEmail = await getUserEmail(task.submitted_by_user_id);
    if (submitterEmail) {
      const taskUrl = `${getAppBaseUrl()}/my-tasks/${taskId}`;
      const mail = buildTaskRejected({
        taskTitle: task.content,
        taskUrl,
        actorName: user.email || "Arzt",
        recipientEmail: submitterEmail,
        rejectionReason: reason,
      });
      await sendTransactionalMailBestEffort(
        { to: submitterEmail, subject: mail.subject, text: mail.text, html: mail.html },
        "task_rejected"
      );
    }
  }

  revalidatePath("/my-tasks");
  revalidatePath(`/my-tasks/${taskId}`);
  return { success: true };
}

// ---------- COMMENT ----------

export async function addTaskComment(taskId: string, content: string): Promise<{ error?: string; success?: boolean }> {
  const workspace = await getCurrentWorkspace();
  if (!workspace) return { error: "Nicht angemeldet." };

  const trimmed = content.trim();
  if (!trimmed) return { error: "Kommentar darf nicht leer sein." };
  if (trimmed.length > 2000) return { error: "Maximal 2000 Zeichen." };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Nicht angemeldet." };

  const { data: task } = await supabase
    .from("tasks")
    .select("id, content, workspace_id")
    .eq("id", taskId)
    .eq("workspace_id", workspace.workspace_id)
    .single();

  if (!task) return { error: "Aufgabe nicht gefunden." };

  const { error } = await supabase.from("task_comments").insert({
    task_id: taskId,
    author_id: user.id,
    content: trimmed,
    is_system: false,
  });

  if (error) return { error: "Kommentar konnte nicht gespeichert werden." };

  // Mail an alle relevanten Audience-Member (außer Autor)
  const audience = await getTaskAudienceEmails(taskId, user.id);
  const taskUrl = `${getAppBaseUrl()}/my-tasks/${taskId}`;
  const mail = buildTaskComment({
    taskTitle: task.content,
    taskUrl,
    actorName: user.email || "Team-Mitglied",
    recipientEmail: audience[0] || "",
    commentText: trimmed,
  });

  for (const to of audience) {
    await sendTransactionalMailBestEffort(
      { to, subject: mail.subject, text: mail.text, html: mail.html },
      "task_comment"
    );
  }

  revalidatePath(`/my-tasks/${taskId}`);
  return { success: true };
}
```

---

## Schritt 6 — Task-Assigned-Mail bei Task-Erstellung

### Update: `app/(protected)/inbox/actions.ts` → `createTask`

Am Ende der Funktion, nach erfolgreichem Insert:

```typescript
// Send task assignment mail
try {
  const { buildTaskAssigned } = await import("@/lib/mail/task-notifications");
  const { sendTransactionalMailBestEffort } = await import("@/lib/mail/send-mail-best-effort");
  const { createAdminClient } = await import("@/lib/supabase/admin");
  const { getAppBaseUrl } = await import("@/lib/env");

  const admin = createAdminClient();
  const recipientEmails: string[] = [];

  if (payload.recipient_type === "specific_person" && payload.specific_recipient_id) {
    const { data } = await admin.auth.admin.getUserById(payload.specific_recipient_id);
    if (data?.user?.email && data.user.id !== user.id) {
      recipientEmails.push(data.user.email);
    }
  } else if (payload.recipient_type === "all_team") {
    const { data: members } = await admin.from("workspace_members").select("user_id").eq("workspace_id", workspace.workspace_id).neq("user_id", user.id);
    for (const m of members || []) {
      const { data } = await admin.auth.admin.getUserById(m.user_id);
      if (data?.user?.email) recipientEmails.push(data.user.email);
    }
  }

  const taskUrl = `${getAppBaseUrl()}/my-tasks/${newTaskId}`;
  const mail = buildTaskAssigned({
    taskTitle: payload.content,
    taskUrl,
    actorName: user.email || "Arzt",
    recipientEmail: recipientEmails[0] || "",
  });

  for (const to of recipientEmails) {
    await sendTransactionalMailBestEffort(
      { to, subject: mail.subject, text: mail.text, html: mail.html },
      "task_assigned"
    );
  }
} catch (err) {
  console.error("[createTask mail]", err);
  // Nicht kritisch — Task ist erstellt, nur Mail fehlgeschlagen
}
```

---

## Schritt 7 — Components

### Datei: `components/my-tasks/task-status-badge.tsx`

```typescript
import { AlertCircle, Clock, Check } from "lucide-react";

interface TaskStatusBadgeProps {
  status: "open" | "pending_review" | "done";
  size?: "sm" | "md";
}

export function TaskStatusBadge({ status, size = "sm" }: TaskStatusBadgeProps) {
  const cls = size === "sm" ? "text-[10px] px-1.5 py-0.5" : "text-xs px-2 py-1";
  const iconCls = size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5";

  if (status === "pending_review") {
    return (
      <span className={`inline-flex items-center gap-1 rounded font-medium bg-amber-100 text-amber-900 ${cls}`}>
        <Clock className={iconCls} strokeWidth={2} />
        Auf Bestätigung
      </span>
    );
  }
  if (status === "done") {
    return (
      <span className={`inline-flex items-center gap-1 rounded font-medium bg-emerald-100 text-emerald-900 ${cls}`}>
        <Check className={iconCls} strokeWidth={2} />
        Erledigt
      </span>
    );
  }
  return (
    <span className={`inline-flex items-center gap-1 rounded font-medium bg-surface-sunken text-text-secondary ${cls}`}>
      <AlertCircle className={iconCls} strokeWidth={2} />
      Offen
    </span>
  );
}
```

### Datei: `components/my-tasks/tabs-nav.tsx`

```typescript
"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

interface Tab {
  id: "open" | "pending" | "done";
  label: string;
  count: number;
}

interface TabsNavProps {
  tabs: Tab[];
  activeTab: string;
}

export function TabsNav({ tabs, activeTab }: TabsNavProps) {
  return (
    <nav className="border-b border-border flex gap-1 mb-8">
      {tabs.map((tab) => {
        const active = tab.id === activeTab;
        return (
          <Link
            key={tab.id}
            href={`/my-tasks?tab=${tab.id}`}
            className={`px-4 py-3 text-sm border-b-2 -mb-px transition-colors ${
              active
                ? "border-ink text-ink font-medium"
                : "border-transparent text-text-tertiary hover:text-text-primary"
            }`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className={`ml-2 min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-medium inline-flex items-center justify-center ${
                active ? "bg-ink text-cream" : "bg-surface-sunken text-text-secondary"
              }`}>
                {tab.count > 99 ? "99+" : tab.count}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
```

### Datei: `components/my-tasks/comment-thread.tsx`

```typescript
import type { TaskComment } from "@/lib/queries/task-detail";

interface CommentThreadProps {
  comments: TaskComment[];
  currentUserId: string;
}

export function CommentThread({ comments, currentUserId }: CommentThreadProps) {
  if (comments.length === 0) {
    return (
      <p className="text-sm text-text-tertiary italic">Noch keine Kommentare.</p>
    );
  }

  return (
    <div className="space-y-5">
      {comments.map((c) => {
        const isCurrent = c.author_id === currentUserId;
        const initial = (c.author_email || "?")[0].toUpperCase();

        if (c.is_system) {
          return (
            <div key={c.id} className="flex items-start gap-3 py-2 px-3 bg-warning/10 border border-warning/20 rounded">
              <div className="text-xs text-text-secondary italic">
                {c.content}
                <span className="ml-2 text-text-tertiary">
                  · {new Date(c.created_at).toLocaleDateString("de-DE", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            </div>
          );
        }

        return (
          <div key={c.id} className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-surface-sunken flex items-center justify-center text-xs font-medium flex-shrink-0">
              {initial}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-sm font-medium">{c.author_email || "Unbekannt"} {isCurrent && "(Sie)"}</span>
                <span className="text-xs text-text-tertiary">
                  {new Date(c.created_at).toLocaleDateString("de-DE", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
              <p className="text-sm text-text-primary whitespace-pre-wrap leading-relaxed">{c.content}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
```

### Datei: `components/my-tasks/comment-form.tsx`

```typescript
"use client";

import { useState, useTransition } from "react";
import { Send, Loader2 } from "lucide-react";
import { addTaskComment } from "@/app/(protected)/my-tasks/actions";
import { useRouter } from "next/navigation";

interface CommentFormProps {
  taskId: string;
}

export function CommentForm({ taskId }: CommentFormProps) {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = () => {
    setError(null);
    startTransition(async () => {
      const result = await addTaskComment(taskId, content);
      if (result.error) {
        setError(result.error);
      } else {
        setContent("");
        router.refresh();
      }
    });
  };

  return (
    <div className="space-y-2">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Kommentar hinzufügen…"
        rows={3}
        maxLength={2000}
        className="w-full px-3 py-2 bg-surface-card border border-border rounded text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand/40"
      />
      <div className="flex items-center justify-between">
        <span className="text-xs text-text-tertiary">{content.length}/2000</span>
        <button
          onClick={handleSubmit}
          disabled={isPending || !content.trim()}
          className="inline-flex items-center gap-2 px-4 py-2 bg-ink text-cream rounded text-sm hover:bg-ink/90 disabled:opacity-50"
        >
          {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          Senden
        </button>
      </div>
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}
```

### Datei: `components/my-tasks/task-actions.tsx`

```typescript
"use client";

import { useState, useTransition } from "react";
import { Check, X, Loader2 } from "lucide-react";
import { submitTaskForReview, approveTask, rejectTask } from "@/app/(protected)/my-tasks/actions";
import { useRouter } from "next/navigation";

interface TaskActionsProps {
  taskId: string;
  status: "open" | "pending_review" | "done";
  isDoctor: boolean;
  isMyTask: boolean; // Empfänger dieser Task oder Doctor der sie erstellt hat
}

export function TaskActions({ taskId, status, isDoctor, isMyTask }: TaskActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [rejectReason, setRejectReason] = useState("");
  const [showReject, setShowReject] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (status === "done") return null;

  // Team oder Doctor als Empfänger: darf Erledigt melden
  const canSubmit = status === "open" && isMyTask;
  // Doctor darf bestätigen/ablehnen
  const canReview = status === "pending_review" && isDoctor;

  const handleSubmit = () => {
    setError(null);
    startTransition(async () => {
      const result = await submitTaskForReview(taskId);
      if (result.error) setError(result.error);
      else router.refresh();
    });
  };

  const handleApprove = () => {
    setError(null);
    startTransition(async () => {
      const result = await approveTask(taskId);
      if (result.error) setError(result.error);
      else router.refresh();
    });
  };

  const handleReject = () => {
    if (!rejectReason.trim()) {
      setError("Begründung ist erforderlich.");
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await rejectTask(taskId, rejectReason);
      if (result.error) setError(result.error);
      else {
        setRejectReason("");
        setShowReject(false);
        router.refresh();
      }
    });
  };

  return (
    <div className="space-y-3">
      {canSubmit && (
        <button
          onClick={handleSubmit}
          disabled={isPending}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-ink text-cream rounded text-sm hover:bg-ink/90 disabled:opacity-50"
        >
          {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
          Erledigt melden
        </button>
      )}

      {canReview && !showReject && (
        <div className="flex gap-2">
          <button
            onClick={handleApprove}
            disabled={isPending}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand text-white rounded text-sm hover:bg-brand/90 disabled:opacity-50"
          >
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            Bestätigen
          </button>
          <button
            onClick={() => setShowReject(true)}
            disabled={isPending}
            className="inline-flex items-center gap-2 px-5 py-2.5 border border-border text-text-secondary rounded text-sm hover:text-danger hover:border-danger disabled:opacity-50"
          >
            <X className="w-4 h-4" />
            Zurückweisen
          </button>
        </div>
      )}

      {canReview && showReject && (
        <div className="p-4 bg-surface-sunken border border-border rounded space-y-3">
          <div className="text-sm font-medium">Aufgabe zurückweisen</div>
          <textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Begründung: warum ist die Aufgabe nicht erledigt?"
            rows={3}
            maxLength={500}
            className="w-full px-3 py-2 bg-paper border border-border rounded text-sm resize-none focus:outline-none focus:ring-2 focus:ring-danger/30"
          />
          <div className="flex gap-2">
            <button
              onClick={handleReject}
              disabled={isPending || !rejectReason.trim()}
              className="inline-flex items-center gap-2 px-4 py-2 bg-danger text-white rounded text-sm hover:bg-danger/90 disabled:opacity-50"
            >
              Zurückweisen bestätigen
            </button>
            <button
              onClick={() => { setShowReject(false); setRejectReason(""); }}
              className="px-4 py-2 text-sm text-text-secondary hover:text-text-primary"
            >
              Abbrechen
            </button>
          </div>
        </div>
      )}

      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}
```

---

## Schritt 8 — Task-Detail-Seite

### Datei: `components/my-tasks/task-detail.tsx`

```typescript
import Link from "next/link";
import { ArrowLeft, Calendar, User, FileText, Clock } from "lucide-react";
import type { TaskDetail, TaskComment } from "@/lib/queries/task-detail";
import { TaskStatusBadge } from "./task-status-badge";
import { TaskActions } from "./task-actions";
import { CommentThread } from "./comment-thread";
import { CommentForm } from "./comment-form";

interface TaskDetailViewProps {
  task: TaskDetail;
  comments: TaskComment[];
  currentUserId: string;
  isDoctor: boolean;
  isMyTask: boolean;
}

export function TaskDetailView({ task, comments, currentUserId, isDoctor, isMyTask }: TaskDetailViewProps) {
  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <Link href="/my-tasks" className="inline-flex items-center gap-1 text-xs text-text-tertiary hover:text-text-primary mb-8">
        <ArrowLeft className="w-3 h-3" strokeWidth={1.75} />
        Zu meinen Aufgaben
      </Link>

      <div className="mb-8">
        <div className="flex items-start justify-between gap-4 mb-3">
          <h1 className="font-serif text-3xl font-light tracking-tight leading-tight flex-1">{task.content}</h1>
          <TaskStatusBadge status={task.status} size="md" />
        </div>

        {task.description && (
          <p className="text-text-secondary whitespace-pre-wrap leading-relaxed mb-4">{task.description}</p>
        )}

        <div className="flex flex-wrap gap-4 text-xs text-text-tertiary border-t border-border pt-4">
          <div className="flex items-center gap-1.5">
            <User className="w-3 h-3" strokeWidth={1.75} />
            Zugewiesen von {task.created_by_email || "Unbekannt"}
          </div>
          {task.recipient_type === "specific_person" && task.specific_recipient_email && (
            <div>An {task.specific_recipient_email}</div>
          )}
          {task.recipient_type === "all_team" && <div>An gesamtes Team</div>}
          <Link href={`/inbox/${task.submission_id}`} className="flex items-center gap-1.5 hover:text-text-primary">
            <FileText className="w-3 h-3" strokeWidth={1.75} />
            Patient: {task.submission_patient_name || "—"}
          </Link>
          {task.due_date && (
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3 h-3" strokeWidth={1.75} />
              Fällig: {new Date(task.due_date).toLocaleDateString("de-DE")}
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <Clock className="w-3 h-3" strokeWidth={1.75} />
            Erstellt {new Date(task.created_at).toLocaleDateString("de-DE", { day: "numeric", month: "short", year: "numeric" })}
          </div>
        </div>
      </div>

      {task.status !== "done" && (
        <div className="mb-10 p-5 bg-surface-card border border-border rounded-lg">
          <TaskActions
            taskId={task.id}
            status={task.status}
            isDoctor={isDoctor}
            isMyTask={isMyTask}
          />
        </div>
      )}

      <section className="space-y-6">
        <h2 className="text-xs uppercase tracking-[0.2em] text-text-tertiary font-mono">Kommentare · {comments.length}</h2>
        <CommentThread comments={comments} currentUserId={currentUserId} />
        <div className="pt-4 border-t border-border">
          <CommentForm taskId={task.id} />
        </div>
      </section>
    </div>
  );
}
```

### Datei: `app/(protected)/my-tasks/[id]/page.tsx`

```typescript
import { notFound, redirect } from "next/navigation";
import { getCurrentWorkspace } from "@/lib/auth-helpers";
import { createClient } from "@/lib/supabase/server";
import { getTaskWithComments } from "@/lib/queries/task-detail";
import { TaskDetailView } from "@/components/my-tasks/task-detail";

interface TaskDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function TaskDetailPage({ params }: TaskDetailPageProps) {
  const { id } = await params;
  const workspace = await getCurrentWorkspace();
  if (!workspace) redirect("/login");

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { task, comments } = await getTaskWithComments(id, workspace.workspace_id);
  if (!task) notFound();

  const isDoctor = workspace.role === "doctor";
  const isMyTask =
    task.recipient_type === "all_team" ||
    (task.recipient_type === "specific_person" && task.specific_recipient_id === user.id) ||
    (isDoctor && task.created_by_user_id === user.id);

  return (
    <TaskDetailView
      task={task}
      comments={comments}
      currentUserId={user.id}
      isDoctor={isDoctor}
      isMyTask={isMyTask}
    />
  );
}
```

---

## Schritt 9 — My-Tasks-Seite mit Tabs

### Update: `app/(protected)/my-tasks/page.tsx`

```typescript
import { redirect } from "next/navigation";
import { getCurrentWorkspace } from "@/lib/auth-helpers";
import { createClient } from "@/lib/supabase/server";
import { getMyTasks } from "@/lib/queries/my-tasks";
import { getMyTaskCounts } from "@/lib/queries/task-counts";
import { TaskList } from "@/components/my-tasks/task-list";
import { TabsNav } from "@/components/my-tasks/tabs-nav";

interface MyTasksPageProps {
  searchParams: Promise<{ tab?: string }>;
}

export default async function MyTasksPage({ searchParams }: MyTasksPageProps) {
  const { tab } = await searchParams;
  const workspace = await getCurrentWorkspace();
  if (!workspace) redirect("/login");

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const isDoctor = workspace.role === "doctor";

  const activeTab: "open" | "pending" | "done" = tab === "pending" ? "pending" : tab === "done" ? "done" : "open";
  const statusMap = { open: "open" as const, pending: "pending_review" as const, done: "done" as const };

  const [tasks, counts] = await Promise.all([
    getMyTasks(user.id, workspace.workspace_id, isDoctor, statusMap[activeTab]),
    getMyTaskCounts(user.id, workspace.workspace_id, isDoctor),
  ]);

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <div className="mb-8">
        <p className="text-xs font-mono uppercase tracking-wider text-text-tertiary mb-3">Meine Aufgaben</p>
        <h1 className="font-serif text-5xl font-light tracking-tight">Zu erledigen</h1>
      </div>

      <TabsNav
        tabs={[
          { id: "open", label: "Offen", count: counts.open },
          { id: "pending", label: "Auf Bestätigung", count: counts.pending },
          { id: "done", label: "Erledigt", count: counts.done },
        ]}
        activeTab={activeTab}
      />

      <TaskList tasks={tasks} status={activeTab} />
    </div>
  );
}
```

### Update: `components/my-tasks/task-list.tsx`

Erweiterung: Status-Badge in der Liste anzeigen, Klick führt zur Detail-Seite.

```typescript
import Link from "next/link";
import { Check } from "lucide-react";
import { groupTasksByUrgency } from "@/lib/task-grouping";
import { TaskStatusBadge } from "./task-status-badge";
import type { MyTask } from "@/lib/queries/my-tasks";

interface TaskListProps {
  tasks: MyTask[];
  status: "open" | "pending" | "done";
}

export function TaskList({ tasks, status }: TaskListProps) {
  if (tasks.length === 0) {
    const messages = {
      open: { title: "Keine offenen Aufgaben", text: "Alles erledigt für jetzt." },
      pending: { title: "Keine zu bestätigenden Aufgaben", text: "Keine Aufgaben warten auf Bestätigung." },
      done: { title: "Keine erledigten Aufgaben", text: "In den letzten 90 Tagen wurde noch nichts abgeschlossen." },
    };
    const m = messages[status];
    return (
      <div className="border border-border rounded-lg p-12 text-center bg-surface-card">
        <Check className="w-10 h-10 text-brand mx-auto mb-4" strokeWidth={1.5} />
        <h2 className="font-serif text-2xl font-light mb-2">{m.title}</h2>
        <p className="text-text-secondary text-sm">{m.text}</p>
      </div>
    );
  }

  // Für "open" gruppieren nach Urgency, sonst flache Liste
  if (status === "open") {
    const groups = groupTasksByUrgency(tasks);
    return (
      <div className="space-y-10">
        {groups.map((group) => (
          <section key={group.urgency}>
            <h2 className={`text-[10px] font-mono uppercase tracking-[0.2em] mb-3 ${group.urgency === "overdue" ? "text-danger" : "text-text-tertiary"}`}>
              {group.label} · {group.tasks.length}
            </h2>
            <div className="border-t border-border">
              {group.tasks.map((task) => (
                <TaskRow key={task.id} task={task} />
              ))}
            </div>
          </section>
        ))}
      </div>
    );
  }

  return (
    <div className="border-t border-border">
      {tasks.map((task) => (
        <TaskRow key={task.id} task={task} />
      ))}
    </div>
  );
}

function TaskRow({ task }: { task: MyTask }) {
  return (
    <Link
      href={`/my-tasks/${task.id}`}
      className="flex items-center justify-between gap-4 py-4 border-b border-border hover:bg-surface-card transition-colors -mx-2 px-2 rounded"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-1">
          <h3 className="font-medium text-sm truncate">{task.title}</h3>
          {task.status !== "open" && <TaskStatusBadge status={task.status} />}
        </div>
        <div className="text-xs text-text-tertiary">
          Patient: {task.submission_patient_name || "—"}
          {task.due_date && ` · Fällig ${new Date(task.due_date).toLocaleDateString("de-DE")}`}
        </div>
      </div>
    </Link>
  );
}
```

---

## Schritt 10 — Build + Commit

```bash
npm run build
```

Muss grün sein.

```bash
git add .
git commit -m "feat: phase 11b — task workflow with approval, comments, email notifications"
```

---

## Schritt 11 — STOP (MENSCHLICHE SCHRITTE)

Melde dem Menschen:

"Phase 11b ist fertig. Du musst **Migration 018** in Supabase ausführen und dann testen.

### 1. Migration 018

Inhalt von `supabase/migrations/018_task_workflow.sql` im SQL Editor ausführen. Danach:

```sql
NOTIFY pgrst, 'reload schema';
```

### 2. Tests

1. **Doctor erstellt Task** → E-Mail kommt bei Empfänger an ("Neue Aufgabe")
2. **Team klickt 'Erledigt melden'** → Task bekommt Label "Auf Bestätigung wartend", Doctor bekommt E-Mail
3. **Doctor öffnet Task-Detail, klickt 'Bestätigen'** → Task geht auf 'Erledigt', Team bekommt E-Mail
4. **Doctor klickt 'Zurückweisen'** mit Begründung → Task zurück auf 'Offen', System-Kommentar erscheint, Team bekommt E-Mail mit Begründung
5. **Beide schreiben Kommentare** → jeweils andere Seite bekommt E-Mail
6. **Tabs auf /my-tasks** zeigen korrekte Counter
7. **Erledigt-Tab** zeigt nur letzte 90 Tage
8. **Doctor-Self-Assignment**: Doctor erstellt Task an sich selbst, klickt 'Erledigt melden' → geht direkt auf 'Erledigt' ohne Zwischenschritt"

---

## Bekannte Probleme

**`content` vs. `title`:** Die tasks-Tabelle nutzt `content` als Titel-Spalte, nicht `title`. Alle Queries und Types sind darauf abgestimmt.

**Mail-Loop-Gefahr:** Wenn Doctor und Team hin und her kommentieren, entstehen viele Mails. Aktuell keine Throttling-Logik. Für MVP okay.

**Rejection-Reason bei Re-Submit:** Wenn Doctor zurückweist und Team nochmal einreicht, wird `rejection_reason` überschrieben. Altes Reject-Event ist nur noch im System-Kommentar sichtbar.

**`countOpenInboxItems` fehlt weiterhin:** Wurde in Phase 11 als TODO markiert, hier nicht nachgeholt. Kann in Phase 12/13 kommen.

**90-Tage-Filter ist hart:** Kein "Mehr laden"-Button für ältere Tasks. Wer historisch recherchieren muss, braucht SQL-Access. Für MVP akzeptabel.

---

*Ende Phase 11b*

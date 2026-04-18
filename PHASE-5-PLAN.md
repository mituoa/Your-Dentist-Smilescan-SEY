# PHASE 5 — Dashboard mit 3 Info-Blöcken

> **Für Cursor Agent:** Arbeite diesen Plan autonom ab. Wir bauen die erste funktionale Seite mit echten Supabase-Daten. Defensive Programmierung: jeder DB-Call braucht Error-Handling, jedes undefined/null wird abgefangen.

> **Für den Menschen:** Diese Phase macht das Dashboard lebendig. Am Ende siehst du Zahlen aus deiner Datenbank, deine offenen Tasks, und aktuelle Events. Du kannst Tasks direkt abhaken.

---

## Was gebaut wird

| Datei | Zweck |
|---|---|
| `app/(protected)/dashboard/page.tsx` | UPDATE — das echte Dashboard |
| `components/dashboard/greeting.tsx` | Willkommens-Header mit Name + Datum |
| `components/dashboard/stat-block.tsx` | Wiederverwendbarer Block mit Titel + Content |
| `components/dashboard/new-submissions-block.tsx` | Block 1 — Zahl + Link |
| `components/dashboard/open-tasks-block.tsx` | Block 2 — Task-Liste mit Checkboxen |
| `components/dashboard/recent-activity-block.tsx` | Block 3 — Aktivitäts-Feed |
| `lib/queries/dashboard.ts` | Alle Supabase-Queries für das Dashboard |
| `lib/queries/tasks.ts` | Task-Actions (done togglen) |
| `supabase/migrations/008_seed_test_data.sql` | Test-Daten (nur Dev) |

---

## Schritt 1 — Query-Helper für Dashboard

### Datei: `lib/queries/dashboard.ts`

```typescript
import { createClient } from "@/lib/supabase/server";

export async function getNewSubmissionsCount(workspaceId: string) {
  const supabase = await createClient();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  const { count, error } = await supabase
    .from("submissions")
    .select("*", { count: "exact", head: true })
    .eq("workspace_id", workspaceId)
    .gte("created_at", yesterday.toISOString());

  if (error) {
    console.error("[dashboard] new submissions count failed:", error);
    return 0;
  }

  return count || 0;
}

export async function getTotalUnseenSubmissions(workspaceId: string) {
  const supabase = await createClient();

  const { count, error } = await supabase
    .from("submissions")
    .select("*", { count: "exact", head: true })
    .eq("workspace_id", workspaceId)
    .is("seen_at", null);

  if (error) {
    console.error("[dashboard] unseen count failed:", error);
    return 0;
  }

  return count || 0;
}

export async function getOpenTasks(workspaceId: string, userId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("tasks")
    .select("id, content, submission_id, created_at, created_by, recipient_type, specific_recipient_id")
    .eq("workspace_id", workspaceId)
    .is("done_at", null)
    .order("created_at", { ascending: false })
    .limit(10);

  if (error) {
    console.error("[dashboard] tasks failed:", error);
    return [];
  }

  return data || [];
}

export async function getRecentActivity(workspaceId: string) {
  const supabase = await createClient();

  // Parallel: letzte submissions + letzte tasks + letzte done-tasks
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
      .select("id, content, done_at, submission_id")
      .eq("workspace_id", workspaceId)
      .not("done_at", "is", null)
      .order("done_at", { ascending: false })
      .limit(3),
  ]);

  type ActivityEvent = {
    type: "submission_received" | "task_created" | "task_done";
    id: string;
    text: string;
    timestamp: string;
    link?: string;
  };

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
      link: t.submission_id ? `/inbox/${t.submission_id}` : undefined,
    });
  });

  (doneTasksRes.data || []).forEach((t) => {
    if (t.done_at) {
      events.push({
        type: "task_done",
        id: `done-${t.id}`,
        text: `Aufgabe erledigt: ${t.content.substring(0, 60)}${t.content.length > 60 ? "…" : ""}`,
        timestamp: t.done_at,
        link: t.submission_id ? `/inbox/${t.submission_id}` : undefined,
      });
    }
  });

  // Sortieren nach Timestamp, nur die 4 neuesten
  events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  return events.slice(0, 4);
}
```

---

## Schritt 2 — Task-Actions (Server Action zum Abhaken)

### Datei: `lib/queries/tasks.ts`

```typescript
"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function toggleTaskDone(taskId: string, done: boolean) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Nicht angemeldet" };
  }

  const update = done
    ? { done_at: new Date().toISOString(), done_by: user.id }
    : { done_at: null, done_by: null };

  const { error } = await supabase
    .from("tasks")
    .update(update)
    .eq("id", taskId);

  if (error) {
    console.error("[tasks] toggle failed:", error);
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  revalidatePath("/my-tasks");
  return { success: true };
}
```

---

## Schritt 3 — Greeting-Komponente

### Datei: `components/dashboard/greeting.tsx`

```typescript
interface GreetingProps {
  name: string;
}

export function Greeting({ name }: GreetingProps) {
  const now = new Date();
  const hour = now.getHours();

  let timeGreeting = "Guten Tag";
  if (hour < 11) timeGreeting = "Guten Morgen";
  else if (hour >= 18) timeGreeting = "Guten Abend";

  const formattedDate = now.toLocaleDateString("de-DE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="mb-12">
      <p className="text-xs font-mono uppercase tracking-wider text-text-tertiary mb-3">
        {formattedDate}
      </p>
      <h1 className="font-serif text-5xl font-light tracking-tight text-text-primary">
        {timeGreeting}, {name}.
      </h1>
    </div>
  );
}
```

---

## Schritt 4 — Stat-Block Wrapper

### Datei: `components/dashboard/stat-block.tsx`

```typescript
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface StatBlockProps {
  label: string;
  children: React.ReactNode;
  link?: {
    href: string;
    text: string;
  };
}

export function StatBlock({ label, children, link }: StatBlockProps) {
  return (
    <div className="bg-surface-card border border-border rounded-lg p-6 flex flex-col min-h-[200px]">
      <div className="text-xs font-mono uppercase tracking-wider text-text-tertiary mb-4">
        {label}
      </div>
      <div className="flex-1">{children}</div>
      {link && (
        <Link
          href={link.href}
          className="inline-flex items-center gap-1.5 text-sm text-brand hover:text-brand-glow transition-colors mt-4"
        >
          {link.text}
          <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.75} />
        </Link>
      )}
    </div>
  );
}
```

---

## Schritt 5 — Block 1: Neue Einsendungen

### Datei: `components/dashboard/new-submissions-block.tsx`

```typescript
import { StatBlock } from "./stat-block";

interface NewSubmissionsBlockProps {
  newCount: number;
  totalUnseen: number;
}

export function NewSubmissionsBlock({
  newCount,
  totalUnseen,
}: NewSubmissionsBlockProps) {
  return (
    <StatBlock
      label="Neue Einsendungen"
      link={{ href: "/inbox", text: "Zur Inbox" }}
    >
      <div className="font-serif text-6xl font-light text-text-primary leading-none">
        {newCount}
      </div>
      <p className="text-sm text-text-secondary mt-3">
        {newCount === 0
          ? "Keine neuen seit gestern."
          : newCount === 1
          ? "neue Einsendung seit gestern."
          : "neue Einsendungen seit gestern."}
      </p>
      {totalUnseen > 0 && totalUnseen !== newCount && (
        <p className="text-xs text-text-tertiary mt-2">
          {totalUnseen} insgesamt ungesehen
        </p>
      )}
    </StatBlock>
  );
}
```

---

## Schritt 6 — Block 2: Offene Tasks

### Datei: `components/dashboard/open-tasks-block.tsx`

```typescript
"use client";

import { useState, useTransition } from "react";
import { StatBlock } from "./stat-block";
import { toggleTaskDone } from "@/lib/queries/tasks";
import { cn } from "@/lib/utils";

interface Task {
  id: string;
  content: string;
  submission_id: string | null;
  created_at: string;
}

interface OpenTasksBlockProps {
  tasks: Task[];
  canCheckOff: boolean;
}

export function OpenTasksBlock({ tasks, canCheckOff }: OpenTasksBlockProps) {
  const [optimisticDone, setOptimisticDone] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();

  const handleToggle = (taskId: string) => {
    if (!canCheckOff) return;

    setOptimisticDone((prev) => new Set(prev).add(taskId));

    startTransition(async () => {
      const result = await toggleTaskDone(taskId, true);
      if (result.error) {
        // Rollback bei Fehler
        setOptimisticDone((prev) => {
          const next = new Set(prev);
          next.delete(taskId);
          return next;
        });
      }
    });
  };

  const visibleTasks = tasks.filter((t) => !optimisticDone.has(t.id)).slice(0, 5);

  return (
    <StatBlock
      label="Offene Aufgaben"
      link={
        tasks.length > 5
          ? { href: "/inbox", text: "Alle sehen" }
          : undefined
      }
    >
      {visibleTasks.length === 0 ? (
        <div className="flex items-center h-full">
          <p className="text-sm text-text-tertiary">
            {tasks.length === 0
              ? "Keine offenen Aufgaben."
              : "Alle Aufgaben erledigt."}
          </p>
        </div>
      ) : (
        <ul className="space-y-2.5">
          {visibleTasks.map((task) => (
            <li key={task.id} className="flex items-start gap-2.5 group">
              <button
                onClick={() => handleToggle(task.id)}
                disabled={!canCheckOff || isPending}
                className={cn(
                  "mt-0.5 w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors",
                  canCheckOff
                    ? "border-border hover:border-brand cursor-pointer"
                    : "border-border/50 cursor-not-allowed"
                )}
                aria-label="Aufgabe abhaken"
              >
                {optimisticDone.has(task.id) && (
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 10 10"
                    className="text-brand"
                  >
                    <path
                      d="M1 5L4 8L9 2"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      fill="none"
                    />
                  </svg>
                )}
              </button>
              <span
                className={cn(
                  "text-sm text-text-primary leading-snug",
                  optimisticDone.has(task.id) && "line-through text-text-tertiary"
                )}
              >
                {task.content}
              </span>
            </li>
          ))}
        </ul>
      )}
    </StatBlock>
  );
}
```

---

## Schritt 7 — Block 3: Letzte Aktivität

### Datei: `components/dashboard/recent-activity-block.tsx`

```typescript
import Link from "next/link";
import { StatBlock } from "./stat-block";

interface ActivityEvent {
  type: "submission_received" | "task_created" | "task_done";
  id: string;
  text: string;
  timestamp: string;
  link?: string;
}

interface RecentActivityBlockProps {
  events: ActivityEvent[];
}

function formatRelativeTime(timestamp: string): string {
  const now = new Date();
  const then = new Date(timestamp);
  const diffMs = now.getTime() - then.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMin < 1) return "gerade eben";
  if (diffMin < 60) return `vor ${diffMin} Min`;
  if (diffHours < 24) return `vor ${diffHours} Std`;
  if (diffDays === 1) return "gestern";
  if (diffDays < 7) return `vor ${diffDays} Tagen`;
  return then.toLocaleDateString("de-DE", { day: "numeric", month: "short" });
}

const TYPE_COLORS: Record<ActivityEvent["type"], string> = {
  submission_received: "bg-brand",
  task_created: "bg-text-tertiary",
  task_done: "bg-text-tertiary/50",
};

export function RecentActivityBlock({ events }: RecentActivityBlockProps) {
  return (
    <StatBlock label="Letzte Aktivität">
      {events.length === 0 ? (
        <div className="flex items-center h-full">
          <p className="text-sm text-text-tertiary">Noch keine Aktivität.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {events.map((event) => {
            const content = (
              <>
                <span
                  className={`w-1.5 h-1.5 rounded-full mt-2 shrink-0 ${TYPE_COLORS[event.type]}`}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-text-primary leading-snug truncate">
                    {event.text}
                  </p>
                  <p className="text-xs text-text-tertiary mt-0.5">
                    {formatRelativeTime(event.timestamp)}
                  </p>
                </div>
              </>
            );

            return (
              <li key={event.id} className="flex items-start gap-2.5">
                {event.link ? (
                  <Link
                    href={event.link}
                    className="flex items-start gap-2.5 w-full hover:bg-surface-sunken/50 -mx-2 px-2 py-1 rounded transition-colors"
                  >
                    {content}
                  </Link>
                ) : (
                  content
                )}
              </li>
            );
          })}
        </ul>
      )}
    </StatBlock>
  );
}
```

---

## Schritt 8 — Das eigentliche Dashboard

### Datei: `app/(protected)/dashboard/page.tsx` (komplett ersetzen)

```typescript
import { getCurrentUser, getCurrentWorkspace } from "@/lib/auth-helpers";
import { Greeting } from "@/components/dashboard/greeting";
import { NewSubmissionsBlock } from "@/components/dashboard/new-submissions-block";
import { OpenTasksBlock } from "@/components/dashboard/open-tasks-block";
import { RecentActivityBlock } from "@/components/dashboard/recent-activity-block";
import { createClient } from "@/lib/supabase/server";
import {
  getNewSubmissionsCount,
  getTotalUnseenSubmissions,
  getOpenTasks,
  getRecentActivity,
} from "@/lib/queries/dashboard";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  const workspace = await getCurrentWorkspace();

  if (!user || !workspace) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-12">
        <p className="text-text-secondary">Workspace wird geladen…</p>
      </div>
    );
  }

  const workspaceId = workspace.workspace_id;
  const role = workspace.role;
  const isDoctor = role === "doctor";

  // Display-Name aus profile_data holen
  const supabase = await createClient();
  const { data: profileData } = await supabase
    .from("profile_data")
    .select("display_name")
    .eq("workspace_id", workspaceId)
    .single();

  const displayName = profileData?.display_name || user.email?.split("@")[0] || "";

  // Alle Dashboard-Daten parallel laden
  const [newCount, totalUnseen, tasks, activity] = await Promise.all([
    getNewSubmissionsCount(workspaceId),
    getTotalUnseenSubmissions(workspaceId),
    getOpenTasks(workspaceId, user.id),
    getRecentActivity(workspaceId),
  ]);

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <Greeting name={displayName} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <NewSubmissionsBlock newCount={newCount} totalUnseen={totalUnseen} />
        <OpenTasksBlock tasks={tasks} canCheckOff={isDoctor} />
        <RecentActivityBlock events={activity} />
      </div>
    </div>
  );
}
```

---

## Schritt 9 — Test-Daten-Migration

### Datei: `supabase/migrations/008_seed_test_data.sql`

```sql
-- ============================================================================
-- 008_seed_test_data.sql
-- DEV ONLY: Test-Daten für das Dashboard
-- In Produktion: NICHT ausführen. Löscht bestehende Submissions/Tasks nicht.
-- ============================================================================

DO $$
DECLARE
  v_workspace_id uuid;
  v_user_id uuid;
  v_submission_1 uuid;
  v_submission_2 uuid;
  v_submission_3 uuid;
BEGIN
  -- Ersten Workspace und seinen Doctor nehmen
  SELECT w.id, wm.user_id
  INTO v_workspace_id, v_user_id
  FROM workspaces w
  JOIN workspace_members wm ON wm.workspace_id = w.id
  WHERE wm.role = 'doctor'
  ORDER BY w.created_at ASC
  LIMIT 1;

  IF v_workspace_id IS NULL THEN
    RAISE NOTICE 'Kein Workspace mit Doctor gefunden. Bitte erst registrieren.';
    RETURN;
  END IF;

  -- 3 Beispiel-Submissions einfügen
  INSERT INTO submissions (workspace_id, patient_name, patient_email, created_at)
  VALUES
    (v_workspace_id, 'Anna M.', 'anna@example.com', now() - interval '2 hours')
  RETURNING id INTO v_submission_1;

  INSERT INTO submissions (workspace_id, patient_name, patient_email, created_at)
  VALUES
    (v_workspace_id, 'Jakob K.', 'jakob@example.com', now() - interval '5 hours')
  RETURNING id INTO v_submission_2;

  INSERT INTO submissions (workspace_id, patient_name, patient_email, created_at)
  VALUES
    (v_workspace_id, 'Marie L.', 'marie@example.com', now() - interval '1 day')
  RETURNING id INTO v_submission_3;

  -- Tasks für die erste Submission
  INSERT INTO tasks (workspace_id, submission_id, content, recipient_type, created_by)
  VALUES
    (v_workspace_id, v_submission_1, 'Patient zum Kontrolltermin einladen', 'doctor_only', v_user_id),
    (v_workspace_id, v_submission_1, 'Röntgen-Aufnahme vom letzten Besuch raussuchen', 'all_team', v_user_id);

  -- Task für die zweite Submission
  INSERT INTO tasks (workspace_id, submission_id, content, recipient_type, created_by)
  VALUES
    (v_workspace_id, v_submission_2, 'Terminlink senden — Patient bevorzugt Vormittage', 'all_team', v_user_id);

  RAISE NOTICE 'Test-Daten eingefügt für Workspace %', v_workspace_id;
END $$;
```

---

## Schritt 10 — Commit

```bash
git add .
git commit -m "feat: phase 5 — dashboard with 3 functional blocks"
```

---

## Schritt 11 — STOP und Übergabe

Melde dem Menschen:

"Phase 5 — Dashboard ist im Code. Du musst noch zwei Dinge manuell tun:

**1. Test-Daten-Migration in Supabase ausführen:**
Öffne Supabase SQL Editor → New Query → Inhalt von `supabase/migrations/008_seed_test_data.sql` einfügen → Run.

Erwartung: 'Success. No rows returned' oder eine NOTICE-Meldung.

**2. Browser öffnen und testen:**
http://localhost:3000/dashboard

Du solltest sehen:
- Begrüßung mit deinem Namen + heutigem Datum
- Block 1: '3' neue Einsendungen
- Block 2: Liste mit 3 offenen Aufgaben (mit Checkboxen)
- Block 3: 4 Aktivitäts-Einträge

Teste: klick auf eine Checkbox — die Task sollte durchgestrichen werden und aus der Liste verschwinden.

Falls Blöcke leer sind, hat die Test-Daten-Migration nicht geklappt — oder dein Workspace hat keine Doctor-Rolle. Schick Screenshot.

Falls 'Workspace wird geladen…' erscheint, gibt's ein Auth-Problem. Logout und neu einloggen hilft meistens."

---

## Bei Fehlern — typische Ursachen

### "Module not found: @/lib/queries/dashboard"
Die Datei wurde nicht erstellt. In Cursor prüfen ob `lib/queries/dashboard.ts` existiert.

### Test-Daten-Migration sagt "Kein Workspace mit Doctor gefunden"
Du hast dich noch nicht mit dem neuen Account registriert. Erst im Browser auf /register einen Test-Account anlegen, DANN die Migration laufen lassen.

### Dashboard crasht mit RLS-Fehler
Die RLS-Policy für `submissions` lässt nur eigene Workspace-Daten lesen. Falls Crash: in Supabase SQL Editor prüfen ob `workspace_members` deinen User korrekt als Member hat.

### Checkbox klickt, aber nichts passiert
Browser-Console öffnen (F12 → Console). Suche rote Errors. Meistens: "toggleTaskDone failed: RLS policy".
Fix: nur der Arzt (role=doctor) kann Tasks abhaken. Wenn du als Team-Role eingeloggt bist, ist das richtig so.

---

*Ende Phase 5*

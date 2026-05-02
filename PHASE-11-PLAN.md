# PHASE 11 — My Tasks (Team-View)

> **Für Cursor Agent:** Diese Phase erweitert den bestehenden Task-Code aus Phase 6 um eine eigene Seite für Team-Mitglieder und führt Role-Based Access Control ein. Kleinste Phase seit langem. ~30-40 Min.

> **Für den Menschen:** Nach Phase 11 können Team-Mitglieder ihre eigenen Aufgaben auf einer dedizierten Seite sehen, ohne Zugriff auf Settings, Journal, Branding etc. zu haben.

---

## Design-Entscheidungen (bereits getroffen)

### Rollen-Matrix

| Bereich | Doctor | Team |
|---|---|---|
| Dashboard | ✅ | ❌ (redirected zu /my-tasks) |
| Inbox-Liste | ✅ | ✅ |
| Inbox-Detail (Fotos, Notizen) | ✅ | ✅ |
| Task abhaken | ✅ | ✅ |
| Task erstellen | ✅ | ✅ (kann sich selbst Notizen anlegen) |
| **Terminlink senden** | ✅ | ❌ (ausgegraut mit Tooltip) |
| **My Tasks** | ✅ | ✅ |
| Profil-Editor | ✅ | ❌ (Nav-Eintrag versteckt) |
| Journal | ✅ | ❌ (Nav-Eintrag versteckt) |
| Settings | ✅ | ❌ (Nav-Eintrag versteckt, nur Logout) |

### Sortierung auf /my-tasks

1. Überfällig (rot)
2. Heute fällig
3. Morgen fällig
4. Diese Woche fällig
5. Zukünftige Fälligkeit
6. Ohne Fälligkeit — nach Erstellungsdatum aufsteigend (älteste zuerst, damit nichts vergessen wird)

Industriestandard (Todoist, Things, TickTick, Apple Reminders alle gleich).

### Badge im Sidebar

Kleiner farbiger Kreis neben "My Tasks":
- **Zahl = Anzahl offener Tasks**
- Ab 1 sichtbar, ab 10 zeigt "9+"
- Überfällige werden rot, sonst neutral

---

## Übersicht der Dateien

### Neue Dateien

| Pfad | Zweck |
|---|---|
| `lib/queries/my-tasks.ts` | Queries für eigene Tasks + Count |
| `app/(protected)/my-tasks/page.tsx` | Die neue Seite |
| `components/my-tasks/task-list.tsx` | Liste der Tasks mit Gruppierung |
| `components/my-tasks/task-card.tsx` | Einzelner Task-Eintrag |
| `components/app-shell/nav-badge.tsx` | Wiederverwendbares Badge |

### Geänderte Dateien

| Pfad | Änderung |
|---|---|
| `components/app-shell/sidebar.tsx` | Nav-Items nach Rolle filtern, Badges einbauen |
| `app/(protected)/dashboard/page.tsx` | Team-Rolle redirect zu /my-tasks |
| `components/inbox/submission-detail.tsx` (o.ä.) | Terminlink-Button für Team disablen |
| `lib/auth-helpers.ts` | Falls nötig — role check helper |

### Keine neuen Migrationen

Tabelle `tasks` existiert schon aus Phase 6, inkl. `assigned_to_user_id` und `due_date`.
Keine DB-Änderungen nötig.

---

## Schritt 1 — Task-Queries für "My Tasks"

### Datei: `lib/queries/my-tasks.ts`

```typescript
import "server-only";
import { createClient } from "@/lib/supabase/server";

export interface MyTask {
  id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  completed: boolean;
  created_at: string;
  submission_id: string;
  submission_patient_name: string | null;
  submission_created_at: string;
}

export async function getMyOpenTasks(userId: string, workspaceId: string): Promise<MyTask[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("tasks")
    .select(`
      id,
      title,
      description,
      due_date,
      completed,
      created_at,
      submission_id,
      submissions!inner(patient_name, created_at, workspace_id)
    `)
    .eq("assigned_to_user_id", userId)
    .eq("completed", false)
    .eq("submissions.workspace_id", workspaceId)
    .order("due_date", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: true });

  if (error) {
    console.error("[getMyOpenTasks]", error);
    return [];
  }

  return (data || []).map((t: any) => ({
    id: t.id,
    title: t.title,
    description: t.description,
    due_date: t.due_date,
    completed: t.completed,
    created_at: t.created_at,
    submission_id: t.submission_id,
    submission_patient_name: t.submissions?.patient_name || null,
    submission_created_at: t.submissions?.created_at || t.created_at,
  }));
}

export async function countMyOpenTasks(userId: string, workspaceId: string): Promise<{ total: number; overdue: number }> {
  const supabase = await createClient();

  const now = new Date().toISOString();

  const { count: total } = await supabase
    .from("tasks")
    .select("id, submissions!inner(workspace_id)", { count: "exact", head: true })
    .eq("assigned_to_user_id", userId)
    .eq("completed", false)
    .eq("submissions.workspace_id", workspaceId);

  const { count: overdue } = await supabase
    .from("tasks")
    .select("id, submissions!inner(workspace_id)", { count: "exact", head: true })
    .eq("assigned_to_user_id", userId)
    .eq("completed", false)
    .eq("submissions.workspace_id", workspaceId)
    .lt("due_date", now);

  return {
    total: total || 0,
    overdue: overdue || 0,
  };
}
```

---

## Schritt 2 — Task-Gruppierung nach Fälligkeit

### Datei: `lib/task-grouping.ts`

```typescript
import type { MyTask } from "@/lib/queries/my-tasks";

export type TaskGroup = {
  label: string;
  urgency: "overdue" | "today" | "tomorrow" | "week" | "later" | "no-date";
  tasks: MyTask[];
};

export function groupTasksByUrgency(tasks: MyTask[]): TaskGroup[] {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const weekEnd = new Date(today);
  weekEnd.setDate(weekEnd.getDate() + 7);

  const groups: Record<TaskGroup["urgency"], MyTask[]> = {
    overdue: [],
    today: [],
    tomorrow: [],
    week: [],
    later: [],
    "no-date": [],
  };

  for (const t of tasks) {
    if (!t.due_date) {
      groups["no-date"].push(t);
      continue;
    }
    const due = new Date(t.due_date);

    if (due < today) {
      groups.overdue.push(t);
    } else if (due < tomorrow) {
      groups.today.push(t);
    } else if (due < new Date(tomorrow.getTime() + 86400000)) {
      groups.tomorrow.push(t);
    } else if (due < weekEnd) {
      groups.week.push(t);
    } else {
      groups.later.push(t);
    }
  }

  const result: TaskGroup[] = [];
  if (groups.overdue.length) result.push({ label: "Überfällig", urgency: "overdue", tasks: groups.overdue });
  if (groups.today.length) result.push({ label: "Heute", urgency: "today", tasks: groups.today });
  if (groups.tomorrow.length) result.push({ label: "Morgen", urgency: "tomorrow", tasks: groups.tomorrow });
  if (groups.week.length) result.push({ label: "Diese Woche", urgency: "week", tasks: groups.week });
  if (groups.later.length) result.push({ label: "Später", urgency: "later", tasks: groups.later });
  if (groups["no-date"].length) result.push({ label: "Ohne Fälligkeit", urgency: "no-date", tasks: groups["no-date"] });

  return result;
}
```

---

## Schritt 3 — Task-Card-Komponente

### Datei: `components/my-tasks/task-card.tsx`

```typescript
"use client";

import Link from "next/link";
import { useTransition } from "react";
import { Check, Circle, User, Calendar, AlertTriangle } from "lucide-react";
import type { MyTask } from "@/lib/queries/my-tasks";
import { completeTask } from "@/app/(protected)/inbox/actions";
import { useRouter } from "next/navigation";

interface TaskCardProps {
  task: MyTask;
  urgency: "overdue" | "today" | "tomorrow" | "week" | "later" | "no-date";
}

export function TaskCard({ task, urgency }: TaskCardProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleComplete = () => {
    startTransition(async () => {
      await completeTask(task.id);
      router.refresh();
    });
  };

  const formatDueDate = () => {
    if (!task.due_date) return null;
    const d = new Date(task.due_date);
    return d.toLocaleDateString("de-DE", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className={`flex items-start gap-3 py-3 border-b border-border group ${urgency === "overdue" ? "bg-danger/5" : ""}`}>
      <button
        onClick={handleComplete}
        disabled={isPending}
        className="mt-1 w-5 h-5 rounded-full border-2 border-border hover:border-brand flex items-center justify-center transition-colors"
        title="Als erledigt markieren"
      >
        {isPending && <Circle className="w-2 h-2 animate-spin text-brand" />}
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-sm leading-snug">{task.title}</h3>
            {task.description && (
              <p className="text-xs text-text-secondary mt-1 line-clamp-2">{task.description}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 mt-2 text-xs text-text-tertiary">
          <Link
            href={`/inbox/${task.submission_id}`}
            className="flex items-center gap-1 hover:text-text-primary transition-colors"
          >
            <User className="w-3 h-3" strokeWidth={1.75} />
            <span>{task.submission_patient_name || "Patient"}</span>
          </Link>

          {task.due_date && (
            <span className={`flex items-center gap-1 ${urgency === "overdue" ? "text-danger font-medium" : ""}`}>
              {urgency === "overdue" ? <AlertTriangle className="w-3 h-3" /> : <Calendar className="w-3 h-3" />}
              {formatDueDate()}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
```

---

## Schritt 4 — Task-Liste

### Datei: `components/my-tasks/task-list.tsx`

```typescript
import { Check } from "lucide-react";
import { TaskCard } from "./task-card";
import { groupTasksByUrgency } from "@/lib/task-grouping";
import type { MyTask } from "@/lib/queries/my-tasks";

interface TaskListProps {
  tasks: MyTask[];
}

export function TaskList({ tasks }: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <div className="border border-border rounded-lg p-12 text-center bg-surface-card">
        <Check className="w-10 h-10 text-brand mx-auto mb-4" strokeWidth={1.5} />
        <h2 className="font-serif text-2xl font-light mb-2">Alles erledigt</h2>
        <p className="text-text-secondary text-sm">Keine offenen Aufgaben. Zeit für eine Pause.</p>
      </div>
    );
  }

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
              <TaskCard key={task.id} task={task} urgency={group.urgency} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
```

---

## Schritt 5 — My Tasks Seite

### Datei: `app/(protected)/my-tasks/page.tsx`

```typescript
import { redirect } from "next/navigation";
import { getCurrentWorkspace } from "@/lib/auth-helpers";
import { createClient } from "@/lib/supabase/server";
import { getMyOpenTasks } from "@/lib/queries/my-tasks";
import { TaskList } from "@/components/my-tasks/task-list";

export default async function MyTasksPage() {
  const workspace = await getCurrentWorkspace();
  if (!workspace) redirect("/login");

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const tasks = await getMyOpenTasks(user.id, workspace.workspace_id);

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <div className="mb-10">
        <p className="text-xs font-mono uppercase tracking-wider text-text-tertiary mb-3">Meine Aufgaben</p>
        <h1 className="font-serif text-5xl font-light tracking-tight">Zu erledigen</h1>
        <p className="text-text-secondary mt-2">Deine zugewiesenen Aufgaben aus allen Patientenfällen.</p>
      </div>

      <TaskList tasks={tasks} />
    </div>
  );
}
```

---

## Schritt 6 — Badge-Komponente

### Datei: `components/app-shell/nav-badge.tsx`

```typescript
interface NavBadgeProps {
  count: number;
  variant?: "default" | "urgent";
}

export function NavBadge({ count, variant = "default" }: NavBadgeProps) {
  if (count === 0) return null;

  const display = count > 9 ? "9+" : count.toString();

  return (
    <span className={`ml-auto min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-medium flex items-center justify-center ${
      variant === "urgent"
        ? "bg-danger text-white"
        : "bg-surface-sunken text-text-primary"
    }`}>
      {display}
    </span>
  );
}
```

---

## Schritt 7 — Sidebar-Refactor mit Role-Based Navigation

### Update: `components/app-shell/sidebar.tsx`

**Kernlogik:** Navigation wird basierend auf Rolle gefiltert. Außerdem Badges werden nachgeladen (via Server Component, die Count mit passiert).

Struktur wird so aussehen:

```typescript
// sidebar.tsx (vereinfacht)

interface SidebarProps {
  role: "doctor" | "team";
  inboxCount: number;
  myTasksCount: number;
  myTasksOverdueCount: number;
}

export function Sidebar({ role, inboxCount, myTasksCount, myTasksOverdueCount }: SidebarProps) {
  const navItems = [
    // Dashboard nur für Doctor
    role === "doctor" && { href: "/dashboard", label: "Dashboard", icon: Home },
    // Inbox für alle
    { href: "/inbox", label: "Einsendungen", icon: Inbox, badge: inboxCount },
    // My Tasks für alle
    { href: "/my-tasks", label: "Meine Aufgaben", icon: CheckSquare, badge: myTasksCount, urgent: myTasksOverdueCount > 0 },
    // Journal, Profil, Settings nur für Doctor
    role === "doctor" && { href: "/profile/editor", label: "Profil", icon: User },
    role === "doctor" && { href: "/journal", label: "Journal", icon: BookOpen },
    role === "doctor" && { href: "/settings", label: "Einstellungen", icon: Settings },
  ].filter(Boolean);

  // Render navItems, mit Badge wo relevant
}
```

Die Sidebar-Komponente muss vom App-Shell-Layout her die Zähler bekommen. Dazu wird das Shell-Layout zur Server Component, die die Counts vorlädt:

### Update: `app/(protected)/layout.tsx`

```typescript
import { Sidebar } from "@/components/app-shell/sidebar";
import { getCurrentWorkspace } from "@/lib/auth-helpers";
import { createClient } from "@/lib/supabase/server";
import { countMyOpenTasks } from "@/lib/queries/my-tasks";
import { countOpenInboxItems } from "@/lib/queries/inbox"; // falls existiert, sonst einbauen
import { redirect } from "next/navigation";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const workspace = await getCurrentWorkspace();
  if (!workspace) redirect("/login");

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const myTasks = await countMyOpenTasks(user.id, workspace.workspace_id);
  // const inboxCount = await countOpenInboxItems(workspace.workspace_id); // falls nicht existiert, erstmal 0

  return (
    <div className="flex min-h-screen">
      <Sidebar
        role={workspace.role}
        inboxCount={0}
        myTasksCount={myTasks.total}
        myTasksOverdueCount={myTasks.overdue}
      />
      <main className="flex-1">{children}</main>
    </div>
  );
}
```

---

## Schritt 8 — Dashboard-Redirect für Team

### Update: `app/(protected)/dashboard/page.tsx`

Am Anfang der Funktion:

```typescript
export default async function DashboardPage() {
  const workspace = await getCurrentWorkspace();
  if (!workspace) redirect("/login");

  // Team-Rolle: Redirect zu my-tasks (Dashboard ist Doctor-Only)
  if (workspace.role === "team") {
    redirect("/my-tasks");
  }

  // ... rest wie bisher
}
```

---

## Schritt 9 — Terminlink-Button für Team disablen

### Update: `components/inbox/submission-detail.tsx` (oder wo der Button ist)

Finde den Terminlink-Button und erweitere ihn:

```typescript
interface SubmissionDetailProps {
  // ... bestehende Props
  userRole: "doctor" | "team";
}

export function SubmissionDetail({ userRole, ... }: SubmissionDetailProps) {
  // ... rest

  return (
    <div>
      {/* ... */}
      <Button
        onClick={handleSendAppointmentLink}
        disabled={userRole !== "doctor" || isPending}
        title={userRole !== "doctor" ? "Nur Ärzte können Terminlinks versenden." : ""}
      >
        Terminlink senden
      </Button>
    </div>
  );
}
```

Und in `app/(protected)/inbox/[id]/page.tsx`:

```typescript
const workspace = await getCurrentWorkspace();
// ... 
<SubmissionDetail userRole={workspace.role} ... />
```

Plus auf Server-Action-Ebene: In `app/(protected)/inbox/actions.ts` → `sendAppointmentLink`-Action sollte am Anfang prüfen:

```typescript
if (workspace.role !== "doctor") {
  return { error: "Nur Ärzte können Terminlinks versenden." };
}
```

---

## Schritt 10 — Tests und Build

```bash
npm run build
```

Muss grün sein.

```bash
git add .
git commit -m "feat: phase 11 — my tasks view and role-based navigation"
```

---

## Schritt 11 — STOP (MENSCHLICHE SCHRITTE)

Melde dem Menschen:

"Phase 11 ist fertig. Du musst diesmal **keine Migrationen** ausführen — alles ist Code.

### Was du testen sollst

1. **Als Doctor:** Anmelden → du siehst die bisherige Navigation plus neu "Meine Aufgaben" unter Einsendungen. Badge zeigt Anzahl.

2. **Als Team-Mitglied:** Benja Franke einladen (aus Settings), im Inkognito einloggen. Die Sidebar zeigt nur: Einsendungen, Meine Aufgaben. Kein Dashboard, kein Journal, kein Settings.

3. **Task zuweisen:** Als Doctor in der Inbox eine Task an Benja zuweisen.

4. **Task sehen:** Als Benja auf `/my-tasks` → Task erscheint in Liste.

5. **Task abhaken:** Als Benja Kreis anklicken → Task verschwindet.

6. **Terminlink-Block:** Als Benja in einem Submission-Detail → 'Terminlink senden'-Button ausgegraut mit Tooltip 'Nur Ärzte können Terminlinks versenden'.

7. **Dashboard-Redirect:** Als Benja manuell `/dashboard` in URL eingeben → sollte zu `/my-tasks` umgeleitet werden."

---

## Bekannte Probleme

**Inbox-Count im Badge:** Wenn `countOpenInboxItems` noch nicht existiert, einfach auf 0 lassen — bauen wir später ein.

**Doctor sieht auch eigene Tasks:** My Tasks zeigt auch Tasks, die der Doctor sich selbst zugewiesen hat. Das ist gewollt.

**Delete Task:** Phase 11 baut kein Delete für Tasks. Nur Complete (abhaken). Löschen kann später über die Detail-Ansicht kommen.

**Due-Date-Picker:** Wir zeigen `due_date` wenn es existiert, aber es gibt aktuell keinen Picker zum Setzen bei Task-Erstellung. Das ist Phase-6-Scope-Frage — falls Ärzte kein Datum setzen, landen alle Tasks in "Ohne Fälligkeit".

---

*Ende Phase 11*

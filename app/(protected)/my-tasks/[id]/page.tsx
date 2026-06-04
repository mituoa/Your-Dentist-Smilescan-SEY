import { notFound, redirect } from "next/navigation";

import { TaskDetailView } from "@/components/my-tasks/task-detail";
import { getCurrentWorkspace } from "@/lib/auth-helpers";
import { getMessageDraftStatusMapForSubmissions } from "@/lib/queries/message-drafts";
import { getTaskWithComments } from "@/lib/queries/task-detail";
import { createClient } from "@/lib/supabase/server";
import { markTaskAsRead } from "@/lib/tasks/receipts";

interface TaskDetailPageProps {
  params: Promise<{ id: string }>;
}

/**
 * **`/my-tasks/[id]` — Punkt 1 (Zweck):** Ruhige **Aufgabenkoordination** im aktuellen Workspace — Inhalt lesen,
 * Zuständigkeit erkennen, **ärztliche Bestätigung** oder **Einreichung zur Prüfung**, ergänzende **Kommentare**
 * (kein Chat, kein Ticket-Board). **Abgrenzung:** **kein** generisches PM-/Helpdesk-/Ops-Center, **kein** CRM,
 * **keine** KPI-, Realtime- oder KI-Vortäuschung; dieselbe klinische Rahmenfläche wie Relay/`my-tasks` (s.
 * `RelayWorkspaceView`, `clinicalCorePanel`). Navigation zurück zur passenden Übersicht (`/relay` oder `/my-tasks`).
 *
 * **Punkt 2 (Status / Stabilität):** **Server-first** nach Mutationen (`router.refresh`); **kein** Realtime-Schein.
 * Client: `useTransition` + **`aria-busy`** + **`fieldset disabled`** in `TaskActions` / `CommentForm` — während
 * ausstehender Aktion keine parallelen Submits, Eingaben gesperrt wo sinnvoll; Fehler als ruhige Zeile (kein Toast).
 * Initiales Seitenladen: **Punkt 6** (`loading.tsx`, `ClinicalTaskDetailSkeleton`).
 *
 * **Punkt 3 (Supabase / Auth) — final:** **Workspace:** nur `getCurrentWorkspace` + `workspace.workspace_id` an
 * `getTaskWithComments` und an Server Actions (`resolveActorWorkspace`); **kein** clientgewähltes Workspace.
 * **Task/Kommentare:** Aufgabe `.eq("workspace_id", …)`; Kommentare per **`tasks!inner`** + gleicher `workspace_id`
 * (App-Schicht **zusätzlich** zu RLS `current_workspace_id()` auf `task_comments`). **Mutationen:** `addTaskComment`,
 * `submitTaskForReview`, `approveTask`, `rejectTask` laden die Aufgabe jeweils mit `workspace_id` der Session;
 * generische Nutzerfehler („Aufgabe nicht gefunden.“), **keine** Enumeration fremder IDs. **E-Mail an Audience:**
 * `getTaskAudienceEmails` nur mit **`workspace_id`-gebundener** Task-Zeile (Admin-Client, Grenze am Aufrufer).
 * **Receipts:** `markTaskAsRead` über Server-Client (RLS); `upsertTaskReceipts`-Logs nur Fehlercode. **Inbox-Link:**
 * nur wenn `submission_id` aus derselben, workspace-gefilterten Task-Zeile — fachliche Konsistenz Submission↔Task
 * bleibt Datenbank-Vertrag. **RLS:** zweite Verteidigungslinie; Betrieb muss Policies mit Pilot-`current_workspace_id()`
 * abstimmen (s. Migrationen zu Tasks/Kommentaren).
 *
 * **Punkt 4 (Aktionen) — final:** **Koordinierend**, nicht produktivitätsgetrieben — `TaskActions` und `CommentForm`
 * ohne Toast/Banner, ohne „Ops“-Doppel-CTA; primäre Schritte (Einreichen, Bestätigen, Rückmeldung) **dezent**
 * (ruhiger Schatten/Fokus), Kommentar **sekundär** zur Hauptaktion. Keine Success-Inszenierung nach `router.refresh`;
 * Fehler nur als kurze Zeile. Manuelle Smoke (alle Rollen/Zustände, Mobile) = Regression.
 *
 * **Punkt 5 (Tot/Fake) — final:** **Ehrlich zum Datenmoment:** Metadaten, Kenntnisnahme und Status entsprechen dem
 * **Serverstand beim Rendern** — **keine** Live-Ticker, **kein** Websocket-/Push-Schein, **keine** Chat- oder
 * Helpdesk-Simulation. Kommentare sind **dokumentierende Notizen**, kein Kanal; nach `router.refresh` folgt die
 * Oberfläche dem aktualisierten Stand **ohne** künstlichen Erfolgs-Banner. **Kein** KPI-, Velocity- oder
 * „Team-Aktivität“-Theater. Inbox-Link nur aus der geladenen Task-Zeile — kein generischer Ticket-Sprung.
 *
 * **Punkt 6 (Loading) — final:** Initiales UI nur **`loading.tsx`** → `ClinicalTaskDetailSkeleton` — **statische**
 * Balken (`inboxBarStatic`), **kein** Puls, **keine** Chat-/Ticket-Skeleton-Animation. Struktur und Abstände an
 * `TaskDetailView` angelehnt (`clinicalCorePanel`, `mb-8` / `mb-10`, Kommentar-Bereich mit Platz für Überschrift +
 * Untertitelzeile), um **Layout-Sprünge** zu begrenzen; Mutationen bleiben bei **Punkt 2** (`fieldset`/`aria-busy`),
 * **kein** zweites globales Lade-Overlay. Randfall Task sofort **erledigt** ohne Aktionspanel: geringer Höhenwechsel
 * nach dem Laden — selten, akzeptiert.
 *
 * **Punkt 7 (Empty) — final:** Leerer Kommentar-Thread nur **eine** sachliche Zeile in `CommentThread` — Begriff
 * **Notizen** / Dokumentation, **kein** „Verlauf“/Activity-Log-/Ticket-Ton, **kein** Empty-CTA, **keine** dashed
 * „Hier starten“-Fläche, **keine** Motivations- oder Chat-Klischees. Kontext liefert die bestehende Überschrift +
 * Untertitelzeile im Panel (`TaskDetailView`) — **kein** dritter Warn-/Hinweisblock. Semantik: **geladen + 0 Zeilen**
 * ist valider Zustand (RSC liefert Daten erst nach Query); **nicht geladen** = Route noch nicht gerendert bzw.
 * `loading.tsx` (Punkt 6); **keine Berechtigung** = `notFound` (kein generisches „Zugriff verweigert“-Empty auf
 * dieser URL); **Fehler bei Mutationen** = kurze Zeile in `TaskActions`/`CommentForm` (**Punkt 8**), nicht als „leer“
 * inszeniert.
 *
 * **Punkt 8 (Error) — final:** Fehler **ruhig** und **lokal**: eine Zeile unter der jeweiligen Aktion (`aria-live="polite"`,
 * `font-normal`, **kein** Banner/Toast, **keine** Alarm-Fläche). Server Actions in `my-tasks/actions.ts` liefern nur
 * **verständliche** deutsche Kurzmeldungen — **keine** rohen DB-/Stack-Strings, **keine** „Ticket wartet“-Rhetorik;
 * Rollenabwehr sachlich (**„Dieser Schritt ist für Ihre Rolle nicht vorgesehen.“**). Client: `try`/`catch` um jede
 * Mutation — bei Netz-/Laufzeitabbruch **`taskMutationClientFailureMessage`** (keine Exception-Texte in der UI).
 * Unterscheidung: **Pending** = `fieldset disabled` + Spinner; **Validierung** = sofortige Zeile (z. B. leere
 * Rückmeldung); **Berechtigung/Stand** = serverseitige Meldung nach Prüfung; **Server/Netz** = gespeichert scheitern
 * bzw. generische ruhige Client-Meldung. Neue Actions sollen weiterhin nur **verständliche** `error`-Strings liefern
 * (kein Passthrough technischer Supabase-Meldungen).
 *
 * **Punkt 9 (Mobile) — final:** Gleiche **Protected-Shell** wie übrige App (`layout.tsx`: `main` scrollt,
 * `overflow-x-hidden`, `pb` mit Safe-Area für Mobile-Nav). `TaskDetailView`: **eine** vertikale Lesespur — **kein**
 * zweites Scroll-In-Scroll; `min-w-0` + `overflow-x-hidden` + `break-words` gegen lange Titel/E-Mails/Notizen;
 * `touch-manipulation` auf Flächen mit vielen Taps. **Textareas** mit **16px** (`text-base`) — **kein** iOS-Zoom beim
 * Fokus; Primär- und Sekundäraktionen **`min-h-11`**, schmale Viewports: Buttons **`w-full`** (bzw. `sm:flex-1` im
 * Review-Paar), ohne Chat-Bubble-Layout. Kommentar-Panel bleibt **unter** den Aufgabenmetadaten und Aktionen —
 * ruhige Reihenfolge, keine sticky Composer-Leiste. Verbleibend: Tastatur überdeckt ggf. untere Bereiche je nach
 * iOS-Version — kein zusätzlicher `visualViewport`-Hack (bewusst einfach gehalten).
 *
 * **Punkt 10 (Security) — final:** **Workspace-Kette:** `getCurrentWorkspace` → `workspace.workspace_id` nur aus
 * Server-Session/Membership — **kein** clientgewähltes Workspace. **Lesen:** `getTaskWithComments(id, workspace_id)`
 * filtert Task und Kommentare (`tasks!inner` + `tasks.workspace_id`); **Submission** nur mit
 * `submissions.workspace_id === workspace_id` (sonst kein Inbox-Link/kein Patientenname in der UI — Schutz bei
 * Daten-Drift). **Seiten-Gate:** `isMyTask` aus Task-Zeile + Session; sonst **`notFound`** (keine Enumeration fremder
 * UUIDs, kein „Zugriff verweigert“-Theater). **Schreiben:** `resolveActorWorkspace` in allen Actions; Task-Updates mit
 * `.eq("workspace_id", …)` (**inkl.** `approveTask` / `rejectTask`); Kommentar-Insert nur nach workspace-gefiltertem
 * Task-Select; `getTaskAudienceEmails` nur mit workspace-gebundener Task-Zeile (Admin-Client, Aufrufer-Grenze).
 * **Receipts:** `markTaskAsRead` nur nach Empfänger-Gate auf der Seite; RLS bleibt zweite Verteidigungslinie.
 * **Logs:** nur Fehler-**codes** / kurze Tags, **keine** E-Mail-/Patientenstrings in `console.*`. **UI:** nutzerfreundliche
 * Meldungen ohne technische Rohfehler (s. Punkt 8). **Cache:** Next-`revalidatePath` auf workspace-relative Pfade;
 * Cross-Workspace-Cache-Risiko durch strikte `workspace_id`-Filter in Queries/Mutations begrenzt — RLS-Policies im
 * Betrieb mit `current_workspace_id()` verifizieren.
 *
 * **Punkt 11 (MVP) — final:** **Pilot-Vertrag erfüllt:** eine Seite pro Aufgabe — Metadaten, Kenntnisnahme-Stand,
 * klarer **Status** (Offen / Auf Bestätigung / Erledigt), **Einreichung zur ärztlichen Prüfung** bzw. **Bestätigung**
 * oder **Rückweisung mit Begründung**, **flache Kommentar-/Notizliste** (keine Threads, keine @-Erwähnungen, keine
 * Anhänge), optionaler **Inbox-Fall-Link** nur aus konsistenter Task-Zeile. **Bewusst kein MVP:** Push/Realtime,
 * Activity-Feeds, SLA-/KPI-Boards, KI-/Automations-Layer, Messenger-/Chat-UX, konfigurierbare Workflows, Dateianhänge
 * auf Kommentaren, Erwähnungen, globale Suche über Workspaces. **Kein** Plattform-Ausbau auf dieser Route —
 * Erweiterungen nur mit eigenem Produkt-/Compliance-Schnitt, nicht „Feature an Feature“. **Balance:** ruhig, ehrlich
 * zum Datenmoment (Punkt 5), belastbar in AuthZ (Punkt 10), ohne Produktivitäts-Theater — **fokussiertes**
 * Koordinations-MVP, kein Jira-/Helpdesk-Ersatz.
 *
 * **Punkt 12 (Nice / Future / Non-MVP) — final:** **Nice (erlaubt, klein):** Typo-/Spacing-/Rhythmus-Polish,
 * A11y-Feinschliff, gezieltes Mobile-QA, kleine Klarstellungen in Copy — **ohne** neue Datenfelder, Kanäle oder
 * Zustände auf dieser Route. **Future (nicht hier „mitwachsen“):** echte Push-/Websocket-Infrastruktur,
 * erweiterte Workflow-Engines, Audit-/Historien-Portale, feinere Rollenmatrix, strukturierte Kommunikationsprodukte,
 * zentrale Inbox-Task-Orchestrierung — jeweils **eigener** Architektur-/Compliance-Schnitt, nicht als
 * Schnellfeature in `TaskDetailView`. **Non-MVP (bewusst nicht):** Chat/Messenger, Activity-/Presence-Feeds,
 * KPI-/Velocity-Dashboards, KI-Assistenten auf der Seite, Ticketnummern-/SLA-Theater, „kollaborativer Workspace“-Chrome,
 * Echtzeit-Tippen/Lesebestätigungen, Kommentar-Threads/@-Erwähnungen/Anhänge, generische Helpdesk-CTA-Sprache.
 * **Drift-Schutz:** Wer diese Route „plattformischer“ machen will, zuerst gegen Punkt 11 **und** diese Liste prüfen —
 * bei Konflikt **restriktivere**, ruhigere Lösung. **Kein** Pflicht-Änderungsbedarf am Code für Punkt 12; normatives
 * Raster für Reviews und Roadmaps.
 *
 * **Punkt 13 (Priorität) — final:** **Produktlage:** `/my-tasks/[id]` liegt auf dem **kritischen Pfad** der
 * Pilot-Aufgabenkoordination (Lesen, Einreichen, ärztliche Entscheidung, dokumentierte Notiz) — **nicht** ein
 * Experimentier-Canvas. **P0 bleibt gerechtfertigt:** Fehlfunktionen untergraben Vertrauen, können falsche
 * fachliche Zustände oder **AuthZ-/Workspace-Verletzungen** riskieren. **Produktkritische Regressionen u. a.:**
 * `getTaskWithComments` / `isMyTask` / `notFound`, fehlende `workspace_id`-Filter in Actions, kaputte
 * `submitTaskForReview` / `approveTask` / `rejectTask` / `addTaskComment`, Submission-/Inbox-Kopplung, Receipts,
 * Einladung falscher UI-Zustände (Fake-Live). **Vor Pilot/Demo manuell:** alle Rollen × Status × Mobile; Netzwerkfehler;
 * Rückweisung; leerer Thread; Task `done` ohne Aktionspanel; Inbox-Link nur mit Submission. **Bewusst einfrieren
 * (nur mit Punkt-11/12-Review):** Kern-Guards, Datenvertrag `getTaskWithComments`, Server-Action-Semantik,
 * „kein Realtime/kein Chat“-Charakter — **keine** spontane Feature-Schicht. **QA / Monitoring / Nutzung** bleiben
 * Betrieb, keine ständige Produktentwicklung auf dieser Route. **Kein** triftiger Grund für weiteren **funktionalen**
 * Ausbau hier — Stabilität und Ruhe **bewusst** über „mächtiger/kollaborativer“ stellen. **Sofort hektischer/ticketartig
 * würden u. a.:** Live-Feeds, Push-Badges, SLA-Countdowns, Thread-Chat, KPI-Chips, KI-Zusammenfassungen,
 * „Team-Aktivität“-Sprache. **Besonders schützen:** Punkte 5, 10, 11, 12 (Ehrlichkeit, AuthZ, MVP-Umfang,
 * Drift-Grenzen).
 */
export default async function TaskDetailPage({ params }: TaskDetailPageProps) {
  const { id } = await params;
  const workspace = await getCurrentWorkspace();
  if (!workspace) redirect("/login");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { task, comments } = await getTaskWithComments(id, workspace.workspace_id);
  if (!task) notFound();

  const isDoctor = workspace.role === "doctor";
  const isTaskRecipient =
    task.recipient_type === "all_team" ||
    (task.recipient_type === "specific_person" &&
      (task.specific_recipient_id === user.id ||
        task.assignee_user_ids.includes(user.id))) ||
    (task.recipient_type === "doctor_only" && isDoctor);
  const isMyTask =
    isTaskRecipient ||
    (isDoctor && task.created_by === user.id);

  if (!isMyTask) {
    notFound();
  }

  if (isTaskRecipient) {
    await markTaskAsRead(task.id, user.id);
  }

  const listHref = isDoctor ? "/relay" : "/my-tasks";
  const doctorSelfTask = isDoctor && task.created_by === user.id;

  let messageDraftStatus: "draft" | "approved" | "sent" | "none" = "none";
  if (task.submission_id) {
    const draftMap = await getMessageDraftStatusMapForSubmissions(workspace.workspace_id, [
      task.submission_id,
    ]);
    if (draftMap.available) {
      messageDraftStatus = draftMap.statusBySubmissionId[task.submission_id] ?? "none";
    }
  }

  return (
    <TaskDetailView
      task={task}
      comments={comments}
      currentUserId={user.id}
      isDoctor={isDoctor}
      isMyTask={isMyTask}
      doctorSelfTask={doctorSelfTask}
      listHref={listHref}
      messageDraftStatus={messageDraftStatus}
    />
  );
}

import "server-only";

import { redirect } from "next/navigation";

import { getCurrentWorkspace } from "@/lib/auth-helpers";
import { getMyTasks } from "@/lib/queries/my-tasks";
import type { TaskCounts } from "@/lib/queries/task-counts";
import { getAssignableWorkspaceMembers } from "@/lib/queries/team-members";
import { createClient } from "@/lib/supabase/server";

/**
 * Gemeinsamer Datenlader für **`/relay`** (Team-Board) und **`/my-tasks`** (persönliche Relay-Ansicht).
 * Liefert nur workspace-gehörige Aufgaben und Mitglieder — keine zweite Produktlogik, nur geteilte Abfragen.
 * **Auth:** `getCurrentWorkspace` + Session; alle Mutationen laufen über Server Actions mit `resolveActorWorkspace`
 * (s. `my-tasks/actions.ts`).
 *
 * **Punkt 5 (Tot/Fake):** Kein eigener Realtime-Kanal — Datenstand entspricht dem **Seitenladen** und
 * **Revalidierung** nach Mutationen (`revalidatePath` in Actions), nicht „Live-Board“-Semantik. Zähler oberhalb
 * des Boards: **Team-Gesamtzahlen** (`getMyTaskCounts`); gefilterte Karten in den Spalten bei „Meine …“.
 *
 * **Punkt 6 (Loading):** Initiales UI-Gerüst über Route-`loading.tsx` + `ClinicalRelayBoardSkeleton` (statisch,
 * strukturgleich Board); dieser Loader ersetzt **nicht** das Board-Pending bei Mutationen (`CardBoard`).
 *
 * **Punkt 7 (Empty):** Leere Spalten-Copy und -Darstellung in `CardBoard` — siehe `relay/page.tsx` und Komponente.
 *
 * **Punkt 8 (Error):** Nutzer-Meldungen aus Server Actions (`my-tasks/actions`); Board-Hinweis bei fehlgeschlagener
 * Persistenz in `CardBoard` — siehe `relay/page.tsx`.
 *
 * **Punkt 9 (Mobile):** Horizontales Board und Ladegerüst — `CardBoard`, `ClinicalRelayBoardSkeleton`; siehe `relay/page.tsx`.
 *
 * **Punkt 10 (Security):** Nur `workspace_id` aus `getCurrentWorkspace`; Mitgliederliste für Quick-Create über
 * `getAssignableWorkspaceMembers` — gleiche Grenze wie Relay-Actions (`relay/page.tsx`).
 *
 * **Punkt 11 (MVP):** Geteilter Datenstand für `/relay` und `/my-tasks` — bewusst **kein** eigener Relay-Stack,
 * keine parallele „Produkt“-API; Scope s. `relay/page.tsx` (Punkt 11).
 *
 * **Punkt 12 (Nice / Future / Non-MVP):** Kein zweiter Datenpfad für „Live“ oder Analytics — Future-Themen bleiben
 * außerhalb dieses Loaders; Einordnung s. `relay/page.tsx` (Punkt 12).
 *
 * **Punkt 13 (Priorität):** Loader-Änderungen nur mit Regressionssinn — P0- und Stabilitätsrahmen s. `relay/page.tsx`
 * (Punkt 13).
 */
export async function loadRelayWorkspaceData(searchParams: Promise<Record<string, string | string[] | undefined>>) {
  await searchParams;

  const workspace = await getCurrentWorkspace();
  if (!workspace) redirect("/login");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const isDoctor = workspace.role === "doctor";

  const [openTasks, pendingTasks, doneTasks, assignableMembers] = await Promise.all([
    getMyTasks(user.id, workspace.workspace_id, isDoctor, "open"),
    getMyTasks(user.id, workspace.workspace_id, isDoctor, "pending_review"),
    getMyTasks(user.id, workspace.workspace_id, isDoctor, "done"),
    getAssignableWorkspaceMembers(workspace.workspace_id, user.id),
  ]);

  const counts: TaskCounts = {
    open: openTasks.length,
    pending: pendingTasks.length,
    done: doneTasks.length,
  };

  return {
    userId: user.id,
    userEmail: user.email ?? null,
    isDoctor,
    columns: { open: openTasks, pending: pendingTasks, done: doneTasks },
    counts,
    assignableMembers,
  };
}

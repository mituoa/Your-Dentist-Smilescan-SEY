import { redirect } from "next/navigation";
import { getCurrentWorkspace } from "@/lib/auth-helpers";
import { resolveCreateCaseCancelHref } from "@/lib/create-case-return";
import { CreateCaseClient } from "@/components/cases/create-case-client";

interface CreateCasePageProps {
  searchParams: Promise<{ from?: string }>;
}

/**
 * **`/create-case` — Punkt 1 (Zweck):** Ruhige **Praxis-Fallerstellung** (Patientenstammdaten, fachliches Anliegen,
 * Triage-Dringlichkeit, optionale Bilder) für die **weitere Bearbeitung in der Inbox** — **kein** Lead-Formular,
 * **kein** CRM-/Ticket-Intake, **kein** „Sales Funnel“, **keine** KI-/Automation-/KPI-Inszenierung. Entwurf und
 * Veröffentlichen sind **Dokumentations- und Koordinationsschritte**, keine gamifizierten Status-Spiele.
 *
 * **MVP / Rolle:** Nur **Arztrolle** (`workspace.role === "doctor"`) — Team-Mitgliedschaften werden zur
 * **gleichen Zielroute wie `journal/new`** umgeleitet (`/my-tasks`); Server Action `createPracticeCase` wiederholt die
 * Prüfung (**Defense in Depth**). Upload-Pfade nur aus dem **Workspace-`temp/`-Präfix** (s. Action).
 */
export default async function CreateCasePage({ searchParams }: CreateCasePageProps) {
  const workspace = await getCurrentWorkspace();
  if (!workspace) {
    redirect("/login?error=workspace_missing");
  }

  if (workspace.role !== "doctor") {
    redirect("/my-tasks");
  }

  const sp = await searchParams;
  const cancelHref = resolveCreateCaseCancelHref(sp.from);

  return (
    <CreateCaseClient workspaceId={workspace.workspace_id} cancelHref={cancelHref} />
  );
}

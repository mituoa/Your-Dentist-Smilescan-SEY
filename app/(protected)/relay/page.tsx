import { loadRelayWorkspaceData } from "@/app/(protected)/my-tasks/relay-server-data";
import { RelayWorkspaceView } from "@/components/my-tasks/relay-workspace-view";

/**
 * **`/relay` — Punkt 1 (Zweck):** **Team-Orchestrierung** für **Arbeitsaufgaben** im aktuellen Workspace
 * (nicht Patientenakte, **kein** CRM, **kein** generisches Ticket- oder PM-Tool). Sichtbarkeit und Einordnung
 * gemeinsamer Schritte: **offen**, **in Bearbeitung** (Prüf-/Bearbeitungsphase), **erledigt** — mit
 * Zuweisung, Quick-Create und kontrolliertem **Drag & Drop** (Server Actions, `canMoveTask` aus
 * `workflow-rules`). **Mobile:** bewusst horizontales Kanban (`min-w-[980px]` im Board) — Lesen und
 * gelegentliche Korrektur, keine parallele „voll mobile Inbox“-Parität. **Navigation:** Karten verlinken auf
 * `/my-tasks/[id]` (Aufgabendetail). **P0:** Zuverlässigkeit und klare Rollen-/Bewegungsregeln vor
 * „Board-Show“; keine KPI-, Analytics- oder KI-Orchestrierungs-Vortäuschung.
 *
 * **Punkt 2 (Status / Stabilität):** Board-UI in `CardBoard` — optimistisches DnD mit **Rollback** bei Abbruch
 * oder Serverfehler; **Synchronisation** des lokalen Board-States mit Serverdaten nach `revalidatePath`, ohne
 * Drift während aktivem Zug oder laufender Mutation; **ruhiges** Pending-Feedback (`aria-busy`, dezente Deckkraft);
 * Drop-Ring folgt der **visuellen** Kartenposition, nicht nur dem gespeicherten Status. **Final:** im Code-Vertrag
 * keine offene Stabilitätslücke; Last-/Browser-QA = Regression/Betrieb. Randfall Zwischen-Spalte ohne erlaubten
 * Rückweg während eines Zugs: in `CardBoard`-Kommentar als **Nicht-Blocker** dokumentiert (kein neues DnD-System).
 *
 * **Punkt 3 (Supabase / Auth / Workflow):** Nur **aktuelles Workspace** (`getCurrentWorkspace`, Queries mit
 * `workspace_id`); Mutationen nur in Server Actions (`resolveActorWorkspace`, `canMoveTask` wie Board);
 * feste deutsche Fehlertexte; Aufgaben-Detail nur bei `isMyTask` (sonst `notFound`). Server-Logs ohne vollständige
 * PostgREST-Details (nur Fehlercode) an zentralen Stellen angepasst — siehe `my-tasks/actions.ts`, `lib/queries/my-tasks.ts`.
 *
 * **Punkt 4 (Aktionen) — final:** Interaktionen **koordinierend**, nicht produktivitätsgetrieben — ruhige Hover/Fokus,
 * kein „Ops-Board“-Theater; Quick-Create und Karten in `RelayQuickCreate` / `CardBoard`; Filter nur Umschaltung,
 * keine zusätzlichen CTAs. **Manuelle Browser-Smoke** (DnD, Quick-Create, Filter, Pending/Rollback, Link zu
 * `/my-tasks/[id]`) vor Staging/Demo ist üblicher **Regressionstest** — bewusst nicht als offene Punkt-4-Lücke
 * im Code-Vertrag geführt (keine im Review gefundene konkrete Interaktionslücke).
 */
interface RelayPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function RelayPage({ searchParams }: RelayPageProps) {
  const data = await loadRelayWorkspaceData(searchParams);

  return (
    <RelayWorkspaceView
      basePath="/relay"
      userId={data.userId}
      userEmail={data.userEmail}
      isDoctor={data.isDoctor}
      columns={data.columns}
      counts={data.counts}
      assignableMembers={data.assignableMembers}
    />
  );
}

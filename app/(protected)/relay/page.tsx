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
 *
 * **Punkt 5 (Tot/Fake) — final:** Keine tote Doppel-Zählung gegenüber dem Board; keine Websocket-/Realtime-
 * Vortäuschung; Zähler = Länge der **aktuell gerenderten** Spalten (Filter „Meine Beteiligung“ spiegelt sich in den
 * Zahlen). Zustell-Hinweise auf Karten (`ReceiptMark`) sind **ruhige** Empfangs-/Lesestatus-Labels, kein
 * Chat-„Ops“-Theater; Spaltenköpfe ohne unnötige **Uppercase-PM-Optik** (s. `CardBoard`). Leerstände und
 * „90 Tage“-Hinweis bei Erledigt entsprechen der Abfrage in `getMyTasks`.
 *
 * **Punkt 6 (Loading) — final:** Route-`loading.tsx` (`relay/loading.tsx`, `my-tasks/loading.tsx`) nutzt
 * `ClinicalRelayBoardSkeleton` — **statische** Platzhalter, strukturgleich `RelayWorkspaceView`/`CardBoard`
 * (`min-w-[980px]`, drei Spalten), **kein** Puls/Schein-Realtime; Mutationen: weiterhin `aria-busy` + dezente
 * Deckkraft im Board (Punkt 2), nicht als zweites „globales“ Lade-Theater.
 *
 * **Punkt 7 (Empty) — final:** Leere Spalten in `CardBoard` — ruhige Copy, **kein** Dashed-„Demo“-Rand;
 * `columnEmptyContext` unterscheidet **Gesamtansicht** von **gefilterter** Leere (kein Trust-Bruch); Erledigt-Text
 * an 90-Tage-Abfrage gekoppelt (`getMyTasks`).
 *
 * **Punkt 8 (Error) — final:** Server Actions liefern **deutsche** Nutzertexte ohne Technik-Codes (`my-tasks/actions`);
 * DnD-/Reihenfolge-Fehler: **Rollback** + ruhige, zeitlich begrenzte Zeile in `CardBoard` (`aria-live="polite"`), kein
 * Toast/Banner; `notAllowed` mit kurzem Berechtigungs-Hinweis; Quick-Create: eingebettete Fehlerfläche in
 * `RelayQuickCreate`. Schwerwiegende Ladefehler der Datenroute: Redirect/Abbruch ohne Board-Render (kein Raw-JSON
 * im UI).
 *
 * **Punkt 9 (Mobile) — final:** Bewusst **horizontales** Kanban (`min-w-[980px]` in `CardBoard`), kein zweites
 * Mobile-Layout; Streifen mit Momentum-Scroll, **Safe-Area** unten, begrenzte **Scroll-Kette** (`overscroll-x-contain`);
 * Spaltenhöhe an **dvh** gekoppelt; Filter/Quick-Create mit **44px**-Tippflächen und **16px**-Eingabe (`RelayWorkspaceView`,
 * `RelayQuickCreate`). Real-Geräte-QA (Safari, Pull-to-refresh) = Regression.
 *
 * **Punkt 10 (Security) — final:** **Workspace-Grenze:** Daten nur über `loadRelayWorkspaceData` / `getCurrentWorkspace`
 * und Queries mit **`workspace_id`** (`getMyTasks`, `getAssignableWorkspaceMembers`); keine zweite Workspace-Quelle.
 * **Workflow:** `canMoveTask` in `workflow-rules` ist **einzige** Regel-Quelle — `CardBoard` (DnD/Vorschau) und
 * `moveTaskStatusByDrag` (Persistenz) nutzen dieselbe Funktion; Drop-Ring nur bei erlaubtem Zug. **Detail:** `/my-tasks/[id]`
 * nur bei `isMyTask`, sonst `notFound` (kein Leak über UUID). **Logging:** Server `console.error` nur mit **Fehlercode**,
 * keine PII/PostgREST-Rohpayloads in Relay-Pfaden. **RLS:** App-Filter in `getMyTasks` ergänzt RLS — Betrieb muss
 * RLS konsistent halten (üblicher Infra-Vertrag).
 *
 * **Punkt 11 (MVP) — final:** **Im Umfang:** feste drei Schritte, Quick-Create mit Zuweisung an Team oder sich selbst,
 * Umschalter Gesamtansicht / eigene Beteiligung, DnD + Reihenfolge per Server Actions, Link ins Aufgabendetail —
 * **Team-Orchestrierung**, keine PM-/Ops-Plattform. **Bewusst nicht Teil dieses MVP:** Realtime oder Activity-Feeds,
 * KPI-/Analytics-Boards, KI- oder Automations-Schicht, zweites Mobile-Kanban, konfigurierbare Spalten/Workflows,
 * Backlog-/Epic-Semantik, parallele Zähl- oder Reporting-APIs neben dem Board. **Qualitätsziel:** ruhig, präzise,
 * ehrlich zum Seitenladen/Revalidieren — Koordination vor „Board-Show“ (s. `RelayWorkspaceView`, `CardBoard`,
 * `RelayQuickCreate`). Strategische Erweiterungen (z. B. Workspace-Switch) bleiben **außerhalb** dieses Vertrags.
 *
 * **Punkt 12 (Nice / Future / Non-MVP) — final:** **Priorität:** lieber restriktiv, ruhig und fokussiert als
 * „mächtiger“ oder plattformartiger. **Nice** (kleine Verbesserungen **ohne** neuen Produktumfang): Spacing/Typografie,
 * DnD-/Scroll-Rhythmus, Touch- und Accessibility-Kanten, Pending-/Rollback-Feinschliff, echte Geräte-QA — **keine**
 * neuen Spalten, Zähl-APIs oder Workflow-Semantik. **Future** (bewusst **nicht** aus dem aktuellen Board ableiten):
 * echte Realtime-Kollaboration, Activity-Feeds, konfigurierbare oder mehrstufige Workflows, Audit-/History-Systeme,
 * erweiterte Rollenmodelle, eigenständiges Mobile-Kanban, Workspace-Switch — jeweils nur mit **explizitem**
 * Produkt-/Security-Beschluss und eigenem Lieferumfang. **Non-MVP** (würde `/relay` schnell PM-/Ops-/Startup-artig
 * machen — **nicht** anstreben): KPI-/Analytics-Schicht auf dem Board, KI-/Automation-Showcases, hektische
 * Live-Visualisierung, Gamification, Activity-Spam, generische Jira-Nähe (Backlogs, Epics, Sprints, Swimlanes),
 * tiefe Board-Personalisierung, „cooleres Kanban“ ohne fachlichen Mehrwert, Ops-Center-Inszenierung. **Zur
 * Einordnung:** Punkt 11 = **was** der MVP ist bzw. bewusst weglässt; Punkt 12 = **wie** Erweiterungen eingestuft
 * werden, damit keine **Plattform-Drift** aus Einzel-PRs entsteht — bei Zweifel **Nice** wählen, nicht Future.
 *
 * **Punkt 13 (Priorität) — final:** **Stellenwert:** `/relay` ist **unterstützende Team-Orchestrierung** im Workspace
 * (gemeinsame Aufgabenlage) — **kein** eigenständiges Produktzentrum neben Kernflüssen, aber **P0**, sobald Praxen
 * darauf vertrauen: Fehlbedienung, Sichtbarkeitsfehler oder inkonsistente Bewegungsregeln untergraben **Vertrauen**
 * in die gesamte Aufgaben-Kette (`/my-tasks`, Detail, E-Mail-Anstöße). **P0 bleibt gerechtfertigt** für: korrekte
 * Workspace- und Rollen-Grenzen, `canMoveTask`-Parität UI/Server, zuverlässiges Speichern von DnD/Reorder/Create,
 * ruhige Fehler- und Berechtigungskommunikation. **Produktkritische Regressionen** (sofortiger Fix vor Pilot/Demo):
 * Cross-Workspace-Daten, Umgehen von `resolveActorWorkspace`, divergierende Workflow-Regeln, stille Dateninkonsistenz
 * nach Move, Rohfehler im UI, gebrochene Auth auf der Route. **Vor Pilot/Praxis/Demo manuell prüfen:** alle
 * erlaubten/verbotenen Züge je Rolle, Filter „Gesamt“/„Meine Beteiligung“, Quick-Create (Selbst/Mehrfach/Alle),
 * Reihenfolge innerhalb einer Spalte, Link zu `/my-tasks/[id]`, langsames Netz, Mobile-Safari horizontaler Streifen.
 * **Bewusst stabil halten / nicht mehr leichtfertig anfassen:** `workflow-rules` ↔ `moveTaskStatusByDrag`,
 * `resolveActorWorkspace`-Muster, `loadRelayWorkspaceData`-Filter, Sichtbarkeitslogik in `getMyTasks` — nur bei
 * Defekt oder **explizitem** Vertrags-Update (Punkte 11–12). **Kein funktionaler Ausbau-Pflicht** mehr: weiterer
 * Wert liegt in **Stabilität**, Regressionsschutz und realem Teamgebrauch (QA, Monitoring, Arbeitsdisziplin im Team),
 * nicht in neuen Board-Features. **Kollisionsregel:** Stabilität, Ruhe und Fokus schlagen „mächtigeres Relay“.
 * **Besonders schützen:** drei feste Schritte, keine KPI-/Activity-/KI-Schicht, kein zweites Mobile-Board, keine
 * konfigurierbaren Workflows ohne Roadmap-Beschluss (s. Punkt 12 **Non-MVP**).
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
      assignableMembers={data.assignableMembers}
    />
  );
}

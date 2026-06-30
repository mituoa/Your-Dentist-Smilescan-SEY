import { redirect } from "next/navigation";
import { getCurrentWorkspace } from "@/lib/auth-helpers";
import { resolveCreateCaseCancelHref } from "@/lib/create-case-return";
import { CreateCaseClient } from "@/components/cases/create-case-client";

interface CreateCasePageProps {
  searchParams: Promise<{ from?: string }>;
}

/**
 * **`/create-case` — Punkt 1 (Zweck):** Ruhige **Praxis-Fallerstellung** (Patientenstammdaten, **fachliche Kurznotiz**,
 * interne Dringlichkeit, optionale Bilder) für die **weitere Bearbeitung in der Inbox** — **kein** Lead-Formular,
 * **kein** CRM-/Ticket-Intake, **kein** „Sales Funnel“, **keine** KI-/Automation-/KPI-Inszenierung. Entwurf und
 * vollständiges Speichern sind **Dokumentations- und Koordinationsschritte**, keine gamifizierten Status-Spiele.
 *
 * **MVP / Rolle:** Nur **Arztrolle** (`workspace.role === "doctor"`) — Team-Mitgliedschaften werden zur
 * **gleichen Zielroute wie `journal/new`** umgeleitet (`/my-tasks`); Server Action `createPracticeCase` wiederholt die
 * Prüfung (**Defense in Depth**). Upload-Pfade nur aus dem **Workspace-`temp/`-Präfix** (s. Action).
 *
 * **Punkt 2 (Status — final):** **Server-first** nach erfolgreicher Action (`router.push` + `router.refresh` zur Inbox);
 * **kein** Realtime-/Live-Status-Schein. Client: `useTransition` + **`pendingKind`**, **`fieldset disabled`** +
 * **`aria-busy`**, keine parallelen Submits; **Drag/Dateiauswahl** während **busy** gesperrt; bei fehlgeschlagener Kette
 * **`deleteTempSubmissionPhotos`** (Teil-Upload / Action-Fehler vor Insert). Fehlerkommunikation: **Punkt 8**.
 * Initiales Laden: **`loading.tsx`** (s. **Punkt 6**).
 *
 * **Punkt 3 (Supabase/Auth — final):** **`/api/upload`:** Arzt nur mit **Session-Workspace**; Patienten mit **`doc_slug`**
 * (serverseitig aufgelöst). **`createPracticeCase`** / **`deleteTempSubmissionPhotos`:** Arzt + Workspace + strikte
 * Temp-Pfade; **`submission_photos`**-Insert per User-RLS (**031**), **`submissions`**-INSERT für authentifizierte
 * Nutzer nur noch über Mitgliedschaft (**032**). Keine Roh-Fehler an den Client.
 *
 * **Punkt 4 (Aktionen — final):** Fußzeile: **Als Entwurf sichern** vs. **Fall speichern**; Pending ohne
 * „Veröffentlichen“-Vibe; Validierung sichtbar (deaktivierte Schaltflächen + Kurztexte); Anhänge ohne
 * Schein-Erfolg — s. `CreateCaseClient`.
 *
 * **Punkt 5 (Tot/Fake — final):** Keine Schein-Erfolge oder CRM-/Ticket-Ästhetik; Titel und Anhänge ehrlich
 * („dokumentieren“, „lokal / erst nach Speichern“); ruhige Mikrointeraktionen; `loading.tsx` ohne generisches
 * „Formular“-Intake-Wording — s. `CreateCaseClient` / `loading.tsx`.
 *
 * **Punkt 6 (Loading — final):** Segment-`loading.tsx` nur für **Server-Page**-Latenz (Workspace/Rolle); **statisch**,
 * kein Shimmer, keine Pulse; **Layout** an die Maske angeglichen (Breite, Schatten, Mobile unten wie Sheet). **Nicht**
 * dasselbe wie **Speichern/Upload-Pending** im Client (`fieldset` + Fußzeilen-Texte) — kein Skeleton-Realtime-Schein.
 *
 * **Punkt 7 (Empty — final):** Leerer Start und leere Upload-Fläche ohne Doppel-Führung oder Motivations-SaaS; knappe
 * sachliche Hilfstexte — s. `CreateCaseClient`.
 *
 * **Punkt 8 (Error — final):** Ruhige, getrennte Semantik: Stammdaten/Server oben (`role="alert"`), Bild-/Dateifehler
 * in der Anlagen-Sektion; keine Roh-Technik aus `fetch`/DB; Action-Würfe → `taskMutationClientFailureMessage`; keine
 * doppelte Warnlautstärke; sanftes Scrollen zur jeweiligen Meldung — s. `CreateCaseClient` / `createPracticeCase`.
 * **Teil-Erfolg Anlagen:** `partialAttachments` → Redirect mit `anlagen_teilweise=1`, ein ruhiger Hinweis im
 * **`CaseCreatedToast`** auf `/inbox/[id]` (kein zweites Toast, keine Ops-Sprache).
 *
 * **Punkt 9 (Mobile — final):** Sheet/Loading an **SVH + Safe Area** ausgerichtet; dominanter Scroll mit Polster über
 * der Fußzeile; Touch- und Overflow-Details — s. `CreateCaseClient` / `loading.tsx`.
 *
 * **Punkt 10 (Security — final):** **Arzt-only** auf Page (`redirect`) + in **`createPracticeCase`** /
 * **`deleteTempSubmissionPhotos`**; Workspace nur aus Session; **RLS 024** erlaubt Mitgliedern DB-INSERT generell —
 * Arzt-Gate bleibt **Action-seitig** Pflicht. Upload: **`/api/upload`** prüft Rolle + Workspace-Abgleich; Temp-Pfade
 * nur UUID-Schlüssel wie API; Feldgrenzen, Dringlichkeit, ISO-Geburtsdatum serverseitig — s. `actions.ts`.
 *
 * **Punkt 11 (MVP — final):** **Pilot-Arzt-only**-Fallerstellung: ein Formular, **kein** mehrstufiger Intake, **kein**
 * CRM-/Ticket-/Lead-Aufbau; **bewusst nicht**: Autosave, Realtime-Status, KI-Vorbewertung, komplexe Upload-Pipelines,
 * Mandanten-weites „Plattform“-Feature-Set — s. `CreateCaseClient` / `loading.tsx`.
 *
 * **Punkt 12 (Nice / Future / Non-MVP — final):** Langfristige Grenze — **restriktiv**, ruhig, fokussiert (lieber
 * weniger „Mächtigkeit“ als CRM-/Intake-Drift).
 * - **Nice:** feine Typo-/Spacing-/Formular-Rhythmus-Polish; echte Geräte-QA; kleine A11y-/Upload-/Pending-/Partial-
 *   Success-Polish — ohne neues Produktverhalten.
 * - **Future (eigene Roadmap/Infra):** Autosave; strukturiertere Temp-/Storage-Hygiene (z. B. Orphan-Cleanup-Jobs);
 *   größere Upload-/Dokument-Pipelines; Audit-/Historie; erweiterte Entwurfs-/Rollenmodelle; KI-/Automation nur mit
 *   klarem Vertrag — **nicht** still in diese Route hineinwachsen lassen.
 * - **Non-MVP (hier NICHT erweitern):** CRM-/Lead-Capture; mehrstufige Intake-Wizards; künstliche Produktivität/
 *   Gamification; KPI-/Analytics-Schicht in der Maske; AI-/Automation-Showcases; Realtime-Upload-Theater; Workflow-/
 *   Ops-/Plattform-Center — würden `/create-case` schnell **leadflow-/ticket-/startupig** machen.
 *
 * **Punkt 13 (Priorität — final):** **Realistische Einordnung:** unterstützender, **hochwertiger** Einstieg zur
 * **Inbox-/Weiterbearbeitung** — nicht Kern-Analytics, nicht Ops-Center, nicht Mandanten-„Plattform“-Motor.
 * - **P0 (unverändert kritisch):** Arzt-only + Workspace-Kohärenz (**Page + Action + Upload-API**); keine Regression bei
 *   Rolle, Session-Workspace, Temp-Pfad-Validierung, `createPracticeCase`-Insert/Move-Kette.
 * - **P1 (unverändert wichtig):** **Server-`loading.tsx`** und wahrnehmbare **Ruhe** beim ersten Öffnen (kein
 *   Shimmer-Realtime-Schein); Mobile-Sheet-Stabilität (Punkt 9) — **kein** Ersatz für P0.
 * - **Produktkritische Regressionen:** Nicht-Arzt kann Fall anlegen; falscher Workspace; manipulierte Temp-Pfade;
 *   Schein-Erfolg bei Anlagen; rohe Fehler/PII-Leaks; gebrochene Entwurf-/Speichern-Semantik.
 * - **Vor Pilot/Demo manuell:** Arzt vs. Team-Redirect; Entwurf nur Name/Kurznotiz; Speichern mit Name; 0/1/n Bilder;
 *   Teil-Erfolg-Anlagen-Hinweis; Abbrechen/`from`-Return; Mobile Keyboard + Scroll bis Fußzeile.
 * - **Bewusst stabil halten:** Kernfluss und Semantik — **keine** funktionale Erweiterung ohne Produktbeschluss
 *   (s. Punkt 12); Änderungen nur **P0/P1-Bugs**, kleine **Nice**-Polish oder **Future** außerhalb der Route.
 * - **QA / Storage-Hygiene / Monitoring / reale Nutzung:** Betrieb und Auswertung — **keine** verschleierte
 *   Produktentwicklung „nebenbei“ in dieser Maske.
 * - **Sofort CRM-/hektisch/intake-/startupig:** Autosave + Konflikt-UI; Wizard-Stufen; Lead-Scoring; Ticket-Pipeline-
 *   Sprache; Live-Upload-Fortschritt; Rollen-/Workflow-Konfiguratoren in der Maske.
 * - **Besonders schützen:** Ruhe, Ehrlichkeit, **ein** Formular, **ärztliche Dokumentation** statt Intake-Theater
 *   (Prioritätsregel: Stabilität und Fokus vor „Mächtigkeit“).
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
    <CreateCaseClient workspaceId={workspace.workspace_id} cancelHref={cancelHref} overlay="workspace" />
  );
}

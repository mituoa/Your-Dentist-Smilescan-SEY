import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { getCurrentWorkspace } from "@/lib/auth-helpers";
import { getProfileData, getSubmissionById } from "@/lib/queries/submissions";
import { CaseCreatedToast } from "@/components/inbox/case-created-toast";
import { PhotoViewer } from "@/components/inbox/photo-viewer";
import { SubmissionActions } from "@/components/inbox/submission-actions";
import { TrackerPrimaryActions } from "@/components/inbox/tracker-primary-actions";
import { TrackerUrgencyChips } from "@/components/inbox/tracker-urgency-chips";
import { InboxAssistHydration } from "@/components/command-assist/inbox-assist-hydration";
import { InboxMobileBack } from "@/components/inbox/inbox-mobile-back";
import { markSubmissionSeen } from "./actions";

/**
 * **`/inbox/[id]` — Punkt 1 (Zweck):** **Fall-Detail** zur **Triage** einer Einsendung im aktuellen
 * Workspace: Fotos, Patientennotiz, **Einordnung** (vom Team gesetzter Zeitraum) und **Arbeitsschritte**.
 * **Kein** CRM, **kein** Chat, **keine** vollständige Patientenakte, **kein**
 * Marketing-/Messaging-Center — nur das, was für die **Pilot-Intake-Kette** nötig ist
 * (**Triage + kontrollierte Praxis-Kommunikation**).
 *
 * **Kommunikation:** Rechte Spalte = **Hilfsbereich** (Textentwürfe kopieren, Terminlink per expliziter
 * Aktion) — **kein** Kanalpostfach, **kein** Auto-SMS; Versand nur dort, wo die UI eine **bewusste**
 * Aktion auslöst (z. B. Terminlink-E-Mail durch Klick). **Command** (systemweite Leiste): Entwürfe
 * und Navigation, **ohne** automatischen Versand — s. `components/command-assist/command-assist.tsx`.
 *
 * **Workspace:** Fremde oder nicht zugeordnete Submissions → `notFound()` (Filter in
 * `getSubmissionById` + RLS).
 *
 * **Punkt 2 — Status (Stabilität / working → final):** Route ist **final nutzbar**, solange
 * Submission zum Workspace gehört. **Server-Page** lädt Daten **atomar** pro Request (kein
 * clientseitiges „Falschen Fall“ aus Cache-Konflikten mit der URL). **Loading:** `loading.tsx` zeigt
 * `ClinicalInboxDetailSkeleton` für Streaming/Navigation. **Mobil:** Vollbild-Detail mit
 * `InboxMobileBack` → Liste; `q` aus der Liste bleibt über normalisierte Query erhalten.
 * **Leere Teilzustände:** keine Fotos = sachlicher Hinweis; fehlende `signed_url` = Hinweis im Viewer
 * (kein harter Fehlerzustand); Notiz leer = **„Keine Patientennotiz.“** — s. Punkt 7. **ZIP-Download** nutzt dieselbe
 * `submissionId` wie die Page. Transiente DB-Fehler bei `getSubmissionById` sind aktuell wie
 * „nicht gefunden“ behandelt (`notFound`) — bewusst simpel; Monitoring über Server-Logs.
 *
 * **Punkt 3 — Supabase/Auth:** Daten nur über **Session-Client** + explizite **`workspace_id`**-Filter
 * (`getSubmissionById`, `getProfileData`). **RLS** ergänzt die App-Guards (Migration **030** für
 * `current_workspace_id()` — s. `lib/auth-helpers.ts`). **Server-Actions** in `./actions.ts`:
 * `markSubmissionSeen` / `updateSubmissionUrgency` / `createTask` / `downloadSubmissionPhotos` /
 * `sendAppointmentLink` prüfen **Workspace** (und wo nötig **Rolle**); `createTask` verifiziert
 * zusätzlich, dass die **Submission** zum Workspace gehört (RLS-INSERT auf `tasks` allein reicht nicht).
 * `submitInboxTaskForReview` prüft **Task + Submission + Workspace** vor dem Statuswechsel.
 * **Signed URLs** / Storage-ZIP: nur Pfade aus der zuvor workspace-gefilterten Abfrage; Admin-Client
 * nur für Sign/Download, nicht für breitere Reads. **UI:** keine rohen DB-Fehlertexte.
 *
 * **Punkt 4 — Aktionen:** **Echte** Schritte: Dringlichkeit speichern (`TrackerUrgencyChips`), Navigation
 * zu Entwurf/Terminlink (`TrackerPrimaryActions`), ZIP-Export (`PhotoViewer`), Terminlink-E-Mail
 * (`AppointmentLinkButton`, nur Arzt), Entwurf kopieren (`FollowUpMessageDraft`). **Command:** FAB +
 * Schnelltexte = **Entwurfshilfe**, keine Autonomie (s. `command-assist.tsx`). Keine toten CTAs ohne
 * Wirkung — Primärbuttons scrollen bewusst zu Zielankern; kein Auto-Versand.
 *
 * **Punkt 5 — Tot/Fake:** Keine **automatische** klinische Bewertung — Kopfzeilen-Texte zur Dringlichkeit
 * beziehen sich auf die **von der Praxis gewählte Einstufung**, nicht auf KI-Diagnostik. Leere Notiz =
 * sachlicher Hinweis, kein „Platzhalter-Inhalt“. Command: **Entwurfsbausteine** und Navigation, keine
 * **Schnellaktions-/Ops-Center**-Sprache.
 *
 * **Punkt 6 — Loading:** `loading.tsx` + `ClinicalInboxDetailSkeleton` — **statische** Balken, **kein**
 * Puls, keine Chat-/CRM-Gerüste; Desktop **Hilfsspalte** als schmales Platzhalter-Segment gegen Layout-Sprung.
 *
 * **Punkt 7 — Empty:** Leer ist **normal**, nicht fehlerhaft: keine Fotos / keine Patientennotiz /
 * fehlende Kontaktdaten / **Einordnung (Zeitraum) noch nicht gewählt** sind klar beschriftet (s.
 * `PhotoViewer`, Haupttext, `SubmissionMeta`). **Kein** Chat-Verlauf — die Spalte rechts ist immer
 * **Entwurf + Terminlink**, nie eine leere „Konversation“.
 *
 * **Punkt 8 — Error:** **Fremder oder nicht zugehöriger Fall** → `notFound()` (kein Leak fremder
 * Daten). **Page-Load-DB-Fehler** werden bewusst wie „nicht gefunden“ behandelt (`notFound`) — ruhig,
 * **ohne** rohe PostgREST-/SQL-Texte in der UI (Monitoring über Server-Logs). **Server-Actions**
 * (`./actions.ts`) liefern nur **feste deutsche Kurzmeldungen**; technische Details nur serverseitig
 * (`logPostgrest`). ZIP-Kurzmeldungen zusätzlich zentral in `lib/inbox/submission-photo-download-errors.ts`.
 * **`markSubmissionSeen`:** stiller Best-Effort — bei Fehlern **kein** UI-Banner
 * (Lesemarkierung ist unkritisch). **Teilfehler:** z. B. fehlende Foto-Vorschau oder fehlgeschlagener
 * ZIP-/E-Mail-/Zeitraum-Schritt je **lokal** am jeweiligen Control mit sachlicher Meldung und
 * `aria-live` wo nötig — kein globaler Alarm. **Empty vs. Error:** Leere Listen/Texte = Punkt 7;
 * Fehler nur, wenn eine **konkrete Nutzeraktion** fehlschlägt.
 *
 * **Punkt 9 — Mobile (`/inbox/[id]`):** Vollbild-Detail in `InboxTrackerShell` — **eine Spalte**,
 * **Sticky-Kopf** (`max-lg:`) mit **`min-w-0` / `break-words`**; **unteres Scroll-Padding** + **`scroll-padding`**
 * (FAB/Safe-Area). **Touch:** Schnellnavigation & ZIP **≥44px**. Hilfsspalte: **`overscroll-y-contain`**,
 * Safe-Area unten, **`scroll-padding`** im inneren Scroll. **Final:** Entwurf **16px** Schrift (kein iOS-Zoom),
 * bei Fokus **`scrollIntoView`** (`FollowUpMessageDraft`).
 *
 * **Punkt 10 — Security (`/inbox/[id]`):** **Workspace:** `getSubmissionById(id, workspace_id)` +
 * `notFound` bei Fremdfall; `getProfileData(workspace_id)` nur aus Server-Workspace.
 * **RLS** (u. a. `submission_photos` über Submission) ergänzt App-Queries. **Actions** (`./actions.ts`):
 * `workspace_id`-Filter bzw. vorherige **Submission-Zugehörigkeit** (`createTask`, `sendAppointmentLink`,
 * `downloadSubmissionPhotos`); `submitInboxTaskForReview` bindet **`taskId` + `submissionId`** +
 * Workspace vor `submitTaskForReview`. **ZIP/Sign:** Pfade nur serverseitig nach workspace-geprüfter
 * Submission; **Client** erhält Fotos ohne `storage_path` (nur `id`, `sort_order`, `signed_url`).
 * **Fehlersemantik:** feste deutsche Kurzmeldungen, kein Roh-PostgREST in UI; Server-Logs ohne
 * PostgREST-Message-Body in `getSubmissionById` / `getTasksForSubmission` (nur `code`). **Layout:**
 * `dynamic = "force-dynamic"` im Inbox-Layout — kein statischer Cache der Shell über Mandanten.
 * **Command:** `InboxAssistHydration` setzt Kontext bei Unmount zurück — kein Nachziehen fremder
 * Fälle in die Leiste nach Navigation.
 *
 * **Punkt 11 — MVP / Pilot (`/inbox/[id]`):** **Im Scope:** Triage (Fotos, Notiz, **vom Team gewählter**
 * Zeitraum), **interne** Arbeitsschritte, **Hilfe** zur Patienten-Rückmeldung (**nur Entwurf + Kopie**;
 * Terminlink **nur** nach explizitem Klick durch Ärztin/Arzt). **Command:** Textbausteine & Navigation,
 * **kein** Versand, **keine** KI-Einordnung. **Bewusst nicht im MVP:** vollständige Patientenakte,
 * CRM-/Supportdesk-Postfach, Audit-Log-Produkt, automatisierte klinische Bewertung, Messaging-Pipeline,
 * KI-Autonomie — s. auch `layout.tsx` Punkt 12. **Pilot-Reife:** keine toten Kernpfade; leere Zustände
 * sachlich (Punkt 7); Erwartung „kein Auto-Versand“ mehrfach klar (Hilfsspalte + Entwurf-Bereich).
 *
 * **Punkt 12 — Nice / Future / Non-MVP (`/inbox/[id]`):** Deckungsgleich mit **`layout.tsx` Punkt 12**
 * (Liste + Detail). **Nice** hier besonders: Geräte-QA auf Entwurf/Scroll, PhotoViewer-/ZIP-Polish,
 * `aria-live`/Fokus-Feinschliff. **Future** hier besonders: Thread-Historie, Akte, KI-Einordnung,
 * Versand-Pipeline — nur mit Roadmap. **Non-MVP** hier besonders: alles Postfach-/CRM-/Auto-KI-nahe;
 * bei Zweifel **MVP-Grenze** (Punkt 11) schützen.
 *
 * **Punkt 13 — Priorität (`/inbox/[id]`):** Vollständiger **P0-/Stabilisierungs-Vertrag** s.
 * **`layout.tsx` Punkt 13** — Detail ist **kein** separater niedrigerer Prio-Track, sondern **Teil
 * desselben Intake-P0** wie die Liste. **Hier besonders schützen:** Workspace-Isolation (`notFound`,
 * Actions), **Entwurf ≠ Versand**, keine UI, die Kanal/CRM vortäuscht, **ruhige** Fehler/Empty,
 * Mobile-Kernpfade. **Kein aktives Feature-Weiterbauen** ohne Auftrag; Regressionen aus Punkt 13
 * Layout gelten **1:1** für diese Route. Konflikt: **Stabilität vor Plattform** (s. Layout).
 */
interface InboxDetailPageProps {
  params: Promise<{ id: string }>;
}

/** Horizontale Innenabstände — Figma: 56px Desktop, adaptiv kleiner. */
const padX = "clamp(20px, 4vw, 56px)";

function formatRelativeTime(timestamp: string): string {
  const now = new Date();
  const then = new Date(timestamp);
  const diffMs = now.getTime() - then.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMin < 1) return "Vor wenigen Sekunden";
  if (diffMin < 60) return `Vor ${diffMin} Minuten`;
  if (diffHours < 24) return `Vor ${diffHours} Stunden`;
  if (diffDays === 1) return "Gestern";
  if (diffDays < 7) return `Vor ${diffDays} Tagen`;
  return then.toLocaleDateString("de-DE", { day: "numeric", month: "short" });
}

function deriveIssue(
  patientNotes: string | null,
  patientName: string | null
): string {
  const raw = (patientNotes || "").trim();
  if (raw) {
    const firstSentence = raw.split("\n")[0]?.split(".")[0]?.trim();
    if (firstSentence) {
      return firstSentence.length > 120
        ? `${firstSentence.slice(0, 120).trim()}…`
        : firstSentence;
    }
  }
  const n = (patientName || "").trim();
  if (n) return n.length > 120 ? `${n.slice(0, 120).trim()}…` : n;
  return "Einsendung";
}

function formatBirthDe(value: string | null): string | null {
  if (!value) return null;
  const part = value.split("T")[0];
  const [y, m, d] = part.split("-").map((x) => parseInt(x, 10));
  if (!y || !m || !d) return null;
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("de-DE", {
    day: "numeric",
    month: "numeric",
    year: "numeric",
  });
}

/** Kopfzeile: bezieht sich auf die **vom Team gesetzte** Dringlichkeit — keine automatische KI-Bewertung. */
function urgencyHeadline(urgency: string | null): {
  text: string;
} | null {
  switch (urgency) {
    case "today":
      return { text: "Praxis-Einstufung: zeitnah bearbeiten (Heute)" };
    case "this_week":
      return { text: "Praxis-Einstufung: innerhalb weniger Tage" };
    case "not_urgent":
      return { text: "Praxis-Einstufung: nicht dringend" };
    default:
      return null;
  }
}

/** Kurz-Hinweis unter der Einordnung — Orientierung, ärztliche Entscheidung bleibt bei der Praxis. */
function urgencyGuidanceShort(urgency: string | null): string {
  switch (urgency) {
    case "today":
      return "Kurzfristiger Termin ist oft sinnvoll — bitte ärztlich entscheiden.";
    case "this_week":
      return "Termin in wenigen Tagen oft angemessen — individuell prüfen.";
    case "not_urgent":
      return "Regulärer Terminabstand meist ausreichend.";
    default:
      return "Zeitraum unten wählen — keine automatische Bewertung.";
  }
}

export default async function InboxDetailPage({
  params,
}: InboxDetailPageProps) {
  const { id } = await params;
  const workspace = await getCurrentWorkspace();

  if (!workspace) {
    redirect("/login?error=workspace_missing");
  }

  const submission = await getSubmissionById(id, workspace.workspace_id);

  if (!submission || submission.workspace_id !== workspace.workspace_id) {
    notFound();
  }

  const profileRow = await getProfileData(workspace.workspace_id);

  if (!submission.seen_at) {
    markSubmissionSeen(id).catch(() => {});
  }

  const isDoctor = workspace.role === "doctor";
  const concernPreview = deriveIssue(submission.patient_notes, submission.patient_name);
  const patientLabel = submission.patient_name || "Unbekannter Patient";
  const birthStr = formatBirthDe(submission.patient_birth_date);
  const idStr = submission.patient_external_id?.trim() || null;
  const patientMetaParts: string[] = [];
  if (birthStr) patientMetaParts.push(birthStr);
  if (idStr) patientMetaParts.push(`ID: ${idStr}`);
  const patientMeta = patientMetaParts.join(" · ");
  const urgencyLine = urgencyHeadline(submission.urgency);
  const guidanceShort = urgencyGuidanceShort(submission.urgency);
  const practicePhone = profileRow?.practice_phone ?? null;
  const appointmentUrl = profileRow?.appointment_link ?? null;

  const issueTitle =
    concernPreview && concernPreview !== patientLabel ? concernPreview : patientLabel;

  const scrollPadTop = urgencyLine ? "24px" : "32px";
  const scrollPad = {
    paddingTop: scrollPadTop,
    paddingLeft: padX,
    paddingRight: padX,
  };

  return (
    <>
      <InboxAssistHydration
        submissionId={submission.id}
        patientName={submission.patient_name}
        urgency={submission.urgency}
        practicePhone={practicePhone}
        appointmentUrl={appointmentUrl}
        concernLine={concernPreview}
      />
      <CaseCreatedToast />

      {/* Desktop: Triage-Hauptfläche + Hilfsspalte (Entwürfe/Terminlink). Mobil: eine Spalte, Fullscreen-Flow. */}
      <div className="flex h-full min-h-0 flex-1 touch-manipulation flex-col overflow-x-hidden overflow-y-hidden lg:flex-row">
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-[#F7F9FC]">
          {/* Detail-Header — mobil: kompakteres Padding, Sticky; Desktop: Figma-Abstände */}
          <div
            className="z-[6] shrink-0 bg-white px-[clamp(20px,4vw,56px)] pb-2 pt-4 max-lg:sticky max-lg:top-0 max-lg:border-b max-lg:border-[rgba(15,23,42,0.06)] max-lg:shadow-[0_1px_0_rgba(15,23,42,0.06)] sm:pt-5 sm:pb-3 lg:static lg:border-b-0 lg:pb-0 lg:pt-[clamp(28px,5vw,48px)] lg:shadow-none"
          >
            <Suspense fallback={null}>
              <InboxMobileBack />
            </Suspense>
            <h2
              className="min-w-0 break-words text-[22px] sm:text-[24px]"
              style={{
                color: "#0F172A",
                fontWeight: 600,
                letterSpacing: "-0.02em",
                marginBottom: "8px",
                lineHeight: 1.3,
              }}
            >
              {issueTitle}
            </h2>

            <p
              className="min-w-0 break-words text-[14px]"
              style={{
                color: "#64748B",
                fontWeight: 500,
                letterSpacing: "-0.005em",
              }}
            >
              {patientLabel} · Eingang {formatRelativeTime(submission.created_at)}
              {submission.is_draft ? (
                <span className="ml-2 text-[12px]" style={{ color: "#B45309" }}>
                  Entwurf
                </span>
              ) : null}
            </p>

            {patientMeta ? (
              <p
                className="text-[13px] break-words"
                style={{
                  color: "#94A3B8",
                  fontWeight: 400,
                  letterSpacing: "-0.003em",
                  marginTop: "4px",
                }}
              >
                {patientMeta}
              </p>
            ) : null}

            {submission.patient_email || submission.patient_phone ? (
              <p
                className="mt-3 min-w-0 break-words text-[13px] leading-relaxed"
                style={{ color: "#64748B", fontWeight: 400 }}
              >
                {submission.patient_email ? (
                  <span className="block break-words md:mr-3 md:inline-block">
                    {submission.patient_email}
                  </span>
                ) : null}
                {submission.patient_phone ? (
                  <span className="block break-words max-md:mt-1 md:inline">{submission.patient_phone}</span>
                ) : null}
              </p>
            ) : null}

            {urgencyLine ? (
              <div className="mt-3 pb-3 lg:mt-6 lg:pb-6">
                <p
                  className="text-[14px]"
                  style={{
                    color: "#2563EB",
                    lineHeight: 1.5,
                    letterSpacing: "-0.005em",
                    fontWeight: 500,
                  }}
                >
                  {urgencyLine.text}
                </p>
              </div>
            ) : null}
          </div>

          {/* Scrollbarer Inhalt — Figma: background #FFFFFF, padding 24|32 / 56 / 56 */}
          <div
            className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-y-contain bg-white [-webkit-overflow-scrolling:touch] pb-10 max-md:pb-12 md:pb-24 max-lg:scroll-pb-[max(6.5rem,var(--safe-area-bottom))]"
            style={scrollPad}
          >
            <div className="mb-6 md:mb-8">
              <PhotoViewer
                submissionId={submission.id}
                photos={submission.photos.map(({ id, sort_order, signed_url }) => ({
                  id,
                  sort_order,
                  signed_url,
                }))}
                patientName={submission.patient_name || "Patient"}
              />
            </div>

            <div className="mb-8 min-w-0 max-w-[600px] md:mb-10">
              <p
                className="text-[15px]"
                style={{
                  color: "#1E293B",
                  lineHeight: 1.6,
                  letterSpacing: "-0.008em",
                }}
              >
                {submission.patient_notes?.trim()
                  ? submission.patient_notes
                  : "Keine Patientennotiz."}
              </p>
            </div>

            <div id="tracker-empfehlung" className="min-w-0 max-w-[520px] scroll-mt-16 md:scroll-mt-24">
              <div style={{ marginBottom: "16px" }}>
                <p
                  className="text-[13px]"
                  style={{
                    color: "#0A0F1A",
                    fontWeight: 700,
                    letterSpacing: "-0.01em",
                    marginBottom: "4px",
                  }}
                >
                  Einordnung & nächste Schritte
                </p>
                <p
                  className="text-[14px]"
                  style={{
                    color: "#64748B",
                    letterSpacing: "-0.005em",
                  }}
                >
                  {guidanceShort}
                </p>
              </div>

              <div
                style={{
                  background: "#F8FAFC",
                  padding: "20px",
                  borderRadius: "12px",
                }}
              >
                <TrackerPrimaryActions />

                <TrackerUrgencyChips
                  submissionId={submission.id}
                  initialUrgency={submission.urgency}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Hilfsspalte (Entwürfe/Terminlink) — Figma: schmale sekundäre Spalte, gleiche Canvas-Farbe */}
        <aside
          className="flex min-h-0 w-full shrink-0 flex-col overflow-hidden border-t border-[#E5E7EB] bg-[#F7F9FC] pb-[max(12px,var(--safe-area-bottom))] max-lg:min-h-0 lg:w-[min(100%,380px)] lg:max-w-[400px] lg:border-l lg:border-t-0 lg:pb-0"
        >
          <SubmissionActions
            submissionId={submission.id}
            patientName={submission.patient_name}
            patientEmail={submission.patient_email}
            patientPhone={submission.patient_phone}
            createdAt={submission.created_at}
            patientBirthDate={submission.patient_birth_date}
            patientExternalId={submission.patient_external_id}
            urgency={submission.urgency}
            isDraft={submission.is_draft}
            seenAt={submission.seen_at}
            updatedAt={submission.updated_at}
            photoCount={submission.photos.length}
            canSendAppointmentLink={isDoctor}
            practicePhone={practicePhone}
            appointmentUrl={appointmentUrl}
          />
        </aside>
      </div>
    </>
  );
}

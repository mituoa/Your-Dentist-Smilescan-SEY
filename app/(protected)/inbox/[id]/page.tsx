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
 * **Leere Teilzustände:** keine Fotos = sachliche Leerfläche; fehlende `signed_url` = Hinweis im Viewer
 * (kein harter Fehlerzustand); Notiz leer = neutraler Satz. **ZIP-Download** nutzt dieselbe
 * `submissionId` wie die Page. Transiente DB-Fehler bei `getSubmissionById` sind aktuell wie
 * „nicht gefunden“ behandelt (`notFound`) — bewusst simpel; Monitoring über Server-Logs.
 *
 * **Punkt 3 — Supabase/Auth:** Daten nur über **Session-Client** + explizite **`workspace_id`**-Filter
 * (`getSubmissionById`, `getProfileData`). **RLS** ergänzt die App-Guards (Migration **030** für
 * `current_workspace_id()` — s. `lib/auth-helpers.ts`). **Server-Actions** in `./actions.ts`:
 * `markSubmissionSeen` / `updateSubmissionUrgency` / `createTask` / `downloadSubmissionPhotos` /
 * `sendAppointmentLink` prüfen **Workspace** (und wo nötig **Rolle**); `createTask` verifiziert
 * zusätzlich, dass die **Submission** zum Workspace gehört (RLS-INSERT auf `tasks` allein reicht nicht).
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

  const headerPad = { padding: `clamp(28px, 5vw, 48px) ${padX} 0` };
  const scrollPadTop = urgencyLine ? "24px" : "32px";
  const scrollPad = {
    padding: `${scrollPadTop} ${padX} clamp(72px, 18vw, 120px)`,
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
          {/* Detail-Header — Desktop unverändert; Tablet/Phone: sticky für Kontext beim Scrollen */}
          <div
            className="z-[6] shrink-0 bg-white max-lg:sticky max-lg:top-0 max-lg:shadow-[0_1px_0_rgba(15,23,42,0.06)] lg:static lg:shadow-none"
            style={headerPad}
          >
            <Suspense fallback={null}>
              <InboxMobileBack />
            </Suspense>
            <h2
              className="text-[22px] sm:text-[24px]"
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
              className="text-[14px]"
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
                className="text-[13px]"
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
                className="mt-3 text-[13px] leading-relaxed"
                style={{ color: "#64748B", fontWeight: 400 }}
              >
                {submission.patient_email ? (
                  <span className="mr-3 inline-block">{submission.patient_email}</span>
                ) : null}
                {submission.patient_phone ? <span>{submission.patient_phone}</span> : null}
              </p>
            ) : null}

            {urgencyLine ? (
              <div style={{ marginTop: "24px", paddingBottom: "24px" }}>
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
            className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto bg-white [-webkit-overflow-scrolling:touch] max-lg:scroll-pb-8"
            style={scrollPad}
          >
            <div style={{ marginBottom: "32px" }}>
              <PhotoViewer
                submissionId={submission.id}
                photos={submission.photos}
                patientName={submission.patient_name || "Patient"}
              />
            </div>

            <div style={{ marginBottom: "40px", maxWidth: "600px" }}>
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
                  : "Keine Beschreibung vorhanden."}
              </p>
            </div>

            <div id="tracker-empfehlung" className="scroll-mt-24" style={{ maxWidth: "520px" }}>
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
          className="flex min-h-0 w-full shrink-0 flex-col overflow-hidden border-t border-[#E5E7EB] bg-[#F7F9FC] pb-[max(12px,env(safe-area-inset-bottom))] max-lg:min-h-0 lg:w-[min(100%,380px)] lg:max-w-[400px] lg:border-l lg:border-t-0 lg:pb-0"
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

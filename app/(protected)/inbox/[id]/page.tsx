import { notFound, redirect } from "next/navigation";
import { getCurrentWorkspace } from "@/lib/auth-helpers";
import { getProfileData, getSubmissionById } from "@/lib/queries/submissions";
import { CaseCreatedToast } from "@/components/inbox/case-created-toast";
import { PhotoViewer } from "@/components/inbox/photo-viewer";
import { SubmissionActions } from "@/components/inbox/submission-actions";
import { TrackerPrimaryActions } from "@/components/inbox/tracker-primary-actions";
import { TrackerUrgencyChips } from "@/components/inbox/tracker-urgency-chips";
import { InboxAssistHydration } from "@/components/command-assist/inbox-assist-hydration";
import { markSubmissionSeen } from "./actions";

interface InboxDetailPageProps {
  params: Promise<{ id: string }>;
}

const card =
  "rounded-2xl border border-[rgba(15,23,42,0.07)] bg-white shadow-[0_1px_3px_rgba(15,23,42,0.04)]";

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

function urgencyHeadline(urgency: string | null): {
  text: string;
  color: string;
} | null {
  switch (urgency) {
    case "today":
      return {
        text: "Hohe Wahrscheinlichkeit für akuten Behandlungsbedarf",
        color: "#1D4ED8",
      };
    case "this_week":
      return {
        text: "Behandlung innerhalb dieser Woche sinnvoll",
        color: "#475569",
      };
    case "not_urgent":
      return {
        text: "Nicht dringend — routinemäßig planbar",
        color: "#64748B",
      };
    default:
      return null;
  }
}

function recommendedAction(urgency: string | null): string {
  switch (urgency) {
    case "today":
      return "Zeitnahe Kontaktaufnahme und klinische Einordnung innerhalb von 24 Stunden.";
    case "this_week":
      return "Rückmeldung und Terminierung innerhalb weniger Werktage.";
    case "not_urgent":
      return "Routinemäßige Terminierung nach Praxiskapazität.";
    default:
      return "Bitte Einsendung klinisch einordnen und den weiteren Verlauf dokumentieren.";
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

  const submission = await getSubmissionById(id);

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
  if (birthStr) patientMetaParts.push(`Geb. ${birthStr}`);
  if (idStr) patientMetaParts.push(`ID ${idStr}`);
  const patientMeta = patientMetaParts.join(" · ");
  const urgencyLine = urgencyHeadline(submission.urgency);
  const recAction = recommendedAction(submission.urgency);
  const practicePhone = profileRow?.practice_phone ?? null;
  const appointmentUrl = profileRow?.appointment_link ?? null;

  const primaryTitle =
    concernPreview && concernPreview !== patientLabel ? concernPreview : patientLabel;

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden lg:flex-row">
      <InboxAssistHydration
        submissionId={submission.id}
        patientName={submission.patient_name}
        urgency={submission.urgency}
        practicePhone={practicePhone}
        appointmentUrl={appointmentUrl}
        concernLine={concernPreview}
      />
      <CaseCreatedToast />

      {/* Mitte: medizinischer Hauptfall — Workspace-Dichte, klare Karten */}
      <div className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-[#E4E9F0] shadow-[inset_-1px_0_0_rgba(15,23,42,0.05)]">
        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto flex w-full max-w-[820px] flex-col gap-5 px-4 py-6 sm:px-6 sm:py-8 lg:max-w-none lg:px-8 lg:py-10 xl:pr-10">
            <div className={`${card} p-6 sm:p-8`}>
              <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-500">
                Aktueller Fall
              </p>
              <h1 className="mt-2 text-[26px] font-semibold leading-[1.2] tracking-[-0.02em] text-slate-900 sm:text-[28px]">
                {primaryTitle}
              </h1>

              <p className="mt-3 text-[15px] font-medium leading-snug text-slate-600">
                {patientLabel}
                <span className="mx-2 font-normal text-slate-400">·</span>
                <span className="font-normal text-slate-500">
                  Eingang {formatRelativeTime(submission.created_at)}
                </span>
                {submission.is_draft ? (
                  <span className="ml-2 rounded-md bg-amber-50 px-2 py-0.5 text-[12px] font-medium text-amber-800">
                    Entwurf
                  </span>
                ) : null}
              </p>

              {patientMeta ? (
                <p className="mt-2 text-[14px] text-slate-500">{patientMeta}</p>
              ) : null}

              {submission.patient_email || submission.patient_phone ? (
                <p className="mt-4 text-[14px] leading-relaxed text-slate-600">
                  {submission.patient_email ? (
                    <span className="mr-4 block sm:inline">{submission.patient_email}</span>
                  ) : null}
                  {submission.patient_phone ? <span>{submission.patient_phone}</span> : null}
                </p>
              ) : null}

              {urgencyLine ? (
                <div className="mt-6 border-t border-slate-100 pt-6">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                    Klinische Einschätzung
                  </p>
                  <p
                    className="mt-2 text-[16px] font-medium leading-snug"
                    style={{ color: urgencyLine.color }}
                  >
                    {urgencyLine.text}
                  </p>
                </div>
              ) : null}
            </div>

            <div className={`${card} overflow-hidden p-0`}>
              <PhotoViewer
                photos={submission.photos}
                patientName={submission.patient_name || "Patient"}
              />
            </div>

            <div className={`${card} p-6 sm:p-8`}>
              <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-500">
                Patientenbericht
              </p>
              <p className="mt-4 text-[16px] leading-[1.7] tracking-[-0.01em] text-slate-800">
                {submission.patient_notes?.trim()
                  ? submission.patient_notes
                  : "Keine Beschreibung vorhanden."}
              </p>
            </div>

            <div id="tracker-empfehlung" className={`${card} scroll-mt-24 p-6 sm:p-8`}>
              <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-500">
                Empfohlene Aktion
              </p>
              <p className="mt-2 text-[15px] leading-relaxed text-slate-600">{recAction}</p>

              <div className="mt-6 rounded-xl border border-slate-100 bg-slate-50/80 p-5 sm:p-6">
                <TrackerPrimaryActions />

                <p className="mb-3 mt-8 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                  Zeitraum (Einschätzung)
                </p>
                <TrackerUrgencyChips
                  submissionId={submission.id}
                  initialUrgency={submission.urgency}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Rechts: Kommunikation & Assist */}
      <aside className="flex min-h-0 w-full shrink-0 flex-col overflow-hidden border-t border-[rgba(15,23,42,0.07)] bg-[#ECEFF4] lg:w-[min(100%,400px)] lg:max-w-[420px] lg:border-l lg:border-t-0 xl:w-[min(100%,420px)]">
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
  );
}

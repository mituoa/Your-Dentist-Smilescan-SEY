import { notFound, redirect } from "next/navigation";
import { getCurrentWorkspace } from "@/lib/auth-helpers";
import {
  getProfileData,
  getSubmissionById,
} from "@/lib/queries/submissions";
import { CaseCreatedToast } from "@/components/inbox/case-created-toast";
import { PhotoViewer } from "@/components/inbox/photo-viewer";
import { SubmissionActions } from "@/components/inbox/submission-actions";
import { InboxAssistHydration } from "@/components/command-assist/inbox-assist-hydration";
import { markSubmissionSeen } from "./actions";

interface InboxDetailPageProps {
  params: Promise<{ id: string }>;
}

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
      return firstSentence.length > 64
        ? `${firstSentence.slice(0, 64).trim()}…`
        : firstSentence;
    }
  }
  const n = (patientName || "").trim();
  if (n) return n.length > 64 ? `${n.slice(0, 64).trim()}…` : n;
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
        color: "#2F80ED",
      };
    case "this_week":
      return {
        text: "Behandlung innerhalb dieser Woche sinnvoll",
        color: "#64748B",
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
      return "Klinische Empfehlung: zeitnahe Kontaktaufnahme und Einordnung innerhalb von 24 Stunden.";
    case "this_week":
      return "Klinische Empfehlung: Rückmeldung und Terminierung innerhalb weniger Werktage.";
    case "not_urgent":
      return "Klinische Empfehlung: routinemäßige Terminierung nach Praxiskapazität.";
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

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-white md:flex-row">
      <InboxAssistHydration
        submissionId={submission.id}
        patientName={submission.patient_name}
        urgency={submission.urgency}
        practicePhone={practicePhone}
        appointmentUrl={appointmentUrl}
        concernLine={concernPreview}
      />
      <CaseCreatedToast />

      {/* Mitte: Fallinhalt */}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <div
          className="shrink-0"
          style={{
            padding: "28px 32px 22px",
            borderBottom: "1px solid #EEF2F6",
            background: "#FFFFFF",
          }}
        >
          <p
            className="mb-2 text-[12px] font-medium uppercase tracking-wider"
            style={{ color: "#94A3B8" }}
          >
            Patient
          </p>
          <h2
            className="text-[24px] md:text-[26px]"
            style={{
              color: "#0F172A",
              fontWeight: 600,
              letterSpacing: "-0.01em",
              marginBottom: "6px",
              lineHeight: "1.3",
            }}
          >
            {patientLabel}
          </h2>
          {patientMeta ? (
            <p className="text-[14px]" style={{ color: "#64748B" }}>
              {patientMeta}
            </p>
          ) : null}
          {(submission.patient_email || submission.patient_phone) ? (
            <p className="mt-2 text-[14px]" style={{ color: "#64748B" }}>
              {submission.patient_email ? (
                <span className="mr-3">{submission.patient_email}</span>
              ) : null}
              {submission.patient_phone ? <span>{submission.patient_phone}</span> : null}
            </p>
          ) : null}
          <p className="mt-3 text-[13px]" style={{ color: "#94A3B8" }}>
            Eingang {formatRelativeTime(submission.created_at)}
            {submission.is_draft ? (
              <span
                className="ml-2 rounded-md px-2 py-0.5 text-[12px] font-medium"
                style={{ background: "#FFFBEB", color: "#92400E" }}
              >
                Entwurf
              </span>
            ) : null}
          </p>
          {concernPreview && concernPreview !== patientLabel ? (
            <p
              className="mt-4 text-[15px] font-medium leading-snug"
              style={{ color: "#334155" }}
            >
              {concernPreview}
            </p>
          ) : null}
          {urgencyLine ? (
            <p className="mt-3 text-[14px] font-medium" style={{ color: urgencyLine.color }}>
              {urgencyLine.text}
            </p>
          ) : null}
        </div>

        <div
          className="min-h-0 flex-1 overflow-y-auto"
          style={{ padding: "28px 32px 40px", background: "#FFFFFF" }}
        >
          <div className="mx-auto max-w-[720px]">
            <div className="mb-8">
              <div
                style={{
                  borderRadius: "12px",
                  overflow: "hidden",
                  border: "1px solid #EEF2F6",
                  maxHeight: "320px",
                  background: "#FFFFFF",
                }}
              >
                <PhotoViewer
                  photos={submission.photos}
                  patientName={submission.patient_name || "Patient"}
                />
              </div>
            </div>

            <div className="mb-10">
              <p
                className="text-[11px] uppercase"
                style={{
                  color: "#94A3B8",
                  fontWeight: 600,
                  letterSpacing: "0.05em",
                  marginBottom: "12px",
                }}
              >
                Beschreibung
              </p>
              <p className="text-[16px] leading-[1.65]" style={{ color: "#1E293B" }}>
                {submission.patient_notes?.trim()
                  ? submission.patient_notes
                  : "Keine Beschreibung vorhanden."}
              </p>
            </div>

            <div
              className="border-t pt-10"
              style={{ borderColor: "#EEF2F6" }}
            >
              <p className="text-[15px] leading-relaxed" style={{ color: "#475569" }}>
                {recAction}
              </p>
              <p
                className="mt-8 text-[11px] uppercase"
                style={{
                  color: "#94A3B8",
                  fontWeight: 600,
                  letterSpacing: "0.05em",
                  marginBottom: "12px",
                }}
              >
                Zeitraum (Einschätzung)
              </p>
              <div className="flex flex-wrap gap-2">
                {(
                  [
                    { id: "today", label: "Heute" },
                    { id: "this_week", label: "Diese Woche" },
                    { id: "not_urgent", label: "Nicht dringend" },
                  ] as const
                ).map((opt) => {
                  const active = submission.urgency === opt.id;
                  return (
                    <span
                      key={opt.id}
                      className="rounded-[10px] border px-4 py-2 text-[14px] font-medium"
                      style={{
                        borderColor: active ? "#2F80ED" : "#E2E8F0",
                        background: active ? "rgba(47,128,237,0.08)" : "#FFFFFF",
                        color: active ? "#1C6FD8" : "#64748B",
                      }}
                    >
                      {opt.label}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Rechts: Kommunikation & Kontext */}
      <aside
        className="flex max-h-[52vh] min-h-0 w-full shrink-0 flex-col overflow-y-auto border-t border-border/70 bg-surface-page md:max-h-none md:w-[min(100%,420px)] md:max-w-[440px] md:border-l md:border-t-0"
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
  );
}

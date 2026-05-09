import { notFound, redirect } from "next/navigation";
import { getCurrentWorkspace } from "@/lib/auth-helpers";
import { getProfileData, getSubmissionById } from "@/lib/queries/submissions";
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
        color: "#2563EB",
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
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden md:flex-row">
      <InboxAssistHydration
        submissionId={submission.id}
        patientName={submission.patient_name}
        urgency={submission.urgency}
        practicePhone={practicePhone}
        appointmentUrl={appointmentUrl}
        concernLine={concernPreview}
      />
      <CaseCreatedToast />

      {/* Mitte: dominanter Fall-Workspace (Figma: weiße Fläche, viel Luft) */}
      <div
        className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden"
        style={{
          background: "#FFFFFF",
          boxShadow: "inset -1px 0 0 rgba(15, 23, 42, 0.04)",
        }}
      >
        <header className="shrink-0" style={{ padding: "40px clamp(24px,4vw,56px) 0" }}>
          <h1
            className="text-[22px] leading-[1.25] md:text-[24px]"
            style={{
              color: "#0F172A",
              fontWeight: 600,
              letterSpacing: "-0.02em",
              marginBottom: "8px",
            }}
          >
            {primaryTitle}
          </h1>

          <p
            className="text-[14px]"
            style={{ color: "#64748B", fontWeight: 500, letterSpacing: "-0.005em" }}
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
              className="mt-1 text-[13px]"
              style={{ color: "#94A3B8", fontWeight: 400, letterSpacing: "-0.003em" }}
            >
              {patientMeta}
            </p>
          ) : null}

          {(submission.patient_email || submission.patient_phone) ? (
            <p className="mt-3 text-[13px] leading-relaxed" style={{ color: "#64748B" }}>
              {submission.patient_email ? <span className="mr-3">{submission.patient_email}</span> : null}
              {submission.patient_phone ? <span>{submission.patient_phone}</span> : null}
            </p>
          ) : null}

          {urgencyLine ? (
            <div style={{ marginTop: "24px", paddingBottom: "8px" }}>
              <p
                className="text-[14px] leading-[1.5]"
                style={{
                  color: urgencyLine.color,
                  fontWeight: 500,
                  letterSpacing: "-0.005em",
                }}
              >
                {urgencyLine.text}
              </p>
            </div>
          ) : null}
        </header>

        <div
          className="min-h-0 flex-1 overflow-y-auto"
          style={{
            padding: "24px clamp(24px,4vw,56px) 56px",
            background: "#FFFFFF",
          }}
        >
          <div className="mb-8">
            <div
              style={{
                borderRadius: "12px",
                overflow: "hidden",
                maxHeight: "240px",
                background: "#F8FAFC",
              }}
            >
              <PhotoViewer
                photos={submission.photos}
                patientName={submission.patient_name || "Patient"}
              />
            </div>
          </div>

          <div style={{ marginBottom: "40px", maxWidth: "640px" }}>
            <p
              className="text-[15px] md:text-[16px]"
              style={{
                color: "#1E293B",
                lineHeight: 1.65,
                letterSpacing: "-0.008em",
              }}
            >
              {submission.patient_notes?.trim()
                ? submission.patient_notes
                : "Keine Beschreibung vorhanden."}
            </p>
          </div>

          <div style={{ maxWidth: "560px" }}>
            <div style={{ marginBottom: "16px" }}>
              <p
                className="text-[13px]"
                style={{ color: "#0F172A", fontWeight: 700, letterSpacing: "-0.01em" }}
              >
                Empfohlene Einordnung
              </p>
              <p
                className="mt-1 text-[14px] leading-relaxed"
                style={{ color: "#64748B", letterSpacing: "-0.005em" }}
              >
                {recAction}
              </p>
            </div>

            <div
              style={{
                background: "#F8FAFC",
                padding: "20px",
                borderRadius: "12px",
              }}
            >
              <p
                className="mb-3 text-[12px]"
                style={{ color: "#94A3B8", fontWeight: 500, letterSpacing: "0.02em" }}
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
                      className="text-[13px] font-medium"
                      style={{
                        padding: "6px 12px",
                        borderRadius: "6px",
                        border: active ? "1px solid #2B6FE8" : "1px solid #E5E7EB",
                        background: active ? "#EEF6FF" : "#FFFFFF",
                        color: active ? "#2B6FE8" : "#64748B",
                        letterSpacing: "-0.005em",
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

      {/* Rechts: Kommunikationszentrale — weiche Fläche, weniger „Formular“ */}
      <aside
        className="flex min-h-0 w-full shrink-0 flex-col overflow-y-auto border-t border-[rgba(15,23,42,0.06)] md:w-[min(380px,34vw)] md:max-w-[400px] md:border-l md:border-t-0 md:border-[rgba(15,23,42,0.06)]"
        style={{ background: "#F5F7FA" }}
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

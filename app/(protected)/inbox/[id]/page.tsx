import { notFound, redirect } from "next/navigation";
import { getCurrentUser, getCurrentWorkspace } from "@/lib/auth-helpers";
import {
  getSubmissionById,
  getTasksForSubmission,
} from "@/lib/queries/submissions";
import { getAssignableWorkspaceMembers } from "@/lib/queries/team-members";
import { PhotoViewer } from "@/components/inbox/photo-viewer";
import { SubmissionActions } from "@/components/inbox/submission-actions";
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
      return "Empfohlene Aktion: Termin in den nächsten 24 Stunden sinnvoll.";
    case "this_week":
      return "Empfohlene Aktion: Termin innerhalb der nächsten Tage sinnvoll.";
    case "not_urgent":
      return "Empfohlene Aktion: Termin nach Kapazität planen.";
    default:
      return "Empfohlene Aktion: Nach klinischer Einschätzung weiterverfolgen.";
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

  const user = await getCurrentUser();
  const [tasks, assignableMembers] = await Promise.all([
    getTasksForSubmission(id),
    getAssignableWorkspaceMembers(workspace.workspace_id, user?.id),
  ]);
  const openTasks = tasks.filter((task) => task.status === "open").length;
  const pendingTasks = tasks.filter(
    (task) => task.status === "pending_review"
  ).length;
  const doneTasks = tasks.filter((task) => task.status === "done").length;

  if (!submission.seen_at) {
    markSubmissionSeen(id).catch(() => {});
  }

  const isDoctor = workspace.role === "doctor";
  const issueTitle = deriveIssue(submission.patient_notes, submission.patient_name);
  const patientLabel = submission.patient_name || "Unbekannter Patient";
  const metaLabel = `${patientLabel} · ${formatRelativeTime(submission.created_at)}`;
  const birthStr = formatBirthDe(submission.patient_birth_date);
  const idStr = submission.patient_external_id?.trim() || null;
  const secondMetaParts: string[] = [];
  if (birthStr) secondMetaParts.push(birthStr);
  if (idStr) secondMetaParts.push(`ID: ${idStr}`);
  const secondMeta = secondMetaParts.join(" · ");
  const urgencyLine = urgencyHeadline(submission.urgency);
  const recAction = recommendedAction(submission.urgency);

  return (
    <div className="flex h-full flex-col overflow-hidden" style={{ background: "#FFFFFF" }}>
      {/* Detail Header */}
      <div
        style={{
          padding: "32px 40px 24px",
          borderBottom: "1px solid #EEF2F6",
          background: "#FFFFFF",
        }}
      >
        <h2
          className="text-[26px]"
          style={{
            color: "#0F172A",
            fontWeight: 600,
            letterSpacing: "-0.01em",
            marginBottom: "8px",
            lineHeight: "1.3",
          }}
        >
          {issueTitle}
        </h2>
        <p className="text-[14px]" style={{ color: "#64748B" }}>
          {metaLabel}
          {submission.is_draft ? (
            <span className="ml-2 text-[12px] font-medium text-amber-700">Entwurf</span>
          ) : null}
        </p>
        {secondMeta ? (
          <p className="mt-1 text-[14px]" style={{ color: "#64748B" }}>
            {secondMeta}
          </p>
        ) : null}
        {urgencyLine ? (
          <p className="mt-2 text-[14px] font-medium" style={{ color: urgencyLine.color }}>
            {urgencyLine.text}
          </p>
        ) : null}
      </div>

      {/* Scrollable Content */}
      <div
        className="flex-1 overflow-y-auto"
        style={{ padding: "32px 40px 40px", background: "#FFFFFF" }}
      >
        {/* Images */}
        <div style={{ marginBottom: "32px" }}>
          <div
            style={{
              borderRadius: "12px",
              overflow: "hidden",
              border: "1px solid #EEF2F6",
              maxHeight: "300px",
              background: "#FFFFFF",
            }}
          >
            <PhotoViewer
              photos={submission.photos}
              patientName={submission.patient_name || "Patient"}
            />
          </div>
        </div>

        {/* Description */}
        <div style={{ marginBottom: "32px", maxWidth: "600px" }}>
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
          <p className="text-[15px]" style={{ color: "#1E293B", lineHeight: "1.6" }}>
            {submission.patient_notes?.trim()
              ? submission.patient_notes
              : "Keine Beschreibung vorhanden."}
          </p>
        </div>

        {/* Actions + workflow */}
        <div style={{ maxWidth: "600px" }}>
          <div style={{ borderTop: "1px solid #EEF2F6", paddingTop: "32px" }}>
            <p className="text-[14px] leading-relaxed" style={{ color: "#475569", marginBottom: "20px" }}>
              {recAction}
            </p>

            <p
              className="text-[11px] uppercase"
              style={{
                color: "#94A3B8",
                fontWeight: 600,
                letterSpacing: "0.05em",
                marginBottom: "10px",
              }}
            >
              Zeitraum (Einschätzung)
            </p>
            <div className="mb-8 flex flex-wrap gap-2">
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

            <p
              className="text-[11px] uppercase"
              style={{
                color: "#94A3B8",
                fontWeight: 600,
                letterSpacing: "0.05em",
                marginBottom: "16px",
              }}
            >
              Nächste Schritte
            </p>

            <div style={{ marginTop: "0" }}>
              <SubmissionActions
                submissionId={submission.id}
                patientName={submission.patient_name}
                patientEmail={submission.patient_email}
                patientPhone={submission.patient_phone}
                createdAt={submission.created_at}
                tasks={tasks}
                assignableMembers={assignableMembers}
                canCheckOff
                canSendAppointmentLink={isDoctor}
              />
              <div className="mt-3 text-[12px]" style={{ color: "#94A3B8" }}>
                Offen {openTasks} · Ausstehend {pendingTasks} · Erledigt {doneTasks}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

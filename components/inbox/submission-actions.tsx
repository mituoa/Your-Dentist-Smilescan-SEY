import { pilotGlassPanel } from "@/lib/pilot-surface";
import type { TaskItem } from "@/lib/queries/submissions";
import type { AssignableMember } from "@/lib/queries/team-members";

import { AppointmentLinkButton } from "./appointment-link-button";
import { TaskForm } from "./task-form";
import { TaskList } from "./task-list";
import { SubmissionMeta } from "./submission-meta";
interface SubmissionActionsProps {
  submissionId: string;
  patientName: string | null;
  patientEmail: string | null;
  patientPhone: string | null;
  createdAt: string;
  patientBirthDate?: string | null;
  patientExternalId?: string | null;
  urgency?: string | null;
  isDraft?: boolean;
  seenAt?: string | null;
  updatedAt?: string | null;
  photoCount?: number;
  tasks: TaskItem[];
  assignableMembers: AssignableMember[];
  canCheckOff: boolean;
  canSendAppointmentLink: boolean;
}

export function SubmissionActions({
  submissionId,
  patientName,
  patientEmail,
  patientPhone,
  createdAt,
  patientBirthDate,
  patientExternalId,
  urgency,
  isDraft,
  seenAt,
  updatedAt,
  photoCount,
  tasks,
  assignableMembers,
  canCheckOff,
  canSendAppointmentLink,
}: SubmissionActionsProps) {
  return (
    <div className="space-y-4 sm:space-y-5">
      <section className={`p-4 sm:p-5 ${pilotGlassPanel}`}>
        <h3 className="mb-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-text-tertiary">
          Nächster Schritt
        </h3>
        <p className="mb-4 text-sm leading-5 text-text-secondary">
          Wählen Sie den nächsten Schritt für diesen Fall.
        </p>
        <AppointmentLinkButton
          submissionId={submissionId}
          hasPatientEmail={!!patientEmail}
          canSend={canSendAppointmentLink}
        />
      </section>

      <section className={`p-4 sm:p-5 ${pilotGlassPanel}`}>
        <h3 className="mb-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-text-tertiary">
          Aufgaben
        </h3>
        <p className="mb-4 text-sm leading-5 text-text-secondary">
          Offene Aufgaben zuerst, danach Bestätigungen und erledigte Einträge.
        </p>
        <div className="space-y-4 sm:space-y-5">
          <TaskForm
            submissionId={submissionId}
            assignableMembers={assignableMembers}
          />
          <div className="border-t border-border/80 pt-4">
            <TaskList
              tasks={tasks}
              canCheckOff={canCheckOff}
              submissionId={submissionId}
            />
          </div>
        </div>
      </section>

      <section className={`p-4 sm:p-5 ${pilotGlassPanel}`}>
        <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-text-tertiary">
          Details
        </h3>
        <SubmissionMeta
          patientName={patientName}
          patientEmail={patientEmail}
          patientPhone={patientPhone}
          createdAt={createdAt}
          patientBirthDate={patientBirthDate}
          patientExternalId={patientExternalId}
          urgency={urgency}
          isDraft={isDraft}
          seenAt={seenAt}
          updatedAt={updatedAt}
          photoCount={photoCount}
        />
      </section>
    </div>
  );
}

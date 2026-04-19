import { AppointmentLinkButton } from "./appointment-link-button";
import { TaskForm } from "./task-form";
import { TaskList } from "./task-list";
import { SubmissionMeta } from "./submission-meta";
import type { TaskItem } from "@/lib/queries/submissions";

interface SubmissionActionsProps {
  submissionId: string;
  patientName: string | null;
  patientEmail: string | null;
  patientPhone: string | null;
  createdAt: string;
  tasks: TaskItem[];
  canCheckOff: boolean;
}

export function SubmissionActions({
  submissionId,
  patientName,
  patientEmail,
  patientPhone,
  createdAt,
  tasks,
  canCheckOff,
}: SubmissionActionsProps) {
  return (
    <div className="space-y-6">
      <section>
        <h3 className="text-xs font-mono uppercase tracking-wider text-text-tertiary mb-3">
          Aktion
        </h3>
        <AppointmentLinkButton
          submissionId={submissionId}
          hasPatientEmail={!!patientEmail}
        />
      </section>

      <section>
        <h3 className="text-xs font-mono uppercase tracking-wider text-text-tertiary mb-3">
          Aufgaben
        </h3>
        <div className="space-y-4">
          <TaskForm submissionId={submissionId} />
          <div className="pt-3 border-t border-border">
            <TaskList
              tasks={tasks}
              canCheckOff={canCheckOff}
              submissionId={submissionId}
            />
          </div>
        </div>
      </section>

      <section>
        <h3 className="text-xs font-mono uppercase tracking-wider text-text-tertiary mb-3">
          Details
        </h3>
        <SubmissionMeta
          patientName={patientName}
          patientEmail={patientEmail}
          patientPhone={patientPhone}
          createdAt={createdAt}
        />
      </section>
    </div>
  );
}

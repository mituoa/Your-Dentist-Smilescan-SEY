import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getCurrentWorkspace } from "@/lib/auth-helpers";
import {
  getSubmissionById,
  getTasksForSubmission,
} from "@/lib/queries/submissions";
import { PhotoViewer } from "@/components/inbox/photo-viewer";
import { SubmissionActions } from "@/components/inbox/submission-actions";
import { markSubmissionSeen } from "./actions";

interface InboxDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function InboxDetailPage({
  params,
}: InboxDetailPageProps) {
  const { id } = await params;
  const workspace = await getCurrentWorkspace();

  if (!workspace) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-12">
        <p className="text-text-secondary">Workspace wird geladen…</p>
      </div>
    );
  }

  const submission = await getSubmissionById(id);

  if (!submission || submission.workspace_id !== workspace.workspace_id) {
    notFound();
  }

  const tasks = await getTasksForSubmission(id);

  if (!submission.seen_at) {
    markSubmissionSeen(id).catch(() => {});
  }

  const isDoctor = workspace.role === "doctor";

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <Link
        href="/inbox"
        className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary mb-6"
      >
        <ArrowLeft className="w-4 h-4" strokeWidth={1.75} />
        Zurück zur Inbox
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <PhotoViewer
            photos={submission.photos}
            patientName={submission.patient_name || "Patient"}
          />
        </div>

        <div>
          <SubmissionActions
            submissionId={submission.id}
            patientName={submission.patient_name}
            patientEmail={submission.patient_email}
            patientPhone={submission.patient_phone}
            createdAt={submission.created_at}
            tasks={tasks}
            canCheckOff={isDoctor}
          />
        </div>
      </div>
    </div>
  );
}

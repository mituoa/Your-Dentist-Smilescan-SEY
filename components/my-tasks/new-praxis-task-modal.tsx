"use client";

import { CreatePraxisTaskClient } from "@/components/my-tasks/create-praxis-task-client";

type NewPraxisTaskModalProps = {
  open: boolean;
  onClose: () => void;
  cancelHref: string;
  initialMode?: "task" | "assign" | "message";
  submissionId?: string | null;
  initialTitle?: string;
  initialDescription?: string;
  initialDueDate?: string;
};

export function NewPraxisTaskModal({
  open,
  onClose,
  cancelHref,
  initialMode = "task",
  submissionId = null,
  initialTitle = "",
  initialDescription = "",
  initialDueDate = "",
}: NewPraxisTaskModalProps) {
  if (!open) return null;

  return (
    <CreatePraxisTaskClient
      cancelHref={cancelHref}
      onClose={onClose}
      overlay="workspace"
      formVariant="modal"
      initialMode={initialMode === "assign" ? "assign" : "task"}
      submissionId={submissionId}
      initialTitle={initialTitle}
      initialDescription={initialDescription}
      initialDueDate={initialDueDate}
    />
  );
}

"use client";

import { CreatePraxisTaskClient } from "@/components/my-tasks/create-praxis-task-client";

export function CreatePraxisTaskPageClient(props: {
  cancelHref: string;
  initialMode?: "task" | "assign" | "message";
  submissionId: string | null;
  initialTitle: string;
  initialDescription: string;
  initialDueDate: string;
}) {
  return <CreatePraxisTaskClient {...props} />;
}

import { Suspense } from "react";

import { CreatePraxisTaskPageClient } from "@/components/my-tasks/create-praxis-task-page-client";
import { YdAuthLoadingState } from "@/components/auth/yd-auth-ui";
import { resolveCreateTaskCancelHref } from "@/lib/create-task-return";

interface NewTaskPageProps {
  searchParams: Promise<{
    from?: string;
    submission_id?: string;
    title?: string;
    description?: string;
    due_date?: string;
  }>;
}

export default async function NewPraxisTaskPage({ searchParams }: NewTaskPageProps) {
  const sp = await searchParams;
  const cancelHref = resolveCreateTaskCancelHref(sp.from);

  return (
    <Suspense
      fallback={
        <div className="flex min-h-[min(480px,75dvh)] flex-col items-center justify-center py-16">
          <YdAuthLoadingState label="Formular wird geladen …" />
        </div>
      }
    >
      <CreatePraxisTaskPageClient
        cancelHref={cancelHref}
        submissionId={sp.submission_id?.trim() || null}
        initialTitle={sp.title?.trim() || ""}
        initialDescription={sp.description?.trim() || ""}
        initialDueDate={sp.due_date?.trim() || ""}
      />
    </Suspense>
  );
}

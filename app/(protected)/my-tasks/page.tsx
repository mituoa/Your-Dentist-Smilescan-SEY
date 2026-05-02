import { redirect } from "next/navigation";

import { CardBoard } from "@/components/my-tasks/card-board";
import { CreateTaskForm } from "@/components/my-tasks/create-task-form";
import { getCurrentWorkspace } from "@/lib/auth-helpers";
import { getMyTasks } from "@/lib/queries/my-tasks";
import { getAssignableWorkspaceMembers } from "@/lib/queries/team-members";
import { getMyTaskCounts } from "@/lib/queries/task-counts";
import { pilotGlassPanel } from "@/lib/pilot-surface";
import { createClient } from "@/lib/supabase/server";

interface MyTasksPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function MyTasksPage({ searchParams }: MyTasksPageProps) {
  await searchParams;
  const workspace = await getCurrentWorkspace();
  if (!workspace) redirect("/login");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const isDoctor = workspace.role === "doctor";

  const [openTasks, pendingTasks, doneTasks, counts, assignableMembers] = await Promise.all([
    getMyTasks(user.id, workspace.workspace_id, isDoctor, "open"),
    getMyTasks(user.id, workspace.workspace_id, isDoctor, "pending_review"),
    getMyTasks(user.id, workspace.workspace_id, isDoctor, "done"),
    getMyTaskCounts(user.id, workspace.workspace_id, isDoctor),
    getAssignableWorkspaceMembers(workspace.workspace_id, user.id),
  ]);

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="mb-6 sm:mb-8">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-text-tertiary">
          Relay
        </p>
        <h1 className="font-serif text-4xl font-light tracking-tight text-text-primary sm:text-5xl">
          Relay
        </h1>
      </div>

      <div
        className={`mb-5 flex flex-col gap-3 p-4 sm:mb-6 sm:flex-row sm:items-center sm:justify-between sm:p-5 ${pilotGlassPanel}`}
      >
        <div className="grid grid-cols-1 gap-2 min-[520px]:grid-cols-3 sm:flex sm:flex-wrap sm:items-center sm:gap-2">
          <span className="inline-flex min-h-10 items-center rounded-md border border-border px-3 py-1.5 text-[11px] font-medium text-text-secondary">
            Offen: <strong className="ml-1 tabular-nums text-text-primary">{counts.open}</strong>
          </span>
          <span className="inline-flex min-h-10 items-center rounded-md border border-warning/30 bg-warning/10 px-3 py-1.5 text-[11px] font-medium text-warning">
            Zur Bestätigung: <strong className="ml-1 tabular-nums">{counts.pending}</strong>
          </span>
          <span className="inline-flex min-h-10 items-center rounded-md border border-brand/30 bg-brand/10 px-3 py-1.5 text-[11px] font-medium text-brand">
            Erledigt: <strong className="ml-1 tabular-nums">{counts.done}</strong>
          </span>
        </div>
      </div>

      <section className={`mb-6 p-4 sm:mb-8 sm:p-5 ${pilotGlassPanel}`}>
        <CreateTaskForm assignableMembers={assignableMembers} />
      </section>

      <CardBoard
        columns={{
          open: openTasks,
          pending: pendingTasks,
          done: doneTasks,
        }}
        currentUserId={user.id}
        isDoctor={isDoctor}
      />
    </div>
  );
}

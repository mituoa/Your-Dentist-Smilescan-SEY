import { redirect } from "next/navigation";

import { TaskList } from "@/components/my-tasks/task-list";
import { TabsNav } from "@/components/my-tasks/tabs-nav";
import { getCurrentWorkspace } from "@/lib/auth-helpers";
import { getMyTasks } from "@/lib/queries/my-tasks";
import { getMyTaskCounts } from "@/lib/queries/task-counts";
import { createClient } from "@/lib/supabase/server";

interface MyTasksPageProps {
  searchParams: Promise<{ tab?: string }>;
}

export default async function MyTasksPage({ searchParams }: MyTasksPageProps) {
  const { tab } = await searchParams;
  const workspace = await getCurrentWorkspace();
  if (!workspace) redirect("/login");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const isDoctor = workspace.role === "doctor";

  const activeTab: "open" | "pending" | "done" =
    tab === "pending" ? "pending" : tab === "done" ? "done" : "open";
  const statusMap = {
    open: "open" as const,
    pending: "pending_review" as const,
    done: "done" as const,
  };

  const [tasks, counts] = await Promise.all([
    getMyTasks(user.id, workspace.workspace_id, isDoctor, statusMap[activeTab]),
    getMyTaskCounts(user.id, workspace.workspace_id, isDoctor),
  ]);

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <div className="mb-8">
        <p className="text-xs font-mono uppercase tracking-wider text-text-tertiary mb-3">
          Meine Aufgaben
        </p>
        <h1 className="font-serif text-5xl font-light tracking-tight">
          Zu erledigen
        </h1>
      </div>

      <TabsNav
        tabs={[
          { id: "open", label: "Offen", count: counts.open },
          { id: "pending", label: "Auf Bestätigung", count: counts.pending },
          { id: "done", label: "Erledigt", count: counts.done },
        ]}
        activeTab={activeTab}
      />

      <TaskList tasks={tasks} status={activeTab} />
    </div>
  );
}

import { notFound, redirect } from "next/navigation";

import { TaskDetailView } from "@/components/my-tasks/task-detail";
import { getCurrentWorkspace } from "@/lib/auth-helpers";
import { getTaskWithComments } from "@/lib/queries/task-detail";
import { createClient } from "@/lib/supabase/server";
import { markTaskAsRead } from "@/lib/tasks/receipts";

interface TaskDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function TaskDetailPage({ params }: TaskDetailPageProps) {
  const { id } = await params;
  const workspace = await getCurrentWorkspace();
  if (!workspace) redirect("/login");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { task, comments } = await getTaskWithComments(id, workspace.workspace_id);
  if (!task) notFound();

  const isDoctor = workspace.role === "doctor";
  const isTaskRecipient =
    task.recipient_type === "all_team" ||
    (task.recipient_type === "specific_person" &&
      (task.specific_recipient_id === user.id ||
        task.assignee_user_ids.includes(user.id))) ||
    (task.recipient_type === "doctor_only" && isDoctor);
  const isMyTask =
    isTaskRecipient ||
    (isDoctor && task.created_by === user.id);

  if (isTaskRecipient) {
    await markTaskAsRead(task.id, user.id);
  }

  const listHref = isDoctor ? "/relay" : "/my-tasks";

  return (
    <TaskDetailView
      task={task}
      comments={comments}
      currentUserId={user.id}
      isDoctor={isDoctor}
      isMyTask={isMyTask}
      listHref={listHref}
    />
  );
}

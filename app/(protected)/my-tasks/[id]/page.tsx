import { notFound, redirect } from "next/navigation";

import { TaskDetailView } from "@/components/my-tasks/task-detail";
import { getCurrentWorkspace } from "@/lib/auth-helpers";
import { getTaskWithComments } from "@/lib/queries/task-detail";
import { createClient } from "@/lib/supabase/server";

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
  const isMyTask =
    task.recipient_type === "all_team" ||
    (task.recipient_type === "specific_person" &&
      task.specific_recipient_id === user.id) ||
    (task.recipient_type === "doctor_only" && isDoctor) ||
    (isDoctor && task.created_by === user.id);

  return (
    <TaskDetailView
      task={task}
      comments={comments}
      currentUserId={user.id}
      isDoctor={isDoctor}
      isMyTask={isMyTask}
    />
  );
}

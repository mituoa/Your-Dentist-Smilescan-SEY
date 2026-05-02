import "server-only";

import { getMyTasks } from "@/lib/queries/my-tasks";

export interface TaskCounts {
  open: number;
  pending: number;
  done: number;
}

export async function getMyTaskCounts(
  userId: string,
  workspaceId: string,
  isDoctor: boolean
): Promise<TaskCounts> {
  const [openTasks, pendingTasks, doneTasks] = await Promise.all([
    getMyTasks(userId, workspaceId, isDoctor, "open"),
    getMyTasks(userId, workspaceId, isDoctor, "pending_review"),
    getMyTasks(userId, workspaceId, isDoctor, "done"),
  ]);

  return {
    open: openTasks.length,
    pending: pendingTasks.length,
    done: doneTasks.length,
  };
}

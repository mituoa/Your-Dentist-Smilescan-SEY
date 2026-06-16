import type { MyTask } from "@/lib/queries/my-tasks";
import { assigneeLabelForTask } from "@/lib/relay/build-relay-snapshot";
import { relayCategoryLabel } from "@/lib/relay/relay-task-category";
import type { AssignableMember } from "@/lib/queries/team-members";

export type RelayPracticeGroupId =
  | "empfang"
  | "assistenz"
  | "implantologie"
  | "prophylaxe"
  | "verwaltung"
  | "labor"
  | "leitung";

export type RelayPracticeGroup = {
  id: RelayPracticeGroupId;
  label: string;
  count: number;
};

const GROUPS: { id: RelayPracticeGroupId; label: string; match: RegExp }[] = [
  { id: "empfang", label: "Empfang", match: /empfang|rezeption|front/i },
  { id: "assistenz", label: "Assistenz", match: /assistenz|zfa|zmp|prophylaxe.?assist/i },
  { id: "implantologie", label: "Implantologie", match: /implant|chirurg|oralchir/i },
  { id: "prophylaxe", label: "Prophylaxe", match: /prophylaxe|hygiene|recall/i },
  { id: "verwaltung", label: "Verwaltung", match: /verwaltung|abrechnung|hkp|büro/i },
  { id: "labor", label: "Labor", match: /labor|befund|technik/i },
  { id: "leitung", label: "Praxisleitung", match: /leitung|arzt|praxisleitung|doctor/i },
];

function taskGroupId(
  task: MyTask,
  membersById: Map<string, AssignableMember>
): RelayPracticeGroupId {
  const assignee = assigneeLabelForTask(task, membersById);
  const category = relayCategoryLabel(task);
  const haystack = `${assignee} ${category} ${task.title}`.toLowerCase();

  for (const group of GROUPS) {
    if (group.match.test(haystack)) return group.id;
  }

  if (task.recipient_type === "doctor_only") return "leitung";
  return "assistenz";
}

export function resolveTaskPracticeGroup(
  task: MyTask,
  membersById: Map<string, AssignableMember>
): RelayPracticeGroupId {
  return taskGroupId(task, membersById);
}

export function buildRelayPracticeGroups(
  tasks: MyTask[],
  members: AssignableMember[]
): RelayPracticeGroup[] {
  const membersById = new Map(members.map((m) => [m.user_id, m]));
  const counts = new Map<RelayPracticeGroupId, number>(
    GROUPS.map((g) => [g.id, 0])
  );

  for (const task of tasks) {
    if (task.status === "done") continue;
    const id = taskGroupId(task, membersById);
    counts.set(id, (counts.get(id) ?? 0) + 1);
  }

  return GROUPS.map((g) => ({
    id: g.id,
    label: g.label,
    count: counts.get(g.id) ?? 0,
  }));
}

export function taskMatchesPracticeGroup(
  task: MyTask,
  groupId: RelayPracticeGroupId,
  membersById: Map<string, AssignableMember>
): boolean {
  return taskGroupId(task, membersById) === groupId;
}

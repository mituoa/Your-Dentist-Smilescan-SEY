"use client";

import Link from "next/link";

import type { MyTask } from "@/lib/queries/my-tasks";
import type { AssignableMember } from "@/lib/queries/team-members";
import {
  assigneeLabelForTask,
  formatRelayDoneLine,
} from "@/lib/relay/build-relay-snapshot";

type BoardColumns = {
  open: MyTask[];
  pending: MyTask[];
  done: MyTask[];
};

type RelayCompactTaskBoardProps = {
  board: BoardColumns;
  membersById: Map<string, AssignableMember>;
  titles?: { open?: string; pending?: string; done?: string };
};

function TaskRow({
  task,
  membersById,
  muted,
}: {
  task: MyTask;
  membersById: Map<string, AssignableMember>;
  muted?: boolean;
}) {
  const doneLine = formatRelayDoneLine(task);
  return (
    <li>
      <Link href={`/my-tasks/${task.id}`} className="yd-relay-compact-task">
        <span className={muted ? "yd-relay-compact-task__title yd-relay-compact-task__title--muted" : "yd-relay-compact-task__title"}>
          {task.title}
        </span>
        <span className="yd-relay-compact-task__meta">
          {assigneeLabelForTask(task, membersById)}
          {task.due_date
            ? ` · ${new Date(`${task.due_date}T12:00:00`).toLocaleDateString("de-DE", { day: "numeric", month: "short" })}`
            : ""}
        </span>
        {doneLine ? <span className="yd-relay-compact-task__done">{doneLine}</span> : null}
      </Link>
    </li>
  );
}

function Section({
  title,
  tasks,
  membersById,
  defaultOpen = true,
}: {
  title: string;
  tasks: MyTask[];
  membersById: Map<string, AssignableMember>;
  defaultOpen?: boolean;
}) {
  if (tasks.length === 0) return null;

  return (
    <details className="yd-relay-compact-section" open={defaultOpen}>
      <summary className="yd-relay-compact-section__summary">
        <span>{title}</span>
        <span className="yd-relay-compact-section__count">{tasks.length}</span>
      </summary>
      <ul className="yd-relay-compact-section__list">
        {tasks.map((task) => (
          <TaskRow key={task.id} task={task} membersById={membersById} />
        ))}
      </ul>
    </details>
  );
}

/** Ruhige Listen statt Kanban — für Relay unter „Heute wichtig“. */
export function RelayCompactTaskBoard({
  board,
  membersById,
  titles,
}: RelayCompactTaskBoardProps) {
  const hasAny =
    board.open.length > 0 || board.pending.length > 0 || board.done.length > 0;

  if (!hasAny) {
    return (
      <p className="rounded-xl border border-dashed border-[rgba(226,232,240,0.95)] bg-[#fafcff] px-4 py-8 text-center text-[13px] text-[#64748B]">
        Keine Aufgaben in dieser Ansicht.
      </p>
    );
  }

  return (
    <div className="yd-relay-compact-board space-y-2">
      <Section
        title={titles?.open ?? "Offen"}
        tasks={board.open}
        membersById={membersById}
      />
      <Section
        title={titles?.pending ?? "In Bearbeitung"}
        tasks={board.pending}
        membersById={membersById}
      />
      <details className="yd-relay-compact-section yd-relay-compact-section--done">
        <summary className="yd-relay-compact-section__summary">
          <span>{titles?.done ?? "Erledigt"}</span>
          <span className="yd-relay-compact-section__count">{board.done.length}</span>
        </summary>
        {board.done.length > 0 ? (
          <ul className="yd-relay-compact-section__list">
            {board.done.slice(0, 12).map((task) => (
              <TaskRow key={task.id} task={task} membersById={membersById} muted />
            ))}
          </ul>
        ) : (
          <p className="px-3 pb-3 text-[12px] text-[#94A3B8]">Noch nichts erledigt.</p>
        )}
      </details>
    </div>
  );
}

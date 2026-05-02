"use client";

import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCenter,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Check, CheckCheck, CircleDot } from "lucide-react";
import Link from "next/link";
import { useMemo, useRef, useState, useTransition } from "react";

import {
  moveTaskStatusByDrag,
  reorderTasksInColumn,
} from "@/app/(protected)/my-tasks/actions";
import type { MyTask } from "@/lib/queries/my-tasks";
import { pilotGlassPanel } from "@/lib/pilot-surface";
import {
  canMoveTask,
  taskStatusToColumn,
  type BoardColumnId,
} from "@/lib/tasks/workflow-rules";

type BoardColumns = {
  open: MyTask[];
  pending: MyTask[];
  done: MyTask[];
};

interface CardBoardProps {
  columns: BoardColumns;
  currentUserId: string;
  isDoctor: boolean;
}

export function CardBoard({ columns, currentUserId, isDoctor }: CardBoardProps) {
  const [board, setBoard] = useState(columns);
  const [activeTask, setActiveTask] = useState<MyTask | null>(null);
  const [isPending, startTransition] = useTransition();
  const dragStartBoardRef = useRef<BoardColumns | null>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));
  const stableBoard = useMemo(() => board, [board]);

  const findTask = (taskId: string) =>
    stableBoard.open.find((task) => task.id === taskId) ||
    stableBoard.pending.find((task) => task.id === taskId) ||
    stableBoard.done.find((task) => task.id === taskId) ||
    null;

  const findColumnForTask = (taskId: string): BoardColumnId | null => {
    if (stableBoard.open.some((task) => task.id === taskId)) return "open";
    if (stableBoard.pending.some((task) => task.id === taskId)) return "pending";
    if (stableBoard.done.some((task) => task.id === taskId)) return "done";
    return null;
  };

  const extractDropColumn = (eventId: string | number): BoardColumnId | null => {
    const raw = String(eventId);
    if (raw === "open" || raw === "pending" || raw === "done") return raw;
    if (raw.startsWith("card-")) {
      return findColumnForTask(raw.replace("card-", ""));
    }
    return null;
  };

  const onDragStart = (event: DragStartEvent) => {
    const id = String(event.active.id).replace("card-", "");
    dragStartBoardRef.current = board;
    setActiveTask(findTask(id));
  };

  const onDragOver = (event: DragOverEvent) => {
    const activeId = String(event.active.id).replace("card-", "");
    const overId = event.over?.id;
    if (!overId) return;
    const fromColumn = findColumnForTask(activeId);
    const toColumn = extractDropColumn(overId);
    if (!fromColumn || !toColumn || fromColumn === toColumn) return;
    const task = findTask(activeId);
    if (!task) return;

    const allowed = canMoveTask(task, fromColumn, toColumn, {
      currentUserId,
      isDoctor,
    });
    if (!allowed) return;

    setBoard((prev) => {
      const fromItems = prev[fromColumn];
      const toItems = prev[toColumn];
      const movingTask = fromItems.find((item) => item.id === activeId);
      if (!movingTask) return prev;
      return {
        ...prev,
        [fromColumn]: fromItems.filter((item) => item.id !== activeId),
        [toColumn]: [movingTask, ...toItems],
      };
    });
  };

  const onDragEnd = (event: DragEndEvent) => {
    const activeId = String(event.active.id).replace("card-", "");
    const overId = event.over?.id;
    const before = board;
    setActiveTask(null);
    if (!overId) {
      setBoard(dragStartBoardRef.current || columns);
      dragStartBoardRef.current = null;
      return;
    }

    const fromColumn = findColumnForTask(activeId);
    const toColumn = extractDropColumn(overId);
    if (!fromColumn || !toColumn) {
      setBoard(dragStartBoardRef.current || columns);
      dragStartBoardRef.current = null;
      return;
    }
    const task = findTask(activeId);
    if (!task) {
      setBoard(dragStartBoardRef.current || columns);
      dragStartBoardRef.current = null;
      return;
    }

    if (fromColumn === toColumn) {
      const overTaskId = String(overId).replace("card-", "");
      if (overTaskId !== activeId) {
        const items = board[fromColumn];
        const oldIndex = items.findIndex((item) => item.id === activeId);
        const newIndex = items.findIndex((item) => item.id === overTaskId);
        if (oldIndex >= 0 && newIndex >= 0 && oldIndex !== newIndex) {
          const reordered = arrayMove(items, oldIndex, newIndex);
          setBoard((prev) => ({ ...prev, [fromColumn]: reordered }));
          startTransition(async () => {
            const result = await reorderTasksInColumn(
              fromColumn,
              reordered.map((item) => item.id)
            );
            if (result.error) {
              setBoard(before);
            }
          });
        }
      }
      return;
    }

    const allowed = canMoveTask(task, fromColumn, toColumn, {
      currentUserId,
      isDoctor,
    });
    if (!allowed) {
      setBoard(dragStartBoardRef.current || columns);
      dragStartBoardRef.current = null;
      return;
    }

    startTransition(async () => {
      const result = await moveTaskStatusByDrag(task.id, toColumn);
      if (result.notAllowed || result.error) {
        setBoard(dragStartBoardRef.current || columns);
      }
      dragStartBoardRef.current = null;
    });
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
    >
      <div className="overflow-x-auto pb-2">
        <div className="grid min-w-[980px] grid-cols-3 gap-4">
          <BoardColumn
            id="open"
            title="Offen"
            count={board.open.length}
            emptyTitle="Keine offenen Relay-Items"
            emptyText="Aktuell gibt es keine offenen Relay-Items."
            tasks={board.open}
            disabled={isPending}
            activeTask={activeTask}
            currentUserId={currentUserId}
            isDoctor={isDoctor}
          />
          <BoardColumn
            id="pending"
            title="Zur Bestätigung"
            count={board.pending.length}
            emptyTitle="Keine Relay-Items zur Bestätigung"
            emptyText="Aktuell wartet kein Relay-Item auf Bestätigung."
            tasks={board.pending}
            disabled={isPending}
            activeTask={activeTask}
            currentUserId={currentUserId}
            isDoctor={isDoctor}
          />
          <BoardColumn
            id="done"
            title="Erledigt"
            count={board.done.length}
            emptyTitle="Keine erledigten Relay-Items"
            emptyText="In den letzten 90 Tagen wurde kein Relay-Item abgeschlossen."
            tasks={board.done}
            disabled={isPending}
            activeTask={activeTask}
            currentUserId={currentUserId}
            isDoctor={isDoctor}
          />
        </div>
      </div>
      <DragOverlay>{activeTask ? <TaskOverlayCard task={activeTask} /> : null}</DragOverlay>
    </DndContext>
  );
}

function BoardColumn({
  id,
  title,
  count,
  emptyTitle,
  emptyText,
  tasks,
  disabled,
  activeTask,
  currentUserId,
  isDoctor,
}: {
  id: BoardColumnId;
  title: string;
  count: number;
  emptyTitle: string;
  emptyText: string;
  tasks: MyTask[];
  disabled?: boolean;
  activeTask: MyTask | null;
  currentUserId: string;
  isDoctor: boolean;
}) {
  const { setNodeRef, isOver } = useDroppable({ id });
  const activeFromColumn = activeTask ? taskStatusToColumn(activeTask.status) : null;
  const canDropActiveTask =
    activeTask && activeFromColumn
      ? canMoveTask(activeTask, activeFromColumn, id, {
          currentUserId,
          isDoctor,
        })
      : false;
  return (
    <section
      id={id}
      ref={setNodeRef}
      className={`max-h-[72vh] overflow-y-auto p-3 sm:p-4 ${pilotGlassPanel} ${
        isOver && canDropActiveTask ? "ring-2 ring-brand/30" : ""
      }`}
    >
      <header className="sticky top-0 z-10 mb-3 flex items-center justify-between border-b border-border bg-surface-page/80 pb-2 backdrop-blur">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-text-tertiary">
          {title}
        </h2>
        <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-surface-sunken px-1.5 text-[11px] font-semibold tabular-nums text-text-secondary">
          {count > 99 ? "99+" : count}
        </span>
      </header>

      {tasks.length === 0 ? (
        <div className="rounded-md border border-dashed border-border px-3 py-6 text-center">
          <p className="text-sm font-medium text-text-primary">{emptyTitle}</p>
          <p className="mt-1 text-xs text-text-secondary">{emptyText}</p>
        </div>
      ) : (
        <SortableContext items={tasks.map((task) => `card-${task.id}`)} strategy={verticalListSortingStrategy}>
        <div className={`space-y-2.5 ${disabled ? "pointer-events-none opacity-80" : ""}`}>
          {tasks.map((task) => (
            <TaskMiniCard key={task.id} task={task} />
          ))}
        </div>
        </SortableContext>
      )}
    </section>
  );
}

function TaskMiniCard({ task }: { task: MyTask }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: `card-${task.id}`,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={isDragging ? "opacity-60" : ""}
      {...attributes}
      {...listeners}
    >
      <Link
        href={`/my-tasks/${task.id}`}
        onClick={(event) => {
          if (isDragging) event.preventDefault();
        }}
        className="block rounded-md border border-border bg-surface-card px-3 py-2.5 transition-colors hover:bg-surface-sunken/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
      >
        <div className="mb-1.5 flex items-start justify-between gap-2">
          <h3 className="line-clamp-2 text-sm font-semibold leading-5 text-text-primary">{task.title}</h3>
          <ReceiptMark task={task} />
        </div>

        <div className="flex items-center gap-2 text-[11px] text-text-tertiary">
          {task.priority === "important" && (
            <span className="rounded bg-danger/15 px-1.5 py-0.5 font-semibold uppercase tracking-[0.08em] text-danger">
              Wichtig
            </span>
          )}
          <span>{task.submission_id ? "Patienten-Item" : "Internes Item"}</span>
        </div>
      </Link>
    </div>
  );
}

function TaskOverlayCard({ task }: { task: MyTask }) {
  return (
    <div className="w-[280px] rounded-md border border-border bg-surface-card px-3 py-2.5 shadow-lg">
      <div className="mb-1.5 flex items-start justify-between gap-2">
        <h3 className="line-clamp-2 text-sm font-semibold leading-5 text-text-primary">{task.title}</h3>
        <ReceiptMark task={task} />
      </div>
      <div className="flex items-center gap-2 text-[11px] text-text-tertiary">
        {task.priority === "important" && (
          <span className="rounded bg-danger/15 px-1.5 py-0.5 font-semibold uppercase tracking-[0.08em] text-danger">
            Wichtig
          </span>
        )}
        <span>{task.submission_id ? "Patienten-Item" : "Internes Item"}</span>
      </div>
    </div>
  );
}

function ReceiptMark({ task }: { task: MyTask }) {
  if (task.delivery_status === "read") {
    return <CheckCheck className="h-4 w-4 text-emerald-600" strokeWidth={2.2} aria-label="Alle gelesen" />;
  }
  if (task.delivery_status === "delivered") {
    return <CheckCheck className="h-4 w-4 text-text-secondary" strokeWidth={2.2} aria-label="Alle zugestellt" />;
  }
  if (task.delivery_status === "sent") {
    return <Check className="h-4 w-4 text-text-secondary" strokeWidth={2.2} aria-label="Alle gesendet" />;
  }
  return <CircleDot className="h-4 w-4 text-text-tertiary" strokeWidth={2.2} aria-label="Teilweise oder offen" />;
}

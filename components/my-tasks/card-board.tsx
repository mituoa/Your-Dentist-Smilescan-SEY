"use client";

/**
 * Kanban-Board (Relay und „Meine Aufgaben“) — **Punkt 2 (Status / Stabilität):**
 * - **Optimistisches onDragOver** nur bei erlaubtem Spaltenwechsel; **Rollback** über `dragStartBoardRef` bei Abbruch
 *   oder Serverfehler.
 * - **Server:** `moveTaskStatusByDrag` / `reorderTasksInColumn` in `useTransition` — während `isPending` Board
 *   gesperrt (`pointer-events-none`, dezente Deckkraft), kein paralleles zweites Ziehen.
 * - **Synchronisation:** Board-State folgt `columns` aus dem Server, sobald weder aktiver Drag noch ausstehende
 *   Mutation läuft — vermeidet Drift nach `revalidatePath`.
 * - **Drop-Feedback:** Spalten-Ring nutzt **visuelle** Quellspalte (Kartenposition im State), nicht nur `task.status`,
 *   damit Mehrfach-Hover nach Zwischen-Spalte nicht irreführend wirkt.
 *
 * **Finalisierung (Punkt 2):** Keine bekannte Status-/Stabilitätslücke im Code- und UX-Vertrag. Manuelle Last-/
 * Browser-QA (viele Karten, schnelles Ziehen, wiederholte Züge, langsame Verbindung, fehlgeschlagene Action)
 * bleibt üblicher **Regressionstest** — bewusst getrennt von der **Finalität** dieses Vertrags im Repo.
 *
 * **Punkt 4 (Aktionen) — final:** Keine sekundären CTAs auf den Karten; Link nur zum Detail; Hover/Fokus und
 * Drop-Ring **dezent** (neutral, kein PM-Tool-„Glow“); Quick-Create siehe `RelayQuickCreate`. Smoke vor Staging
 * siehe `relay/page.tsx` (Punkt 4).
 *
 * **Randfall (akzeptiert, kein Blocker):** Während **eines** Zugs kann eine Karte optimistisch bereits in Spalte B
 * liegen; hovert man über Spalte A ohne **erlaubten** Wechsel laut `canMoveTask`, bleibt die **Vorschau** in B,
 * bis **Drop** auf ein gültiges Ziel oder **Abbruch** — dann greifen `dragStartBoardRef`-Rollback bzw.
 * Serverfehler-Rollback. Persistenz und Endzustand bleiben korrekt; **keine** neue DnD-Architektur nötig.
 */

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
import { Check, CheckCheck, CircleDot, Users } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";

import {
  moveTaskStatusByDrag,
  reorderTasksInColumn,
} from "@/app/(protected)/my-tasks/actions";
import type { MyTask } from "@/lib/queries/my-tasks";
import { clinicalCorePanel } from "@/lib/pilot-surface";
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

function boardFingerprint(b: BoardColumns): string {
  return [
    ...b.open.map((t) => `${t.id}:${t.status}:${t.sort_order ?? 0}`),
    ...b.pending.map((t) => `${t.id}:${t.status}:${t.sort_order ?? 0}`),
    ...b.done.map((t) => `${t.id}:${t.status}:${t.sort_order ?? 0}`),
  ].join("|");
}

interface CardBoardProps {
  columns: BoardColumns;
  currentUserId: string;
  isDoctor: boolean;
  columnTitles?: Partial<Record<BoardColumnId, string>>;
  columnSurfaceClass?: Partial<Record<BoardColumnId, string>>;
  /** user_id → initials + color for assignee chips */
  avatarByUserId?: Record<string, { initials: string; color: string }>;
}

export function CardBoard({
  columns,
  currentUserId,
  isDoctor,
  columnTitles,
  columnSurfaceClass,
  avatarByUserId,
}: CardBoardProps) {
  const [board, setBoard] = useState(columns);
  const [activeTask, setActiveTask] = useState<MyTask | null>(null);
  const [isPending, startTransition] = useTransition();
  const dragStartBoardRef = useRef<BoardColumns | null>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const columnsSyncKey = useMemo(() => boardFingerprint(columns), [columns]);

  const boardSyncKey = useMemo(() => boardFingerprint(board), [board]);

  useEffect(() => {
    if (activeTask != null || isPending) return;
    if (columnsSyncKey === boardSyncKey) return;
    // Synchronisation nach Server-Revalidierung (RSC-Props); kein paralleles Optimismus-Update hier.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- bewusstes Abgleichen mit `columns` nach `revalidatePath`
    setBoard(columns);
  }, [columnsSyncKey, boardSyncKey, columns, activeTask, isPending]);

  const stableBoard = board;

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
      dragStartBoardRef.current = null;
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

  const activeVisualColumn =
    activeTask != null ? findColumnForTask(activeTask.id) : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
    >
      <div
        className="overflow-x-auto pb-2"
        role="region"
        aria-label="Aufgaben-Board"
        aria-busy={isPending}
      >
        <div className="grid min-w-[980px] grid-cols-3 gap-6">
          <BoardColumn
            id="open"
            title={columnTitles?.open ?? "Offen"}
            surfaceClassName={columnSurfaceClass?.open}
            count={board.open.length}
            emptyTitle="Keine offenen Aufgaben"
            emptyText="Aktuell gibt es keine offenen Aufgaben in dieser Spalte."
            tasks={board.open}
            disabled={isPending}
            activeTask={activeTask}
            activeVisualColumn={activeVisualColumn}
            currentUserId={currentUserId}
            isDoctor={isDoctor}
            avatarByUserId={avatarByUserId}
          />
          <BoardColumn
            id="pending"
            title={columnTitles?.pending ?? "Zur Bestätigung"}
            surfaceClassName={columnSurfaceClass?.pending}
            count={board.pending.length}
            emptyTitle="Keine Aufgaben in Bearbeitung"
            emptyText="Aktuell keine Aufgaben in diesem Bearbeitungsstand."
            tasks={board.pending}
            disabled={isPending}
            activeTask={activeTask}
            activeVisualColumn={activeVisualColumn}
            currentUserId={currentUserId}
            isDoctor={isDoctor}
            avatarByUserId={avatarByUserId}
          />
          <BoardColumn
            id="done"
            title={columnTitles?.done ?? "Erledigt"}
            surfaceClassName={columnSurfaceClass?.done}
            count={board.done.length}
            emptyTitle="Keine erledigten Aufgaben"
            emptyText="In den letzten 90 Tagen wurde hier keine Aufgabe als erledigt geführt."
            tasks={board.done}
            disabled={isPending}
            activeTask={activeTask}
            activeVisualColumn={activeVisualColumn}
            currentUserId={currentUserId}
            isDoctor={isDoctor}
            avatarByUserId={avatarByUserId}
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
  surfaceClassName,
  count,
  emptyTitle,
  emptyText,
  tasks,
  disabled,
  activeTask,
  activeVisualColumn,
  currentUserId,
  isDoctor,
  avatarByUserId,
}: {
  id: BoardColumnId;
  title: string;
  surfaceClassName?: string;
  count: number;
  emptyTitle: string;
  emptyText: string;
  tasks: MyTask[];
  disabled?: boolean;
  activeTask: MyTask | null;
  /** Spalte, in der die gezogene Karte im Board-State liegt (inkl. Zwischen-Optimismus). */
  activeVisualColumn: BoardColumnId | null;
  currentUserId: string;
  isDoctor: boolean;
  avatarByUserId?: Record<string, { initials: string; color: string }>;
}) {
  const { setNodeRef, isOver } = useDroppable({ id });
  const activeFromColumn: BoardColumnId | null =
    activeTask == null
      ? null
      : activeVisualColumn ?? taskStatusToColumn(activeTask.status);
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
      className={`max-h-[72vh] overflow-y-auto rounded-xl border border-[rgba(15,23,42,0.06)] p-4 sm:p-5 ${surfaceClassName ?? ""} ${
        clinicalCorePanel
      } ${isOver && canDropActiveTask ? "ring-2 ring-[rgba(15,23,42,0.12)]" : ""}`}
    >
      <header className="sticky top-0 z-10 mb-4 flex items-center justify-between border-b border-[rgba(15,23,42,0.06)] bg-white/95 pb-3 backdrop-blur-sm">
        <h2 className="text-[13px] font-semibold uppercase tracking-[0.05em] text-[#64748B]">{title}</h2>
        <span className="inline-flex min-w-[24px] items-center justify-center rounded-full bg-[#F1F5F9] px-2 py-0.5 text-[12px] font-medium tabular-nums text-[#475569]">
          {count > 99 ? "99+" : count}
        </span>
      </header>

      {tasks.length === 0 ? (
        <div className="rounded-lg border border-dashed border-[rgba(15,23,42,0.1)] bg-[#F8FAFC] px-3 py-8 text-center">
          <p className="text-sm font-medium text-[#0F172A]">{emptyTitle}</p>
          <p className="mt-1 text-xs text-[#64748B]">{emptyText}</p>
        </div>
      ) : (
        <SortableContext items={tasks.map((task) => `card-${task.id}`)} strategy={verticalListSortingStrategy}>
        <div className={`space-y-3 ${disabled ? "pointer-events-none opacity-[0.92]" : ""}`}>
          {tasks.map((task) => (
            <TaskMiniCard
              key={task.id}
              task={task}
              doneColumn={id === "done"}
              currentUserId={currentUserId}
              avatarByUserId={avatarByUserId}
            />
          ))}
        </div>
        </SortableContext>
      )}
    </section>
  );
}

function TaskMiniCard({
  task,
  doneColumn,
  currentUserId,
  avatarByUserId,
}: {
  task: MyTask;
  doneColumn?: boolean;
  currentUserId: string;
  avatarByUserId?: Record<string, { initials: string; color: string }>;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: `card-${task.id}`,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const assigneeIds =
    task.assignee_ids.length > 0
      ? task.assignee_ids
      : task.specific_recipient_id
        ? [task.specific_recipient_id]
        : [task.created_by];
  const uniqueAssignees = Array.from(new Set(assigneeIds)).slice(0, 4);
  const multi = uniqueAssignees.length > 1;

  const contextLine =
    task.submission_patient_name != null && String(task.submission_patient_name).trim().length > 0
      ? task.submission_patient_name
      : task.submission_id
        ? "Fallbezug"
        : null;

  const isMine = task.assignee_ids.includes(currentUserId) || task.specific_recipient_id === currentUserId;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={isDragging ? "opacity-[0.58]" : ""}
      {...attributes}
      {...listeners}
    >
      <Link
        href={`/my-tasks/${task.id}`}
        onClick={(event) => {
          if (isDragging) event.preventDefault();
        }}
        className={`block rounded-lg border px-4 py-3.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(15,23,42,0.12)] ${
          isMine
            ? "border-[rgba(15,23,42,0.08)] bg-[rgba(248,250,252,0.95)] hover:border-[rgba(15,23,42,0.1)] hover:bg-[#F8FAFC]"
            : "border-[rgba(15,23,42,0.06)] bg-white hover:border-[rgba(15,23,42,0.1)] hover:bg-[#FAFBFC]"
        }`}
      >
        <div className="mb-2 flex items-start gap-2">
          {task.priority === "important" ? (
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#DC2626]" aria-hidden />
          ) : (
            <span className="mt-1.5 w-1.5 shrink-0" aria-hidden />
          )}
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <h3
                className={`line-clamp-2 text-[14px] font-medium leading-snug ${
                  doneColumn ? "text-[#94A3B8] line-through decoration-[#94A3B8]" : "text-[#1E293B]"
                }`}
              >
                {task.title}
              </h3>
              <ReceiptMark task={task} />
            </div>
            {contextLine ? (
              <p className={`mt-1 text-[12px] ${doneColumn ? "text-[#CBD5E1]" : "text-[#94A3B8]"}`}>{contextLine}</p>
            ) : null}
          </div>
        </div>

        <div className="mt-1 flex items-center gap-1.5 pl-3.5">
          {multi ? <Users className="h-3 w-3 shrink-0 text-[#94A3B8]" aria-hidden /> : null}
          {uniqueAssignees.map((uid) => {
            const chip = avatarByUserId?.[uid];
            const chipTitle =
              chip?.initials != null && chip.initials.trim().length > 0
                ? `Zugewiesen: ${chip.initials}`
                : "Zugewiesen";
            return (
              <div
                key={uid}
                className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-semibold text-white"
                style={{
                  background: chip?.color ?? "#64748B",
                  boxShadow: uid === currentUserId ? "0 0 0 2px rgba(15,23,42,0.1)" : undefined,
                }}
                title={chipTitle}
              >
                {chip?.initials ?? "?"}
              </div>
            );
          })}
        </div>
      </Link>
    </div>
  );
}

function TaskOverlayCard({ task }: { task: MyTask }) {
  return (
    <div className="w-[280px] rounded-xl border border-[rgba(15,23,42,0.08)] bg-white px-3 py-2.5 shadow-[0_8px_28px_-14px_rgba(15,23,42,0.12)]">
      <div className="mb-1.5 flex items-start justify-between gap-2">
        <h3 className="line-clamp-2 text-sm font-semibold leading-5 text-[#0F172A]">{task.title}</h3>
        <ReceiptMark task={task} />
      </div>
      <div className="flex items-center gap-2 text-[11px] text-[#64748B]">
        {task.priority === "important" && (
          <span className="rounded bg-danger/15 px-1.5 py-0.5 text-[10px] font-medium text-danger">
            Wichtig
          </span>
        )}
        <span>{task.submission_id ? "Mit Fallbezug" : "Interne Aufgabe"}</span>
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

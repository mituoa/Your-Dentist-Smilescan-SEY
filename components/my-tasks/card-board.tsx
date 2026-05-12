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
 * **Punkt 5 (Tot/Fake) — final:** Spaltenköpfe **ohne** unnötige Uppercase-„Ticketboard“-Typo; Sticky-Kopf **ohne**
 * Glaseffekt-Blur (kein Dashboard-„Live“-Anstrich). `ReceiptMark` nutzt **sachliche** Aria-Texte (Empfang/Lesen),
 * keine Chat-Ops-Sprache („Alle …“). Leer-/Footer-Copy entspricht Query (`getMyTasks`, 90 Tage bei Erledigt).
 *
 * **Punkt 6 (Loading) — final:** Kein zweites Skeleton bei Mutationen — nur `aria-busy` + leichte Deckkraft/
 * `pointer-events-none` während `useTransition`; initiales Seitenladen siehe `ClinicalRelayBoardSkeleton` /
 * `relay/loading.tsx`.
 *
 * **Randfall DnD (akzeptiert, kein Blocker):** Während **eines** Zugs kann eine Karte optimistisch bereits in Spalte B
 * liegen; hovert man über Spalte A ohne **erlaubten** Wechsel laut `canMoveTask`, bleibt die **Vorschau** in B,
 * bis **Drop** auf ein gültiges Ziel oder **Abbruch** — dann greifen `dragStartBoardRef`-Rollback bzw.
 * Serverfehler-Rollback. Persistenz und Endzustand bleiben korrekt; **keine** neue DnD-Architektur nötig.
 *
 * **Punkt 7 (Empty) — final:** Spalten-Leerzustände **ohne** PM-Floskeln und **ohne** vorgebliche Team-Leere bei
 * Filter „Meine Beteiligung“ / „Meine Aufgaben“ (`columnEmptyContext`); sachliche Copy, dezente Fläche
 * (`min-h`, fester feiner Rand — kein Dashed-„Demo-Board“); Erledigt-Text an **90-Tage**-Query gekoppelt.
 *
 * **Punkt 8 (Error) — final:** Mutationen ohne **rohe** Technikstrings in der UI; bei fehlgeschlagenem Speichern
 * **Rollback** + ruhige, zeitlich begrenzte Hinweiszeile (`boardPersistHint`, `aria-live="polite"`) — kein Banner,
 * kein Toast; `notAllowed` eigener kurzer Hinweis. Server-Copy für Move/Reorder in `my-tasks/actions.ts`.
 *
 * **Punkt 9 (Mobile) — final:** Bewusst **horizontales** Kanban (`min-w-[980px]`); Streifen mit
 * `overscroll-behavior-x: contain`, Momentum-Scroll, **Safe-Area** unten; Spaltenhöhe `min(72vh, 100dvh−…)` auf
 * kleinen Viewports; DnD-**Aktivierungsweg** leicht erhöht; Filter/Quick-Create **44px**-Tippflächen / **16px**-Input
 * (iOS). Kein alternatives Mobile-Board.
 *
 * **Punkt 10 (Security) — final:** DnD nur mit `canMoveTask` (Import aus `workflow-rules`, identisch zur Server-Action);
 * Drop-Ring nur bei erlaubtem Zug; kein clientgewähltes `workspace_id` — Schreibwege nur Server Actions mit
 * `resolveActorWorkspace`. Optimistische Vorschau kann kurz von der Server-Entscheidung abweichen; Persistenz und
 * Rollback folgen dem Server (s. Randfall DnD oben).
 *
 * **Punkt 11 (MVP) — final:** Festes Kanban ohne Konfiguration, ohne KPI-Leisten, ohne „Live“-Inszenierung —
 * Team-Koordination im begrenzten Umfang; Non-Goals s. `relay/page.tsx` (Punkt 11).
 *
 * **Punkt 12 (Nice / Future / Non-MVP) — final:** Nice = lokales Polish (Rhythmus, Karten, DnD) **ohne** neue
 * Spalten/Semantik; Future/Non-MVP s. `relay/page.tsx` (Punkt 12) — bei Konflikt **ruhigeres** Board bevorzugen.
 *
 * **Punkt 13 (Priorität) — final:** DnD-/Board-Logik nur ändern bei Bugfix oder Vertragsupdate — Stabilität vor
 * „Board-Upgrade“; s. `relay/page.tsx` (Punkt 13).
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
import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";

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
import type { RelayScope } from "@/lib/tasks/relay-helpers";

type BoardColumns = {
  open: MyTask[];
  pending: MyTask[];
  done: MyTask[];
};

/** Leer-Copy: `mine` = gefilterte Ansicht (kein Vortäuschen teamweiter Leere). */
function columnEmptyCopy(
  column: BoardColumnId,
  context: RelayScope
): { title: string; text: string } {
  if (context === "mine") {
    if (column === "done") {
      return {
        title: "Keine erledigten Aufgaben",
        text: "Für die aktuelle Filterauswahl gibt es hier keine erledigten Einträge aus den letzten 90 Tagen.",
      };
    }
    return {
      title: column === "open" ? "Keine offenen Aufgaben" : "Keine Aufgaben in Bearbeitung",
      text: "Für die aktuelle Filterauswahl gibt es in dieser Spalte keine Einträge.",
    };
  }
  if (column === "open") {
    return {
      title: "Keine offenen Aufgaben",
      text: "Es liegen hier derzeit keine Aufgaben in diesem Schritt.",
    };
  }
  if (column === "pending") {
    return {
      title: "Keine Aufgaben in Bearbeitung",
      text: "Es liegen hier derzeit keine Aufgaben in diesem Bearbeitungsschritt.",
    };
  }
  return {
    title: "Keine erledigten Aufgaben",
    text: "In den letzten 90 Tagen wurde keine Aufgabe in dieser Spalte als erledigt geführt.",
  };
}

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
  /** Steuert Leertext in leeren Spalten: `mine` = ehrliche Filter-Leere (nicht teamweite Leere vortäuschen). */
  columnEmptyContext?: RelayScope;
}

export function CardBoard({
  columns,
  currentUserId,
  isDoctor,
  columnTitles,
  columnSurfaceClass,
  avatarByUserId,
  columnEmptyContext = "all",
}: CardBoardProps) {
  const [board, setBoard] = useState(columns);
  const [activeTask, setActiveTask] = useState<MyTask | null>(null);
  const [isPending, startTransition] = useTransition();
  const [boardPersistHint, setBoardPersistHint] = useState<string | null>(null);
  const dragStartBoardRef = useRef<BoardColumns | null>(null);
  const persistHintTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const clearBoardPersistHint = useCallback(() => {
    if (persistHintTimerRef.current != null) {
      clearTimeout(persistHintTimerRef.current);
      persistHintTimerRef.current = null;
    }
    setBoardPersistHint(null);
  }, []);

  const scheduleBoardPersistHint = useCallback(
    (message: string) => {
      clearBoardPersistHint();
      setBoardPersistHint(message);
      persistHintTimerRef.current = setTimeout(() => {
        setBoardPersistHint(null);
        persistHintTimerRef.current = null;
      }, 8000);
    },
    [clearBoardPersistHint]
  );

  useEffect(() => () => clearBoardPersistHint(), [clearBoardPersistHint]);

  const columnsSyncKey = useMemo(() => boardFingerprint(columns), [columns]);

  const boardSyncKey = useMemo(() => boardFingerprint(board), [board]);

  useEffect(() => {
    if (activeTask != null || isPending) return;
    if (columnsSyncKey === boardSyncKey) return;
    if (persistHintTimerRef.current != null) {
      clearTimeout(persistHintTimerRef.current);
      persistHintTimerRef.current = null;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- RSC-Sync: Hinweis + Board mit Props abgleichen
    setBoardPersistHint(null);
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
    clearBoardPersistHint();
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
              scheduleBoardPersistHint(
                "Die Reihenfolge konnte nicht gespeichert werden. Der vorherige Stand wurde wiederhergestellt."
              );
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
      if (result.error) {
        setBoard(dragStartBoardRef.current || columns);
        scheduleBoardPersistHint(
          "Die Aufgabe konnte nicht verschoben werden. Der vorherige Stand wurde wiederhergestellt."
        );
      } else if (result.notAllowed) {
        setBoard(dragStartBoardRef.current || columns);
        scheduleBoardPersistHint(
          "Diese Einordnung können Sie mit Ihrer aktuellen Rolle nicht vornehmen."
        );
      }
      dragStartBoardRef.current = null;
    });
  };

  const activeVisualColumn =
    activeTask != null ? findColumnForTask(activeTask.id) : null;

  const emptyOpen = columnEmptyCopy("open", columnEmptyContext);
  const emptyPending = columnEmptyCopy("pending", columnEmptyContext);
  const emptyDone = columnEmptyCopy("done", columnEmptyContext);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
    >
      <div
        className="overflow-x-auto overscroll-x-contain pb-[max(0.5rem,env(safe-area-inset-bottom))] [-webkit-overflow-scrolling:touch]"
        role="region"
        aria-label="Aufgaben-Board, auf schmalen Bildschirmen seitwärts scrollen"
        aria-busy={isPending}
      >
        <div className="grid min-w-[980px] grid-cols-3 gap-6">
          <BoardColumn
            id="open"
            title={columnTitles?.open ?? "Offen"}
            surfaceClassName={columnSurfaceClass?.open}
            count={board.open.length}
            emptyTitle={emptyOpen.title}
            emptyText={emptyOpen.text}
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
            emptyTitle={emptyPending.title}
            emptyText={emptyPending.text}
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
            emptyTitle={emptyDone.title}
            emptyText={emptyDone.text}
            tasks={board.done}
            disabled={isPending}
            activeTask={activeTask}
            activeVisualColumn={activeVisualColumn}
            currentUserId={currentUserId}
            isDoctor={isDoctor}
            avatarByUserId={avatarByUserId}
          />
        </div>
        {boardPersistHint ? (
          <p
            className="mt-4 max-w-[980px] text-sm leading-relaxed text-[#475569]"
            role="status"
            aria-live="polite"
          >
            {boardPersistHint}
          </p>
        ) : null}
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
      className={`max-h-[min(72vh,calc(100dvh-15rem))] overflow-y-auto rounded-xl border border-[rgba(15,23,42,0.06)] p-4 sm:max-h-[72vh] sm:p-5 ${surfaceClassName ?? ""} ${
        clinicalCorePanel
      } ${isOver && canDropActiveTask ? "ring-2 ring-[rgba(15,23,42,0.12)]" : ""}`}
    >
      <header className="sticky top-0 z-10 mb-4 flex items-center justify-between border-b border-[rgba(15,23,42,0.06)] bg-[#FAFBFC] pb-3">
        <h2 className="text-[13px] font-semibold tracking-[-0.01em] text-[#64748B]">{title}</h2>
        <span className="inline-flex min-w-[24px] items-center justify-center rounded-full bg-[#F1F5F9] px-2 py-0.5 text-[12px] font-medium tabular-nums text-[#475569]">
          {count > 99 ? "99+" : count}
        </span>
      </header>

      {tasks.length === 0 ? (
        <div className="flex min-h-[128px] flex-col justify-center rounded-lg border border-[rgba(15,23,42,0.07)] bg-[#F9FAFB] px-3 py-6 text-center sm:min-h-[140px] sm:py-7">
          <p className="text-sm font-medium text-[#334155]">{emptyTitle}</p>
          <p className="mt-1.5 text-xs leading-relaxed text-[#64748B]">{emptyText}</p>
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
    return (
      <CheckCheck
        className="h-4 w-4 text-emerald-600"
        strokeWidth={2.2}
        aria-label="Empfangsstatus: gelesen"
      />
    );
  }
  if (task.delivery_status === "delivered") {
    return (
      <CheckCheck
        className="h-4 w-4 text-text-secondary"
        strokeWidth={2.2}
        aria-label="Empfangsstatus: zugestellt"
      />
    );
  }
  if (task.delivery_status === "sent") {
    return (
      <Check className="h-4 w-4 text-text-secondary" strokeWidth={2.2} aria-label="Empfangsstatus: gesendet" />
    );
  }
  return (
    <CircleDot
      className="h-4 w-4 text-text-tertiary"
      strokeWidth={2.2}
      aria-label="Empfangsstatus: offen oder teilweise"
    />
  );
}

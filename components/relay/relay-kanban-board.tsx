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
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useEffect, useMemo, useRef, useState, useTransition, type ReactNode } from "react";

import { moveTaskStatusByDrag } from "@/app/(protected)/my-tasks/actions";
import { RelayKanbanCardView } from "@/components/relay/relay-kanban-card";
import type { MyTask } from "@/lib/queries/my-tasks";
import { kanbanColumnToBoardColumn } from "@/lib/relay/relay-kanban-columns";
import {
  RELAY_KANBAN_COLUMNS,
  type RelayKanbanCard,
  type RelayKanbanColumnId,
} from "@/lib/relay/relay-work-center-model";
import { canMoveTask } from "@/lib/tasks/workflow-rules";
import { cn } from "@/lib/utils";

type BoardState = Record<RelayKanbanColumnId, RelayKanbanCard[]>;

type RelayKanbanBoardProps = {
  board: BoardState;
  columns: { open: MyTask[]; pending: MyTask[]; done: MyTask[] };
  currentUserId: string;
  isDoctor: boolean;
  mobileColumn?: RelayKanbanColumnId | null;
};

function findTask(
  taskId: string,
  columns: { open: MyTask[]; pending: MyTask[]; done: MyTask[] }
): MyTask | null {
  return (
    columns.open.find((t) => t.id === taskId) ||
    columns.pending.find((t) => t.id === taskId) ||
    columns.done.find((t) => t.id === taskId) ||
    null
  );
}

function findCardColumn(cardId: string, board: BoardState): RelayKanbanColumnId | null {
  for (const col of RELAY_KANBAN_COLUMNS) {
    if (board[col.id].some((c) => c.id === cardId)) return col.id;
  }
  return null;
}

function extractDropTarget(
  overId: string | number | undefined,
  board: BoardState
): RelayKanbanColumnId | null {
  if (!overId) return null;
  const raw = String(overId);
  if (raw === "decision" || raw === "in_progress" || raw === "done") return raw;
  if (raw.startsWith("card-")) {
    return findCardColumn(raw.replace("card-", ""), board);
  }
  return null;
}

function SortableKanbanCard({
  card,
  done,
}: {
  card: RelayKanbanCard;
  done?: boolean;
}) {
  const draggable = Boolean(card.taskId) && !card.isGhost;
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: `card-${card.id}`,
    disabled: !draggable,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "relay-kanban-card-wrap",
        isDragging && "relay-kanban-card-wrap--dragging",
        draggable && "relay-kanban-card-wrap--draggable"
      )}
      {...(draggable ? { ...attributes, ...listeners } : {})}
    >
      <RelayKanbanCardView card={card} done={done} />
    </div>
  );
}

function KanbanColumnDrop({
  columnId,
  children,
}: {
  columnId: RelayKanbanColumnId;
  children: ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: columnId });
  return (
    <div
      ref={setNodeRef}
      className={cn("relay-kanban__cards", isOver && "relay-kanban__cards--over")}
    >
      {children}
    </div>
  );
}

export function RelayKanbanBoard({
  board: initialBoard,
  columns,
  currentUserId,
  isDoctor,
  mobileColumn = null,
}: RelayKanbanBoardProps) {
  const [board, setBoard] = useState(initialBoard);
  const [activeCard, setActiveCard] = useState<RelayKanbanCard | null>(null);
  const [isPending, startTransition] = useTransition();
  const dragStartRef = useRef<BoardState | null>(null);

  useEffect(() => {
    if (!activeCard && !isPending) {
      setBoard(initialBoard);
    }
  }, [initialBoard, activeCard, isPending]);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const visibleColumns = useMemo(() => {
    if (!mobileColumn) return RELAY_KANBAN_COLUMNS;
    return RELAY_KANBAN_COLUMNS.filter((c) => c.id === mobileColumn);
  }, [mobileColumn]);

  const onDragStart = (event: DragStartEvent) => {
    const cardId = String(event.active.id).replace("card-", "");
    dragStartRef.current = board;
    for (const col of RELAY_KANBAN_COLUMNS) {
      const card = board[col.id].find((c) => c.id === cardId);
      if (card) {
        setActiveCard(card);
        break;
      }
    }
  };

  const onDragOver = (event: DragOverEvent) => {
    const cardId = String(event.active.id).replace("card-", "");
    const fromCol = findCardColumn(cardId, board);
    const toCol = extractDropTarget(event.over?.id, board);
    if (!fromCol || !toCol || fromCol === toCol) return;

    const card = board[fromCol].find((c) => c.id === cardId);
    if (!card?.taskId || card.isGhost) return;

    const task = findTask(card.taskId, columns);
    if (!task) return;

    const fromBoard = kanbanColumnToBoardColumn(fromCol);
    const toBoard = kanbanColumnToBoardColumn(toCol);
    if (!canMoveTask(task, fromBoard, toBoard, { currentUserId, isDoctor })) return;

    setBoard((prev) => {
      const moving = prev[fromCol].find((c) => c.id === cardId);
      if (!moving) return prev;
      return {
        ...prev,
        [fromCol]: prev[fromCol].filter((c) => c.id !== cardId),
        [toCol]: [moving, ...prev[toCol]],
      };
    });
  };

  const onDragEnd = (event: DragEndEvent) => {
    const cardId = String(event.active.id).replace("card-", "");
    const before = dragStartRef.current ?? initialBoard;
    setActiveCard(null);
    dragStartRef.current = null;

    const fromCol = findCardColumn(cardId, before);
    const toCol = findCardColumn(cardId, board);
    if (!fromCol || !toCol || fromCol === toCol) {
      setBoard(before);
      return;
    }

    const card = board[toCol].find((c) => c.id === cardId);
    if (!card?.taskId || card.isGhost) {
      setBoard(before);
      return;
    }

    const task = findTask(card.taskId, columns);
    if (!task) {
      setBoard(before);
      return;
    }

    const fromBoard = kanbanColumnToBoardColumn(fromCol);
    const toBoard = kanbanColumnToBoardColumn(toCol);
    if (!canMoveTask(task, fromBoard, toBoard, { currentUserId, isDoctor })) {
      setBoard(before);
      return;
    }

    startTransition(async () => {
      const result = await moveTaskStatusByDrag(card.taskId!, toBoard);
      if (result.error || result.notAllowed) {
        setBoard(before);
      }
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
      <div
        className={cn("relay-kanban", mobileColumn && "relay-kanban--mobile-single")}
        aria-busy={isPending}
      >
        {visibleColumns.map((column) => {
          const cards = board[column.id];
          return (
            <div key={column.id} className="relay-kanban__col" data-column={column.id}>
              <header className="relay-kanban__col-head">
                <div className="relay-kanban__col-label">
                  <span
                    className={cn("relay-kanban__dot", `relay-kanban__dot--${column.tone}`)}
                    aria-hidden
                  />
                  <h3>{column.label}</h3>
                  <span className="relay-kanban__count">{cards.length}</span>
                </div>
              </header>
              <KanbanColumnDrop columnId={column.id}>
                <SortableContext
                  items={cards.map((c) => `card-${c.id}`)}
                  strategy={verticalListSortingStrategy}
                >
                  {cards.length === 0 ? (
                    <div className="relay-kanban__empty-state">
                      <span className="relay-kanban__empty-icon" aria-hidden>
                        ✓
                      </span>
                      <p className="relay-kanban__empty-title">{column.emptyTitle}</p>
                      {column.emptyHint ? (
                        <p className="relay-kanban__empty-hint">{column.emptyHint}</p>
                      ) : null}
                    </div>
                  ) : (
                    cards.map((card) => (
                      <SortableKanbanCard
                        key={card.id}
                        card={card}
                        done={column.id === "done"}
                      />
                    ))
                  )}
                </SortableContext>
              </KanbanColumnDrop>
            </div>
          );
        })}
      </div>

      <DragOverlay>
        {activeCard ? (
          <div className="relay-kanban-card-wrap relay-kanban-card-wrap--overlay">
            <RelayKanbanCardView card={activeCard} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

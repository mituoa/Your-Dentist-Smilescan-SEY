"use client";

import Link from "next/link";
import {
  Calendar,
  ClipboardList,
  FileCheck,
  Inbox,
  MessageSquare,
  MoreHorizontal,
  Paperclip,
  Plus,
  Search,
  Settings,
  SlidersHorizontal,
  Users,
} from "lucide-react";

import { RelayCreateMenu } from "@/components/my-tasks/relay-create-menu";
import { TaskActions } from "@/components/my-tasks/task-actions";
import type { MessageDraftListStatus } from "@/lib/message-drafts/list-status";
import type { MyTask } from "@/lib/queries/my-tasks";
import type { RelayConversationRow } from "@/lib/queries/relay-messages";
import type { AssignableMember } from "@/lib/queries/team-members";
import { buildRelayPracticeSnapshot } from "@/lib/relay/build-relay-practice-snapshot";
import {
  RELAY_BOARD_COLUMNS,
  buildRelayBoardCards,
  relayBoardColumnCards,
  relayBoardTotalCount,
  type RelayBoardColumnId,
  type RelaySidebarFilter,
} from "@/lib/relay/relay-taskboard-model";
import type { RelayWorkRow } from "@/lib/relay/build-relay-practice-snapshot";
import { buildRelayWorkContextModel } from "@/lib/relay/relay-work-context-narrative";
import { resolveRelayWorkDecisions } from "@/lib/relay/relay-work-decisions";
import { relayAreaAsPracticeSection } from "@/lib/relay/relay-work-areas";
import type { JournalEntry } from "@/lib/types/journal-entry";
import { useIsMobile } from "@/lib/hooks/use-is-mobile";
import { cn } from "@/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState, type ReactNode } from "react";

type Props = {
  userId: string;
  isDoctor: boolean;
  columns: { open: MyTask[]; pending: MyTask[]; done: MyTask[] };
  assignableMembers: AssignableMember[];
  conversations: RelayConversationRow[];
  journalDrafts: JournalEntry[];
  submissionDraftStatus?: Record<string, MessageDraftListStatus>;
};

const SIDEBAR_ITEMS: { id: RelaySidebarFilter; label: string; icon: ReactNode }[] = [
  { id: "all", label: "Alle Vorgänge", icon: <Inbox className="h-4 w-4" aria-hidden /> },
  { id: "attention", label: "Wartet auf mich", icon: <Inbox className="h-4 w-4" aria-hidden /> },
  { id: "teamwork", label: "Team", icon: <Users className="h-4 w-4" aria-hidden /> },
  { id: "patient_waiting", label: "Patienten", icon: <Calendar className="h-4 w-4" aria-hidden /> },
  { id: "freigaben", label: "Freigaben", icon: <FileCheck className="h-4 w-4" aria-hidden /> },
  { id: "routines", label: "Routinen", icon: <ClipboardList className="h-4 w-4" aria-hidden /> },
];

const TABS = ["Übersicht", "Liste", "Board", "Kalender", "Dateien"] as const;

function initials(label: string): string {
  const parts = label.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 1).toUpperCase();
  return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
}

function priorityLabel(row: RelayWorkRow): { label: string; tone: "high" | "mid" | "low" } {
  if (row.isCritical) return { label: "P1", tone: "high" };
  if (row.dueLabel) return { label: "P2", tone: "mid" };
  return { label: "P3", tone: "low" };
}

function findTask(tasks: MyTask[], id: string) {
  return tasks.find((t) => t.id === id);
}

function findJournal(journals: JournalEntry[], rowId: string) {
  const journalId = rowId.startsWith("journal-") ? rowId.slice("journal-".length) : null;
  if (!journalId) return undefined;
  return journals.find((j) => j.id === journalId);
}

function findConversation(conversations: RelayConversationRow[], rowId: string) {
  const msgId = rowId.startsWith("msg-") ? rowId.slice("msg-".length) : null;
  if (!msgId) return undefined;
  return conversations.find((c) => c.id === msgId);
}

function isMyTask(task: MyTask, userId: string) {
  return task.assignee_ids.includes(userId) || task.specific_recipient_id === userId;
}

export function RelayTaskboard({
  userId,
  isDoctor,
  columns,
  assignableMembers,
  conversations,
  journalDrafts,
  submissionDraftStatus = {},
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isMobile = useIsMobile();
  const [search, setSearch] = useState("");

  const sidebarFilter: RelaySidebarFilter = useMemo(() => {
    const p = searchParams.get("bereich");
    if (!p || p === "all") return "all";
    if (p === "attention" || p === "wartet") return "attention";
    if (p === "teamwork" || p === "team") return "teamwork";
    if (p === "patient_waiting" || p === "patient") return "patient_waiting";
    if (p === "freigaben" || p === "freigabe") return "freigaben";
    if (p === "routines" || p === "routine") return "routines";
    return "all";
  }, [searchParams]);
  const selectedId = searchParams.get("item");

  const snapshot = useMemo(
    () =>
      buildRelayPracticeSnapshot({
        open: columns.open,
        pending: columns.pending,
        members: assignableMembers,
        draftBySubmissionId: submissionDraftStatus,
        conversations,
        journalDrafts,
        isDoctor,
        userId,
        basePath: "/relay",
      }),
    [
      columns.open,
      columns.pending,
      assignableMembers,
      submissionDraftStatus,
      conversations,
      journalDrafts,
      isDoctor,
      userId,
    ]
  );

  const allCards = useMemo(
    () => buildRelayBoardCards(snapshot, columns.done, sidebarFilter),
    [snapshot, columns.done, sidebarFilter]
  );

  const filteredCards = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return allCards;
    return allCards.filter((c) => {
      const r = c.row;
      return (
        r.primaryLabel.toLowerCase().includes(q) ||
        (r.concernLine?.toLowerCase().includes(q) ?? false) ||
        (r.context?.toLowerCase().includes(q) ?? false)
      );
    });
  }, [allCards, search]);

  const totalOpen = relayBoardTotalCount(filteredCards);

  const selectedCard = selectedId
    ? filteredCards.find((c) => c.row.id === selectedId) ?? null
    : null;
  const selectedRow = selectedCard?.row ?? null;
  const selectedTask = selectedRow?.kind === "task" ? findTask([...columns.open, ...columns.pending, ...columns.done], selectedRow.id) : undefined;
  const selectedJournal = selectedRow ? findJournal(journalDrafts, selectedRow.id) : undefined;
  const selectedConversation = selectedRow ? findConversation(conversations, selectedRow.id) : undefined;
  const messageDraftStatus =
    selectedTask?.submission_id
      ? submissionDraftStatus[selectedTask.submission_id] ?? "none"
      : "none";

  const replaceParams = useCallback(
    (mutate: (params: URLSearchParams) => void) => {
      const params = new URLSearchParams(searchParams.toString());
      mutate(params);
      router.replace(`/relay?${params.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

  const setSidebar = (id: RelaySidebarFilter) => {
    replaceParams((params) => {
      if (id === "all") params.delete("bereich");
      else params.set("bereich", id);
      params.delete("item");
    });
  };

  const selectCard = (id: string) => {
    replaceParams((params) => {
      params.set("item", id);
    });
  };

  const closeDetail = () => {
    replaceParams((params) => {
      params.delete("item");
    });
  };

  const showDetail = Boolean(selectedRow) && (!isMobile || selectedRow);

  return (
    <div className="relay-tb">
      <aside className={cn("relay-tb__sidebar", showDetail && isMobile && "hidden")}>
        <div className="relay-tb__brand">
          <span className="relay-tb__brand-mark" aria-hidden />
          <span className="relay-tb__brand-text">Relay</span>
        </div>
        <nav className="relay-tb__nav" aria-label="Bereiche">
          <p className="relay-tb__nav-label">Workspace</p>
          <ul className="relay-tb__nav-list">
            {SIDEBAR_ITEMS.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  className={cn(
                    "relay-tb__nav-item",
                    sidebarFilter === item.id && "relay-tb__nav-item--active"
                  )}
                  onClick={() => setSidebar(item.id)}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>
        <div className="relay-tb__sidebar-foot">
          <Link href="/settings" className="relay-tb__nav-item">
            <Settings className="h-4 w-4" aria-hidden />
            <span>Einstellungen</span>
          </Link>
        </div>
      </aside>

      <div className={cn("relay-tb__main", showDetail && isMobile && "hidden")}>
        <header className="relay-tb__header">
          <div className="relay-tb__header-top">
            <h1 className="relay-tb__title">Relay</h1>
            <div className="relay-tb__header-actions">
              <div className="relay-tb__search">
                <Search className="relay-tb__search-icon" aria-hidden />
                <input
                  type="search"
                  className="relay-tb__search-input"
                  placeholder="Vorgang suchen…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <button type="button" className="relay-tb__btn relay-tb__btn--ghost">
                <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden />
                Filter
              </button>
              <button type="button" className="relay-tb__btn relay-tb__btn--ghost">
                Sortierung
              </button>
              <RelayCreateMenu
                placement="inline"
                assignableMembers={assignableMembers}
                currentUserId={userId}
                isDoctor={isDoctor}
                label="Neuer Vorgang"
                className="relay-tb__create-wrap"
              />
            </div>
          </div>
          <div className="relay-tb__tabs" role="tablist" aria-label="Ansichten">
            {TABS.map((tab) => (
              <button
                key={tab}
                type="button"
                role="tab"
                aria-selected={tab === "Board"}
                className={cn("relay-tb__tab", tab === "Board" && "relay-tb__tab--active")}
                disabled={tab !== "Board"}
              >
                {tab}
              </button>
            ))}
            <span className="relay-tb__tab-meta">{totalOpen} offen</span>
          </div>
        </header>

        <div className="relay-tb__board">
          {RELAY_BOARD_COLUMNS.map((col) => {
            const colCards = relayBoardColumnCards(filteredCards, col.id);
            return (
              <section key={col.id} className="relay-tb__col">
                <header className="relay-tb__col-head">
                  <h2 className="relay-tb__col-title">
                    {col.title}
                    <span className="relay-tb__col-count">{colCards.length}</span>
                  </h2>
                  <div className="relay-tb__col-actions">
                    <button type="button" className="relay-tb__col-btn" aria-label="Hinzufügen">
                      <Plus className="h-3.5 w-3.5" aria-hidden />
                    </button>
                    <button type="button" className="relay-tb__col-btn" aria-label="Menü">
                      <MoreHorizontal className="h-3.5 w-3.5" aria-hidden />
                    </button>
                  </div>
                </header>
                <div className="relay-tb__col-cards">
                  {colCards.length === 0 ? (
                    <p className="relay-tb__col-empty">—</p>
                  ) : (
                    colCards.map(({ row }) => {
                      const prio = priorityLabel(row);
                      const subtitle =
                        row.concernLine?.trim() || row.context?.trim() || row.typeLabel;
                      const date = row.waitingLabel ?? row.dueLabel ?? row.timeLabel;
                      const active = row.id === selectedId;
                      return (
                        <button
                          key={row.id}
                          type="button"
                          className={cn("relay-tb__card", active && "relay-tb__card--active")}
                          onClick={() => selectCard(row.id)}
                        >
                          <span className="relay-tb__card-title">{row.primaryLabel}</span>
                          {subtitle ? (
                            <span className="relay-tb__card-sub">{subtitle}</span>
                          ) : null}
                          <span className="relay-tb__card-meta">
                            <span
                              className={cn(
                                "relay-tb__prio",
                                `relay-tb__prio--${prio.tone}`
                              )}
                            >
                              {prio.label}
                            </span>
                            {date ? (
                              <span className="relay-tb__card-date">
                                <Calendar className="h-3 w-3" aria-hidden />
                                {date}
                              </span>
                            ) : null}
                            <span className="relay-tb__card-assignee">{row.toLabel}</span>
                            {row.kind === "message" ? (
                              <MessageSquare className="relay-tb__card-icon" aria-hidden />
                            ) : null}
                            {row.kind === "journal" ? (
                              <Paperclip className="relay-tb__card-icon" aria-hidden />
                            ) : null}
                            <span className="relay-tb__avatar" title={row.fromLabel}>
                              {initials(row.fromLabel)}
                            </span>
                          </span>
                        </button>
                      );
                    })
                  )}
                </div>
              </section>
            );
          })}
        </div>
      </div>

      {showDetail && selectedRow ? (
        <aside className="relay-tb__detail">
          <RelayTaskboardDetail
            row={selectedRow}
            task={selectedTask}
            journal={selectedJournal}
            conversation={selectedConversation}
            isDoctor={isDoctor}
            userId={userId}
            messageDraftStatus={messageDraftStatus}
            onClose={closeDetail}
          />
        </aside>
      ) : null}
    </div>
  );
}

function RelayTaskboardDetail({
  row,
  task,
  journal,
  conversation,
  isDoctor,
  userId,
  messageDraftStatus,
  onClose,
}: {
  row: RelayWorkRow;
  task?: MyTask;
  journal?: JournalEntry;
  conversation?: RelayConversationRow;
  isDoctor: boolean;
  userId: string;
  messageDraftStatus?: MessageDraftListStatus;
  onClose: () => void;
}) {
  const section = relayAreaAsPracticeSection("attention");
  const model = buildRelayWorkContextModel(row, section, {
    task,
    journal,
    conversation,
    isDoctor,
    messageDraftStatus,
  });
  const context = [model.narrative[0]?.body, model.narrative[1]?.body].filter(Boolean).join("\n\n");
  const decisions = resolveRelayWorkDecisions(row, {
    task,
    journal,
    conversation,
    messageDraftStatus,
  }).slice(0, 3);
  const trackerHref = task?.submission_id ? `/inbox/${task.submission_id}` : null;

  return (
    <div className="relay-tb__detail-inner">
      <header className="relay-tb__detail-head">
        <button type="button" className="relay-tb__detail-close" onClick={onClose}>
          Schließen
        </button>
        <h2 className="relay-tb__detail-title">{row.primaryLabel}</h2>
        <dl className="relay-tb__detail-meta">
          <div>
            <dt>Fall / Patient</dt>
            <dd>{task?.submission_patient_name?.trim() || "—"}</dd>
          </div>
          <div>
            <dt>Zuständig</dt>
            <dd>{row.toLabel}</dd>
          </div>
          <div>
            <dt>Fälligkeit</dt>
            <dd>{row.dueLabel ?? row.waitingLabel ?? row.timeLabel}</dd>
          </div>
          <div>
            <dt>Priorität</dt>
            <dd>{row.isCritical ? "Dringend" : row.dueLabel ? "Fällig" : "Normal"}</dd>
          </div>
          <div>
            <dt>Status</dt>
            <dd>{row.statusLabel}</dd>
          </div>
        </dl>
      </header>
      {context ? (
        <section className="relay-tb__detail-block">
          <h3>Kommentar</h3>
          <p>{context}</p>
        </section>
      ) : null}
      <footer className="relay-tb__detail-foot">
        {task && task.status !== "done" ? (
          <TaskActions
            taskId={task.id}
            status={task.status}
            isDoctor={isDoctor}
            isMyTask={isMyTask(task, userId)}
            doctorSelfTask={isDoctor && task.created_by === userId}
          />
        ) : (
          <div className="relay-tb__detail-actions">
            {decisions.map((d, i) =>
              d.href ? (
                <Link
                  key={d.id}
                  href={d.href}
                  className={cn(
                    "relay-tb__btn",
                    i === 0 ? "relay-tb__btn--primary" : "relay-tb__btn--ghost"
                  )}
                >
                  {d.label}
                </Link>
              ) : null
            )}
          </div>
        )}
        {trackerHref ? (
          <Link href={trackerHref} className="relay-tb__detail-link">
            Fall im Tracker öffnen
          </Link>
        ) : null}
      </footer>
    </div>
  );
}

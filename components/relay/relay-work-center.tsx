"use client";

import {
  ClipboardList,
  MessageSquare,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo, useSyncExternalStore } from "react";

import { RelayCommandTaskPrefill } from "@/components/command-ai/relay-command-task-prefill";
import { parseKanbanMobileColumn } from "@/lib/relay/relay-kanban-columns";
import { RelayKanbanBoard } from "@/components/relay/relay-kanban-board";
import { RelayTeamInboxList } from "@/components/relay/relay-team-inbox-list";
import type { MessageDraftListStatus } from "@/lib/message-drafts/list-status";
import type { MyTask } from "@/lib/queries/my-tasks";
import type { RelayConversationRow } from "@/lib/queries/relay-messages";
import type { AssignableMember } from "@/lib/queries/team-members";
import type { JournalEntry } from "@/lib/types/journal-entry";
import {
  RELAY_KANBAN_COLUMNS,
  RELAY_MESSAGE_INBOX_TABS,
  RELAY_TASK_SCOPE_TABS,
  buildRelayKanbanBoard,
  buildRelayTeamInboxRows,
  countRelayMessageInboxTabs,
  countRelayTaskScope,
  type RelayMessageInboxTab,
  type RelayTaskScopeTab,
} from "@/lib/relay/relay-work-center-model";
import { cn } from "@/lib/utils";

type Props = {
  userId: string;
  isDoctor: boolean;
  columns: { open: MyTask[]; pending: MyTask[]; done: MyTask[] };
  assignableMembers: AssignableMember[];
  conversations: RelayConversationRow[];
  journalDrafts: JournalEntry[];
  submissionDraftStatus?: Record<string, MessageDraftListStatus>;
};

function parseScope(value: string | null): RelayTaskScopeTab {
  if (value === "mine" || value === "delegated") return value;
  return "all";
}

function parseMessageTab(value: string | null): RelayMessageInboxTab {
  if (value === "mentions" || value === "all") return value;
  return "unread";
}

const RELAY_KANBAN_MOBILE_MQ = "(max-width: 1023px)";

function useRelayKanbanMobile(): boolean {
  return useSyncExternalStore(
    (cb) => {
      const mq = window.matchMedia(RELAY_KANBAN_MOBILE_MQ);
      mq.addEventListener("change", cb);
      return () => mq.removeEventListener("change", cb);
    },
    () => window.matchMedia(RELAY_KANBAN_MOBILE_MQ).matches,
    () => false
  );
}

export function RelayWorkCenter({
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
  const isKanbanMobile = useRelayKanbanMobile();
  const scope = parseScope(searchParams.get("scope"));
  const messageTab = parseMessageTab(searchParams.get("msg"));
  const searchQuery = searchParams.get("q") ?? "";
  const mobileKanbanCol = parseKanbanMobileColumn(searchParams.get("kanban"));

  const replaceParams = useCallback(
    (mutate: (params: URLSearchParams) => void) => {
      const params = new URLSearchParams(searchParams.toString());
      mutate(params);
      router.replace(`/relay?${params.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

  const scopeCounts = useMemo(
    () =>
      countRelayTaskScope(
        columns,
        journalDrafts,
        assignableMembers,
        submissionDraftStatus,
        isDoctor,
        userId
      ),
    [columns, journalDrafts, assignableMembers, submissionDraftStatus, isDoctor, userId]
  );

  const board = useMemo(
    () =>
      buildRelayKanbanBoard({
        columns,
        journalDrafts,
        assignableMembers,
        submissionDraftStatus,
        isDoctor,
        userId,
        scope,
        searchQuery,
      }),
    [
      columns,
      journalDrafts,
      assignableMembers,
      submissionDraftStatus,
      isDoctor,
      userId,
      scope,
      searchQuery,
    ]
  );

  const messageCounts = useMemo(() => countRelayMessageInboxTabs(conversations), [conversations]);

  const inboxRows = useMemo(
    () => buildRelayTeamInboxRows(conversations, messageTab, searchQuery),
    [conversations, messageTab, searchQuery]
  );

  const activeArea =
    searchParams.get("area") === "nachrichten" || searchParams.get("conversation")
      ? "nachrichten"
      : "aufgaben";

  const openArea = (area: "aufgaben" | "nachrichten") => {
    replaceParams((p) => {
      p.set("area", area);
      if (area === "aufgaben") {
        p.delete("conversation");
      }
    });
  };

  return (
    <div className="relay-center relay-center--premium relay-center--v3" data-relay-ui="work-center">
      <RelayCommandTaskPrefill />

      <div className="relay-center__layout">
        <nav className="relay-center__areas relay-center__areas--desktop" aria-label="Arbeitsbereiche">
          <ul className="relay-center__areas-list">
            <li>
              <button
                type="button"
                className={cn(
                  "relay-center__area",
                  activeArea === "aufgaben" && "relay-center__area--active"
                )}
                onClick={() => openArea("aufgaben")}
                aria-current={activeArea === "aufgaben" ? "true" : undefined}
              >
                <span className="relay-center__area-icon" aria-hidden>
                  <ClipboardList strokeWidth={1.75} />
                </span>
                <span className="relay-center__area-copy">
                  <span className="relay-center__area-title">Aufgaben</span>
                  <span className="relay-center__area-hint">Kanban & Freigaben</span>
                </span>
              </button>
            </li>
            <li>
              <button
                type="button"
                className={cn(
                  "relay-center__area",
                  activeArea === "nachrichten" && "relay-center__area--active"
                )}
                onClick={() => openArea("nachrichten")}
                aria-current={activeArea === "nachrichten" ? "true" : undefined}
              >
                <span className="relay-center__area-icon" aria-hidden>
                  <MessageSquare strokeWidth={1.75} />
                </span>
                <span className="relay-center__area-copy">
                  <span className="relay-center__area-title">
                    <span className="relay-center__area-label relay-center__area-label--long">Teamnachrichten</span>
                    <span className="relay-center__area-label relay-center__area-label--short">Team</span>
                  </span>
                  <span className="relay-center__area-hint">Interne Übergaben</span>
                </span>
                {messageCounts.unread > 0 ? (
                  <span className="relay-center__area-count">{messageCounts.unread}</span>
                ) : null}
              </button>
            </li>
          </ul>
        </nav>

        <div className="relay-center__main">
          <nav className="relay-center__areas relay-center__areas--mobile" aria-label="Arbeitsbereich wählen">
            <ul className="relay-center__areas-list relay-center__areas-list--mobile">
              <li>
                <button
                  type="button"
                  className={cn(
                    "relay-center__area",
                    activeArea === "aufgaben" && "relay-center__area--active"
                  )}
                  onClick={() => openArea("aufgaben")}
                  aria-current={activeArea === "aufgaben" ? "true" : undefined}
                >
                  <ClipboardList strokeWidth={1.75} aria-hidden />
                  <span>Aufgaben</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className={cn(
                    "relay-center__area",
                    activeArea === "nachrichten" && "relay-center__area--active"
                  )}
                  onClick={() => openArea("nachrichten")}
                  aria-current={activeArea === "nachrichten" ? "true" : undefined}
                >
                  <MessageSquare strokeWidth={1.75} aria-hidden />
                  <span>Teamnachrichten</span>
                  {messageCounts.unread > 0 ? (
                    <span className="relay-center__area-count">{messageCounts.unread}</span>
                  ) : null}
                </button>
              </li>
            </ul>
          </nav>

          {activeArea === "aufgaben" ? (
          <section id="relay-aufgaben" className="relay-center__panel" aria-labelledby="relay-aufgaben-title">
            <header className="relay-center__panel-head">
              <div className="relay-center__panel-title-row">
                <ClipboardList strokeWidth={1.75} className="relay-center__panel-icon" aria-hidden />
                <h2 id="relay-aufgaben-title" className="relay-center__panel-title">
                  Aufgaben
                </h2>
              </div>
            </header>

            <div className="relay-center__chip-scroll">
              <div className="relay-center__chips" role="tablist" aria-label="Aufgaben-Ansicht">
                {RELAY_TASK_SCOPE_TABS.map((tab) => {
                  const active = scope === tab.id;
                  const count = scopeCounts[tab.id];
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      className={cn("relay-center__chip", active && "relay-center__chip--active")}
                      onClick={() =>
                        replaceParams((p) => {
                          p.set("scope", tab.id);
                        })
                      }
                    >
                      {tab.label}
                      <span className="relay-center__chip-count">{count}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="relay-center__kanban-col-scroll lg:hidden">
              <div className="relay-center__chips" role="tablist" aria-label="Kanban-Spalte">
                {RELAY_KANBAN_COLUMNS.map((col) => {
                  const active = mobileKanbanCol === col.id;
                  const count = board[col.id].length;
                  return (
                    <button
                      key={col.id}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      className={cn("relay-center__chip", active && "relay-center__chip--active")}
                      onClick={() =>
                        replaceParams((p) => {
                          p.set("kanban", col.id);
                        })
                      }
                    >
                      {col.id === "decision"
                        ? "Entscheidung"
                        : col.id === "in_progress"
                          ? "Bearbeitung"
                          : "Erledigt"}
                      <span className="relay-center__chip-count">{count}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <RelayKanbanBoard
              board={board}
              columns={columns}
              currentUserId={userId}
              isDoctor={isDoctor}
              mobileColumn={isKanbanMobile ? mobileKanbanCol : null}
            />
          </section>
          ) : (
          <section
            id="relay-nachrichten"
            className="relay-center__panel"
            aria-labelledby="relay-nachrichten-title"
          >
            <header className="relay-center__panel-head">
              <div className="relay-center__panel-title-row">
                <MessageSquare strokeWidth={1.75} className="relay-center__panel-icon" aria-hidden />
                <h2 id="relay-nachrichten-title" className="relay-center__panel-title">
                  Nachrichten vom Team
                </h2>
              </div>
            </header>

            <div className="relay-center__chip-scroll">
              <div className="relay-center__chips" role="tablist" aria-label="Nachrichten-Ansicht">
                {RELAY_MESSAGE_INBOX_TABS.map((tab) => {
                  const active = messageTab === tab.id;
                  const count = messageCounts[tab.id];
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      className={cn("relay-center__chip", active && "relay-center__chip--active")}
                      onClick={() =>
                        replaceParams((p) => {
                          p.set("msg", tab.id);
                          p.set("area", "nachrichten");
                        })
                      }
                    >
                      {tab.label}
                      {count > 0 ? <span className="relay-center__chip-count">{count}</span> : null}
                    </button>
                  );
                })}
              </div>
            </div>

            <RelayTeamInboxList rows={inboxRows} />

            <footer className="relay-center__panel-foot">
              <Link href="/relay?area=nachrichten&msg=all" className="relay-center__foot-link">
                Alle Nachrichten anzeigen →
              </Link>
            </footer>
          </section>
          )}
        </div>
      </div>
    </div>
  );
}

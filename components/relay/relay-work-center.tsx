"use client";

import {
  ClipboardList,
  MessageSquare,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";

import { RelayCommandTaskPrefill } from "@/components/command-ai/relay-command-task-prefill";
import { RelayKanbanCardView } from "@/components/relay/relay-kanban-card";
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
  const scope = parseScope(searchParams.get("scope"));
  const messageTab = parseMessageTab(searchParams.get("msg"));
  const searchQuery = searchParams.get("q") ?? "";

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
    <div className="relay-center relay-center--premium" data-relay-ui="work-center">
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
                <span className="relay-center__area-label relay-center__area-label--long">Teamnachrichten</span>
                <span className="relay-center__area-label relay-center__area-label--short">Team</span>
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

            <div className="relay-center__tabs" role="tablist" aria-label="Aufgaben-Ansicht">
              {RELAY_TASK_SCOPE_TABS.map((tab) => {
                const active = scope === tab.id;
                const count = scopeCounts[tab.id];
                return (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    className={cn("relay-center__tab", active && "relay-center__tab--active")}
                    onClick={() =>
                      replaceParams((p) => {
                        p.set("scope", tab.id);
                      })
                    }
                  >
                    {tab.label}
                    <span className="relay-center__tab-count">{count}</span>
                  </button>
                );
              })}
            </div>

            <div className="relay-kanban">
              {RELAY_KANBAN_COLUMNS.map((column) => {
                const cards = board[column.id];
                return (
                  <div key={column.id} className="relay-kanban__col">
                    <header className="relay-kanban__col-head">
                      <div className="relay-kanban__col-label">
                        <span
                          className={cn(
                            "relay-kanban__dot",
                            `relay-kanban__dot--${column.tone}`
                          )}
                          aria-hidden
                        />
                        <h3>{column.label}</h3>
                        <span className="relay-kanban__count">{cards.length}</span>
                      </div>
                    </header>
                    <div className="relay-kanban__cards">
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
                          <RelayKanbanCardView
                            key={card.id}
                            card={card}
                            done={column.id === "done"}
                          />
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
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

            <div className="relay-center__tabs" role="tablist" aria-label="Nachrichten-Ansicht">
              {RELAY_MESSAGE_INBOX_TABS.map((tab) => {
                const active = messageTab === tab.id;
                const count = messageCounts[tab.id];
                return (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    className={cn("relay-center__tab", active && "relay-center__tab--active")}
                    onClick={() =>
                      replaceParams((p) => {
                        p.set("msg", tab.id);
                        p.set("area", "nachrichten");
                      })
                    }
                  >
                    {tab.label}
                    {count > 0 ? <span className="relay-center__tab-count">{count}</span> : null}
                  </button>
                );
              })}
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

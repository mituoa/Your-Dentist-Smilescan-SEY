"use client";

import { ArrowLeft, ArrowRight, BookOpen, UserRound, Users } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo, type ReactNode } from "react";

import { RelayCommandTaskPrefill } from "@/components/command-ai/relay-command-task-prefill";
import { RelayCreateMenu } from "@/components/my-tasks/relay-create-menu";
import { RelayTrackerShell } from "@/components/my-tasks/relay-tracker-shell";
import {
  RelayWorkActionsPanel,
  RelayWorkContextPanel,
} from "@/components/my-tasks/relay-work-detail-panel";
import { RelayWorkListColumn } from "@/components/my-tasks/relay-work-list-column";
import type { MessageDraftListStatus } from "@/lib/message-drafts/list-status";
import type { MyTask } from "@/lib/queries/my-tasks";
import type { RelayConversationRow } from "@/lib/queries/relay-messages";
import type { AssignableMember } from "@/lib/queries/team-members";
import { buildRelayPracticeSnapshot } from "@/lib/relay/build-relay-practice-snapshot";
import {
  RELAY_DECISION_DOMAIN_CONFIG,
  RELAY_HOME_BENTO_DOMAINS,
  buildRelayDecisionHero,
  buildRelayDecisionTiles,
  buildRelayPriorityItems,
  findRelayDecisionRow,
  parseRelayDecisionDomain,
  relayDecisionDomainRows,
  resolveRowPracticeSection,
  type RelayDecisionDomain,
  type RelayDecisionTile,
  type RelayPriorityItem,
} from "@/lib/relay/relay-decision-center-model";
import type { JournalEntry } from "@/lib/types/journal-entry";

type Props = {
  userId: string;
  isDoctor: boolean;
  columns: { open: MyTask[]; pending: MyTask[]; done: MyTask[] };
  assignableMembers: AssignableMember[];
  conversations: RelayConversationRow[];
  journalDrafts: JournalEntry[];
  submissionDraftStatus?: Record<string, MessageDraftListStatus>;
};

const TILE_ICONS: Record<RelayDecisionDomain, ReactNode> = {
  journal: <BookOpen strokeWidth={1.75} aria-hidden />,
  patienten: <UserRound strokeWidth={1.75} aria-hidden />,
  praxis: <BookOpen strokeWidth={1.75} aria-hidden />,
  team: <Users strokeWidth={1.75} aria-hidden />,
};

function findTask(columns: Props["columns"], id: string) {
  return [...columns.open, ...columns.pending].find((t) => t.id === id);
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

function journalFactLabel(count: number): string {
  if (count === 0) return "Keine Journalfreigaben";
  if (count === 1) return "1 Journalfreigabe";
  return `${count} Journalfreigaben`;
}

function patientFactLabel(count: number): string {
  if (count === 0) return "Keine Patientenanfragen";
  if (count === 1) return "1 Patientenanfrage";
  return `${count} Patientenanfragen`;
}

function teamFactLabel(count: number): string {
  if (count === 0) return "Keine Teamentscheidungen";
  if (count === 1) return "1 Teamentscheidung";
  return `${count} Teamentscheidungen`;
}

function BentoAreaCard({
  tile,
  onSelect,
}: {
  tile: RelayDecisionTile;
  onSelect: (id: RelayDecisionDomain) => void;
}) {
  return (
    <button type="button" className="relay-dc-bento__card" onClick={() => onSelect(tile.id)}>
      <span className="relay-dc-bento__icon">{TILE_ICONS[tile.id]}</span>
      <span className="relay-dc-bento__copy">
        <span className="relay-dc-bento__title">{tile.title}</span>
        <span className="relay-dc-bento__headline">{tile.headline}</span>
        <span className="relay-dc-bento__context">{tile.context}</span>
      </span>
      {tile.count > 0 ? (
        <span className="relay-dc-bento__count" aria-label={`${tile.count} offen`}>
          {tile.count}
        </span>
      ) : null}
    </button>
  );
}

function CaseCard({
  item,
  onOpen,
}: {
  item: RelayPriorityItem;
  onOpen: (domain: RelayDecisionDomain, rowId: string) => void;
}) {
  return (
    <article className="relay-dc-case">
      <div className="relay-dc-case__top">
        <span className="relay-dc-case__domain">{item.domainLabel}</span>
        <span className="relay-dc-case__type">{item.typeLabel}</span>
      </div>
      <h3 className="relay-dc-case__title">{item.title}</h3>
      <dl className="relay-dc-case__meta">
        <div className="relay-dc-case__meta-row">
          <dt>Verantwortlich</dt>
          <dd>{item.assigneeLabel}</dd>
        </div>
        <div className="relay-dc-case__meta-row">
          <dt>Wartezeit</dt>
          <dd>{item.waitLabel}</dd>
        </div>
      </dl>
      <button
        type="button"
        className="relay-dc-case__action"
        onClick={() => onOpen(item.domain, item.id)}
      >
        {item.actionLabel}
        <ArrowRight className="h-3.5 w-3.5" aria-hidden />
      </button>
    </article>
  );
}

export function RelayDecisionCenter({
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

  const activeDomain = parseRelayDecisionDomain(searchParams.get("bereich"));
  const selectedRowId = searchParams.get("item");

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

  const hero = useMemo(() => buildRelayDecisionHero(snapshot), [snapshot]);
  const allTiles = useMemo(() => buildRelayDecisionTiles(snapshot), [snapshot]);
  const bentoTiles = useMemo(
    () => allTiles.filter((tile) => RELAY_HOME_BENTO_DOMAINS.includes(tile.id)),
    [allTiles]
  );
  const priorityItems = useMemo(() => buildRelayPriorityItems(snapshot), [snapshot]);

  const resolvedSelection = useMemo(
    () => (selectedRowId ? findRelayDecisionRow(snapshot, selectedRowId) : null),
    [snapshot, selectedRowId]
  );

  const effectiveDomain = resolvedSelection?.domain ?? activeDomain;
  const selectedRow = resolvedSelection?.row ?? null;
  const activeRows = effectiveDomain ? relayDecisionDomainRows(snapshot, effectiveDomain) : [];
  const domainConfig = effectiveDomain ? RELAY_DECISION_DOMAIN_CONFIG[effectiveDomain] : null;

  const selectedTask =
    selectedRow?.kind === "task" ? findTask(columns, selectedRow.id) : undefined;
  const selectedJournal =
    selectedRow?.kind === "journal" ? findJournal(journalDrafts, selectedRow.id) : undefined;
  const selectedConversation =
    selectedRow?.kind === "message" ? findConversation(conversations, selectedRow.id) : undefined;
  const messageDraftStatus =
    selectedTask?.submission_id
      ? submissionDraftStatus[selectedTask.submission_id] ?? "none"
      : "none";

  const rowSection = selectedRow
    ? resolveRowPracticeSection(snapshot, selectedRow)
    : effectiveDomain === "journal"
      ? "attention"
      : effectiveDomain === "patienten"
        ? "patient_waiting"
        : effectiveDomain === "team"
          ? "teamwork"
          : "practice";

  const replaceParams = useCallback(
    (mutate: (params: URLSearchParams) => void) => {
      const params = new URLSearchParams(searchParams.toString());
      mutate(params);
      router.replace(`/relay?${params.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

  const openDomain = (domain: RelayDecisionDomain) => {
    replaceParams((params) => {
      params.set("bereich", domain);
      params.delete("item");
      params.delete("gruppe");
      params.delete("conversation");
    });
  };

  const openItem = (domain: RelayDecisionDomain, rowId: string) => {
    replaceParams((params) => {
      params.set("bereich", domain);
      params.set("item", rowId);
      params.delete("gruppe");
      params.delete("conversation");
    });
  };

  const goHome = () => {
    replaceParams((params) => {
      params.delete("bereich");
      params.delete("item");
      params.delete("gruppe");
      params.delete("conversation");
    });
  };

  const selectRow = (rowId: string) => {
    if (!effectiveDomain) return;
    openItem(effectiveDomain, rowId);
  };

  const closeDetail = () => {
    replaceParams((params) => {
      params.delete("item");
    });
  };

  const handleProcessNow = () => {
    const first = priorityItems[0];
    if (first) {
      openItem(first.domain, first.id);
      return;
    }
    const firstDomain = RELAY_HOME_BENTO_DOMAINS.find(
      (domain) => relayDecisionDomainRows(snapshot, domain).length > 0
    );
    if (firstDomain) openDomain(firstDomain);
  };

  const view = !activeDomain && !selectedRowId ? "home" : !selectedRowId ? "list" : "detail";

  const panelProps = {
    row: selectedRow,
    section: rowSection,
    sectionTitle: domainConfig?.title ?? "Relay",
    fallbackRows: activeRows,
    task: selectedTask,
    journal: selectedJournal,
    conversation: selectedConversation,
    isDoctor,
    userId,
    messageDraftStatus,
    onBack: view === "detail" ? closeDetail : goHome,
    onOpenMessage: (id: string) => {
      if (!effectiveDomain) return;
      openItem(effectiveDomain, `msg-${id}`);
    },
  };

  return (
    <div className="relay-dc yd-relay yd-relay-central yd-relay-v6 yd-relay-v7 yd-relay-v8 flex min-h-0 flex-1 flex-col">
      <RelayCommandTaskPrefill />

      {view === "home" ? (
        <div className="relay-dc-home">
          <div className="relay-dc-home__masthead">
            <section className="relay-dc-hero" aria-labelledby="relay-dc-hero-title">
              <p className="relay-dc-hero__eyebrow">Heute benötigt Aufmerksamkeit</p>
              <h1 id="relay-dc-hero-title" className="relay-dc-hero__stat">
                {hero.totalOpen === 0 ? (
                  "Alles erledigt"
                ) : (
                  <>
                    <span className="relay-dc-hero__number">{hero.totalOpen}</span>
                    <span className="relay-dc-hero__stat-label">offene Vorgänge</span>
                  </>
                )}
              </h1>
              <ul className="relay-dc-hero__facts">
                <li>{journalFactLabel(hero.journalApprovals)}</li>
                <li>{patientFactLabel(hero.patientWaiting)}</li>
                <li>{teamFactLabel(hero.teamDecisions)}</li>
              </ul>
              {hero.totalOpen > 0 ? (
                <button type="button" className="relay-dc-hero__cta" onClick={handleProcessNow}>
                  Jetzt bearbeiten
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </button>
              ) : (
                <p className="relay-dc-hero__clear">Keine offenen Entscheidungen — Relay ist aufgeräumt.</p>
              )}
            </section>

            <aside className="relay-dc-bento" aria-label="Entscheidungsbereiche">
              {bentoTiles.map((tile) => (
                <BentoAreaCard key={tile.id} tile={tile} onSelect={openDomain} />
              ))}
            </aside>
          </div>

          <section className="relay-dc-cases" aria-labelledby="relay-dc-cases-title">
            <div className="relay-dc-cases__head">
              <h2 id="relay-dc-cases-title" className="relay-dc-section-title">
                Wichtige offene Vorgänge
              </h2>
              <RelayCreateMenu
                placement="inline"
                assignableMembers={assignableMembers}
                currentUserId={userId}
                isDoctor={isDoctor}
                label="Praxisaufgabe"
                className="relay-dc-cases__create"
              />
            </div>
            {priorityItems.length > 0 ? (
              <div className="relay-dc-cases__grid">
                {priorityItems.map((item) => (
                  <CaseCard key={item.id} item={item} onOpen={openItem} />
                ))}
              </div>
            ) : (
              <div className="relay-dc-cases__empty">
                <p>Keine dringenden Vorgänge — Journal, Patienten und Team sind aufgeräumt.</p>
              </div>
            )}
          </section>
        </div>
      ) : (
        <div className="relay-dc-workspace">
          <header className="relay-dc-workspace__head">
            <button type="button" className="relay-dc-workspace__back" onClick={goHome}>
              <ArrowLeft className="h-4 w-4" aria-hidden />
              Entscheidungszentrale
            </button>
            <h2 className="relay-dc-workspace__title">{domainConfig?.title}</h2>
            <p className="relay-dc-workspace__meta">
              {activeRows.length === 0
                ? "Keine offenen Vorgänge"
                : `${activeRows.length} offen`}
            </p>
          </header>

          <RelayTrackerShell
            showWorkspace={view === "detail"}
            list={
              <RelayWorkListColumn
                groupByTeam={effectiveDomain === "team"}
                rows={activeRows}
                selectedId={selectedRowId}
                emptyTitle={domainConfig?.emptyTitle ?? ""}
                emptyBody={domainConfig?.emptyBody ?? ""}
                assignableMembers={assignableMembers}
                currentUserId={userId}
                isDoctor={isDoctor}
                onSelect={selectRow}
              />
            }
            context={<RelayWorkContextPanel {...panelProps} />}
            actions={<RelayWorkActionsPanel {...panelProps} />}
          />
        </div>
      )}
    </div>
  );
}

"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState, type ReactNode } from "react";
import {
  ArrowRight,
  ClipboardList,
  FileText,
  MessageSquare,
  Users,
} from "lucide-react";

import { RelayCommandTaskPrefill } from "@/components/command-ai/relay-command-task-prefill";
import { RelayCentralTaskCard } from "@/components/my-tasks/relay-central-task-card";
import { RelayCreateMenu } from "@/components/my-tasks/relay-create-menu";
import { RelayMessagesCentralView } from "@/components/my-tasks/relay-messages-central-view";
import type { MyTask } from "@/lib/queries/my-tasks";
import type { MessageDraftListStatus } from "@/lib/message-drafts/list-status";
import type { RelayConversationRow } from "@/lib/queries/relay-messages";
import type { AssignableMember } from "@/lib/queries/team-members";
import type { JournalEntry } from "@/lib/types/journal-entry";
import {
  buildRelayPracticeSnapshot,
  type RelayPracticeSection,
  type RelayWorkRow,
} from "@/lib/relay/build-relay-practice-snapshot";
import { cn } from "@/lib/utils";

type RelayPracticeCentralViewProps = {
  userId: string;
  isDoctor: boolean;
  columns: {
    open: MyTask[];
    pending: MyTask[];
    done: MyTask[];
  };
  assignableMembers: AssignableMember[];
  conversations: RelayConversationRow[];
  journalDrafts: JournalEntry[];
  submissionDraftStatus?: Record<string, MessageDraftListStatus>;
};

type MainTab = "arbeitsbereich" | "nachrichten";

type SummaryCard = {
  id: RelayPracticeSection;
  tone: RelayPracticeSection;
  icon: typeof FileText;
  countLabel: (n: number) => string;
  hint: string;
  panelTitle: string;
  emptyTitle: string;
  emptyBody: string;
  createHref?: string;
  createLabel?: string;
};

const SUMMARY_CARDS: SummaryCard[] = [
  {
    id: "attention",
    tone: "attention",
    icon: FileText,
    countLabel: (n) => (n === 1 ? "1 Offene Aufgabe" : `${n} Offene Aufgaben`),
    hint: "Warten auf Ihre Entscheidung",
    panelTitle: "Benötigt Ihre Aufmerksamkeit",
    emptyTitle: "Keine offenen Freigaben.",
    emptyBody: "Neue Freigaben aus Journal, Tracker oder Teamaufgaben erscheinen hier.",
    createHref: "/my-tasks/new",
    createLabel: "Praxisaufgabe erstellen",
  },
  {
    id: "teamwork",
    tone: "teamwork",
    icon: Users,
    countLabel: (n) => (n === 1 ? "1 Team wartet" : `${n} Team wartet`),
    hint: "Rückmeldungen ausstehend",
    panelTitle: "Team wartet",
    emptyTitle: "Kein Team wartet derzeit auf Sie.",
    emptyBody: "Rückmeldungen und offene Team-Schritte erscheinen hier.",
    createHref: "/my-tasks/new",
    createLabel: "Teamaufgabe zuweisen",
  },
  {
    id: "handovers",
    tone: "handovers",
    icon: MessageSquare,
    countLabel: (n) => (n === 1 ? "1 Interne Nachricht" : `${n} Interne Nachrichten`),
    hint: "Ungelesene Nachrichten",
    panelTitle: "Interne Nachrichten",
    emptyTitle: "Keine internen Nachrichten.",
    emptyBody: "Übergaben und Direktnachrichten im Team erscheinen hier.",
  },
  {
    id: "practice",
    tone: "practice",
    icon: ClipboardList,
    countLabel: (n) => (n === 1 ? "1 Praxisaufgabe" : `${n} Praxisaufgaben`),
    hint: "Offene interne Aufgaben",
    panelTitle: "Praxisaufgaben",
    emptyTitle: "Keine offenen Praxisaufgaben.",
    emptyBody: "Routinen, QM und organisatorische Aufgaben erscheinen hier.",
    createHref: "/my-tasks/new",
    createLabel: "Praxisaufgabe erstellen",
  },
];

function sectionRows(
  snapshot: ReturnType<typeof buildRelayPracticeSnapshot>,
  section: RelayPracticeSection
): RelayWorkRow[] {
  switch (section) {
    case "attention":
      return snapshot.attention;
    case "teamwork":
      return snapshot.teamwork;
    case "handovers":
      return snapshot.handovers;
    case "practice":
      return snapshot.practiceTasks;
  }
}

function sectionCount(snapshot: ReturnType<typeof buildRelayPracticeSnapshot>, section: RelayPracticeSection): number {
  return sectionRows(snapshot, section).length;
}

function RelayExpandedPanel({
  card,
  rows,
  isDoctor,
  secondaryAction,
}: {
  card: SummaryCard;
  rows: RelayWorkRow[];
  isDoctor: boolean;
  secondaryAction?: ReactNode;
}) {
  const createHref = card.id === "attention" && isDoctor ? "/journal/new" : card.createHref;
  const createLabel =
    card.id === "attention" && isDoctor ? "Journal-Entwurf anlegen" : card.createLabel;

  return (
    <section
      className={cn("yd-relay-central-panel yd-dash-surface yd-clinical-control", `yd-relay-central-panel--${card.tone}`)}
      aria-label={card.panelTitle}
    >
      <header className="yd-relay-central-panel__head">
        <div className="yd-relay-central-panel__head-main">
          <h2 className="yd-dash-section yd-relay-central-panel__title">{card.panelTitle}</h2>
          <span className="yd-relay-central-panel__count">{rows.length}</span>
        </div>
        <Link href="/my-tasks" className="yd-relay-central-panel__all">
          Alle anzeigen
        </Link>
      </header>

      {rows.length === 0 ? (
        <div className="yd-tracker-empty yd-relay-central-panel__empty">
          <p className="yd-tracker-empty__title">{card.emptyTitle}</p>
          <p className="yd-tracker-empty__text">{card.emptyBody}</p>
          {(createHref && createLabel) || secondaryAction ? (
            <div className="yd-relay-central-panel__actions">
              {createHref && createLabel ? (
                <Link href={createHref} className="yd-tracker-v4-new-case">
                  {createLabel}
                </Link>
              ) : null}
              {secondaryAction}
            </div>
          ) : null}
        </div>
      ) : (
        <ul className="yd-relay-central-panel__list">
          {rows.map((row) => (
            <RelayCentralTaskCard key={row.id} row={row} section={card.id} />
          ))}
        </ul>
      )}
    </section>
  );
}

export function RelayPracticeCentralView({
  userId,
  isDoctor,
  columns,
  assignableMembers,
  conversations,
  journalDrafts,
  submissionDraftStatus = {},
}: RelayPracticeCentralViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const mainTab: MainTab = tabParam === "nachrichten" ? "nachrichten" : "arbeitsbereich";

  const [activeSection, setActiveSection] = useState<RelayPracticeSection | null>(null);

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

  const unreadMessages = conversations.reduce((n, c) => n + c.unread_count, 0);
  const handoverPreview = useMemo(
    () => snapshot.handovers.filter((r) => !r.isGhost).slice(0, 4),
    [snapshot.handovers]
  );

  const activeCard = SUMMARY_CARDS.find((c) => c.id === activeSection) ?? null;

  const setMainTab = (tab: MainTab) => {
    const params = new URLSearchParams(searchParams.toString());
    if (tab === "nachrichten") params.set("tab", "nachrichten");
    else params.delete("tab");
    router.replace(`/relay?${params.toString()}`, { scroll: false });
  };

  const toggleSection = (id: RelayPracticeSection) => {
    setActiveSection((current) => (current === id ? null : id));
  };

  return (
    <div className="yd-relay yd-relay-central yd-tracker-v4-inbox yd-tracker-v12-inbox flex min-h-0 flex-1 flex-col">
      <RelayCommandTaskPrefill />

      <div className="yd-relay-central__chrome">
        <div className="yd-tracker-filter-scroll yd-relay-central__tab-scroll">
          <div className="yd-tracker-filter-chips" role="tablist" aria-label="Relay Bereiche">
            <button
              type="button"
              role="tab"
              aria-selected={mainTab === "arbeitsbereich"}
              className={cn(
                "yd-tracker-filter-chip",
                mainTab === "arbeitsbereich" && "yd-tracker-filter-chip--active"
              )}
              onClick={() => setMainTab("arbeitsbereich")}
            >
              <span>Arbeitsbereich</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mainTab === "nachrichten"}
              className={cn(
                "yd-tracker-filter-chip",
                mainTab === "nachrichten" && "yd-tracker-filter-chip--active"
              )}
              onClick={() => setMainTab("nachrichten")}
            >
              <span>Nachrichten</span>
              {unreadMessages > 0 ? (
                <span className="yd-tracker-filter-chip__count">{unreadMessages}</span>
              ) : null}
            </button>
          </div>
        </div>
        <RelayCreateMenu
          assignableMembers={assignableMembers}
          currentUserId={userId}
          variant="primary"
          onMessageCreated={() => setMainTab("nachrichten")}
        />
      </div>

      {mainTab === "nachrichten" ? (
        <RelayMessagesCentralView
          conversations={conversations}
          assignableMembers={assignableMembers}
          currentUserId={userId}
        />
      ) : (
        <div className="yd-relay-central__body min-h-0 flex-1 overflow-y-auto overscroll-y-contain [-webkit-overflow-scrolling:touch]">
          {(snapshot.attention.length > 0 || snapshot.teamwork.length > 0) && (
            <ul className="yd-relay-central__status-dots yd-tracker-v16-inbox__breakdown" aria-label="Kurzüberblick">
              {snapshot.attention.length > 0 ? (
                <li className="yd-relay-central__status-dot yd-relay-central__status-dot--attention">
                  {snapshot.attention.length === 1
                    ? "1 Aufgabe wartet auf Freigabe"
                    : `${snapshot.attention.length} Aufgaben warten auf Freigabe`}
                </li>
              ) : null}
              {snapshot.teamwork.length > 0 ? (
                <li className="yd-relay-central__status-dot yd-relay-central__status-dot--teamwork">
                  {snapshot.teamwork.length === 1
                    ? "1 Teamrückmeldung steht aus"
                    : `${snapshot.teamwork.length} Teamrückmeldungen stehen aus`}
                </li>
              ) : null}
            </ul>
          )}

          <div className="yd-relay-central__summary-grid" role="tablist" aria-label="Bereiche">
            {SUMMARY_CARDS.map((card) => {
              const count = sectionCount(snapshot, card.id);
              const active = activeSection === card.id;
              const Icon = card.icon;
              return (
                <button
                  key={card.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  className={cn(
                    "yd-relay-central-summary yd-dash-surface",
                    `yd-relay-central-summary--${card.tone}`,
                    active && "yd-relay-central-summary--active"
                  )}
                  onClick={() => toggleSection(card.id)}
                >
                  <span className={cn("yd-relay-central-summary__icon", `yd-relay-central-summary__icon--${card.tone}`)}>
                    <Icon className="h-5 w-5" strokeWidth={1.65} aria-hidden />
                  </span>
                  <span className="yd-relay-central-summary__count">{count}</span>
                  <span className="yd-relay-central-summary__label">{card.countLabel(count)}</span>
                  <span className="yd-relay-central-summary__hint">{card.hint}</span>
                  <ArrowRight className="yd-relay-central-summary__arrow h-4 w-4" aria-hidden />
                </button>
              );
            })}
          </div>

          {activeCard ? (
            <RelayExpandedPanel
              card={activeCard}
              rows={sectionRows(snapshot, activeCard.id)}
              isDoctor={isDoctor}
              secondaryAction={
                activeCard.id === "handovers" ? (
                  <RelayCreateMenu
                    assignableMembers={assignableMembers}
                    currentUserId={userId}
                    variant="secondary"
                    onMessageCreated={() => setMainTab("nachrichten")}
                  />
                ) : undefined
              }
            />
          ) : (
            <div className="yd-tracker-empty yd-relay-central__pick yd-dash-surface yd-clinical-control">
              <p className="yd-tracker-empty__title">Bereich wählen</p>
              <p className="yd-tracker-empty__text">
                Wählen Sie oben einen Bereich — offene Aufgaben, Team-Schritte und Nachrichten
                erscheinen hier.
              </p>
            </div>
          )}

          <section className="yd-relay-central-handover yd-dash-surface yd-clinical-control" aria-label="Übergaben im Überblick">
            <header className="yd-relay-central-handover__head">
              <h2 className="yd-dash-section yd-relay-central-handover__title">Übergaben im Überblick</h2>
              <Link href="/relay?tab=nachrichten" className="yd-relay-central-handover__all">
                Alle anzeigen
              </Link>
            </header>
            {handoverPreview.length === 0 ? (
              <div className="yd-tracker-empty yd-relay-central-handover__empty">
                <p className="yd-tracker-empty__title">Keine Übergaben im Moment</p>
                <p className="yd-tracker-empty__text">
                  Interne Nachrichten und Team-Übergaben erscheinen hier, sobald das Team arbeitet.
                </p>
              </div>
            ) : (
              <ul className="yd-relay-central-handover__grid">
                {handoverPreview.map((row) => (
                  <li key={row.id}>
                    <Link href={row.href} className="yd-relay-central-handover__item">
                      <span className="yd-relay-central-handover__item-icon" aria-hidden>
                        <MessageSquare className="h-4 w-4" strokeWidth={1.75} />
                      </span>
                      <span className="yd-relay-central-handover__item-body">
                        <span className="yd-relay-central-handover__item-title">{row.primaryLabel}</span>
                        <span className="yd-relay-central-handover__item-meta">
                          {row.context}
                          {row.timeLabel ? ` · ${row.timeLabel}` : ""}
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}
    </div>
  );
}

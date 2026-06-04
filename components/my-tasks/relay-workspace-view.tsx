"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState, useEffect } from "react";

import { CardBoard } from "@/components/my-tasks/card-board";
import { RelayCommandTaskPrefill } from "@/components/command-ai/relay-command-task-prefill";
import { RelayAssistCard } from "@/components/my-tasks/relay-assist-card";
import { RelayCommandFlow } from "@/components/my-tasks/relay-command-flow";
import { RelayKpiRow } from "@/components/my-tasks/relay-kpi-row";
import { RelayMessagesPanel } from "@/components/my-tasks/relay-messages-panel";
import { NewRelayMessageModalTrigger } from "@/components/my-tasks/new-relay-message-modal";
import { NewTaskModalTrigger } from "@/components/my-tasks/new-task-modal";
import { RelayPracticeRoutines } from "@/components/my-tasks/relay-practice-routines";
import { RelaySectionBox } from "@/components/my-tasks/relay-section-box";
import { RelayTaskList } from "@/components/my-tasks/relay-task-list";
import { RelayTeamOverview } from "@/components/my-tasks/relay-team-overview";
import { RelayTodaySection } from "@/components/my-tasks/relay-today-section";
import type { MyTask } from "@/lib/queries/my-tasks";
import type { RelayConversationRow } from "@/lib/queries/relay-messages";
import type { AssignableMember } from "@/lib/queries/team-members";
import {
  buildRelayAssistSummary,
  buildRelayCommandFlow,
  buildRelayKpiStats,
  buildRelayPracticeRoutines,
  buildRelayPriorityTasks,
  buildRelayTaskList,
  buildRelayTeamDetail,
} from "@/lib/relay/build-relay-snapshot";
import type { RelayScope } from "@/lib/tasks/relay-helpers";
import { buildMemberAvatarMap, emailInitials, filterColumnTasks } from "@/lib/tasks/relay-helpers";
import { cn } from "@/lib/utils";
import { clinicalWorkspaceFrame, clinicalWorkspaceVerticalPadding } from "@/lib/clinical-ui";

export interface RelayTaskCounts {
  open: number;
  pending: number;
  done: number;
}

type BoardColumns = {
  open: MyTask[];
  pending: MyTask[];
  done: MyTask[];
};

interface RelayWorkspaceViewProps {
  basePath: "/my-tasks" | "/relay";
  userId: string;
  userEmail: string | null;
  isDoctor: boolean;
  columns: BoardColumns;
  counts: RelayTaskCounts;
  assignableMembers: AssignableMember[];
  conversations?: RelayConversationRow[];
}

export function RelayWorkspaceView({
  basePath,
  userId,
  userEmail,
  isDoctor,
  columns,
  counts,
  assignableMembers,
  conversations = [],
}: RelayWorkspaceViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isRelay = basePath === "/relay";
  const urlScope = searchParams.get("scope") === "mine" ? "mine" : "all";
  const urlPanel =
    isRelay && searchParams.get("panel") === "messages" ? "messages" : "tasks";
  const [scope, setScope] = useState<RelayScope>(urlScope);
  const [panel, setPanel] = useState<"tasks" | "messages">(urlPanel);

  useEffect(() => {
    setScope(urlScope);
  }, [urlScope]);

  useEffect(() => {
    setPanel(urlPanel);
  }, [urlPanel]);

  const filtered = useMemo(
    () => ({
      open: filterColumnTasks(columns.open, userId, scope),
      pending: filterColumnTasks(columns.pending, userId, scope),
      done: filterColumnTasks(columns.done, userId, scope),
    }),
    [columns, userId, scope]
  );

  const avatarByUserId = useMemo(() => {
    const m = buildMemberAvatarMap(assignableMembers);
    if (userEmail) {
      m[userId] = { initials: emailInitials(userEmail), color: "#2F80ED" };
    }
    return m;
  }, [assignableMembers, userEmail, userId]);

  const kpiStats = useMemo(
    () => buildRelayKpiStats(filtered.open, filtered.pending, conversations),
    [filtered.open, filtered.pending, conversations]
  );

  const assistSummary = useMemo(
    () => buildRelayAssistSummary(filtered.open, filtered.pending, conversations),
    [filtered.open, filtered.pending, conversations]
  );

  const commandFlow = useMemo(
    () => buildRelayCommandFlow(filtered.open, filtered.pending, conversations),
    [filtered.open, filtered.pending, conversations]
  );

  const priorityTasks = useMemo(
    () => buildRelayPriorityTasks(filtered.open, filtered.pending, assignableMembers),
    [filtered.open, filtered.pending, assignableMembers]
  );

  const teamRows = useMemo(
    () => buildRelayTeamDetail(filtered.open, filtered.pending, assignableMembers, isDoctor),
    [filtered.open, filtered.pending, assignableMembers, isDoctor]
  );

  const routines = useMemo(() => buildRelayPracticeRoutines(filtered.open), [filtered.open]);

  const taskListItems = useMemo(
    () => buildRelayTaskList(filtered.open, filtered.pending, filtered.done, assignableMembers),
    [filtered.open, filtered.pending, filtered.done, assignableMembers]
  );

  const activeCount = taskListItems.filter((i) => !i.isDone).length;
  const doneCount = taskListItems.filter((i) => i.isDone).length;

  const setScopeNav = (next: RelayScope) => {
    const qs = new URLSearchParams();
    if (isRelay && panel === "messages") qs.set("panel", "messages");
    if (next === "mine") qs.set("scope", "mine");
    const q = qs.toString();
    router.replace(q ? `${basePath}?${q}` : basePath, { scroll: false });
    setScope(next);
  };

  const setPanelNav = (next: "tasks" | "messages") => {
    const qs = new URLSearchParams();
    if (next === "messages") qs.set("panel", "messages");
    if (scope === "mine") qs.set("scope", "mine");
    const q = qs.toString();
    router.replace(q ? `${basePath}?${q}` : basePath, { scroll: false });
    setPanel(next);
  };

  const tabBtn = (active: boolean) =>
    cn(
      "rounded-lg px-3.5 py-2 text-[13px] font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(43,111,232,0.28)]",
      active
        ? "bg-white text-[#0F172A] shadow-[0_1px_2px_rgba(43,111,232,0.1)] ring-1 ring-[rgba(43,111,232,0.12)]"
        : "text-[#64748B] hover:text-[#334155]"
    );

  const scopeBtn = (active: boolean) =>
    cn(
      "rounded-lg px-3 py-1.5 text-[12px] font-medium transition-all",
      active
        ? "bg-white text-[#0F172A] shadow-[0_1px_2px_rgba(43,111,232,0.1)] ring-1 ring-[rgba(43,111,232,0.12)]"
        : "text-[#64748B] hover:text-[#334155]"
    );

  const prioritySubtitle =
    priorityTasks.length === 0
      ? "Keine Prioritäten für heute"
      : priorityTasks.length === 1
        ? "1 Priorität"
        : `${priorityTasks.length} Prioritäten`;

  const taskSubtitle =
    activeCount === 0
      ? "Keine offenen Aufgaben"
      : activeCount === 1
        ? "1 offene Aufgabe"
        : `${activeCount} offene Aufgaben`;

  return (
    <div className="min-h-0 flex-1 bg-[#F7F9FC]">
      <RelayCommandTaskPrefill />
      <div className={`${clinicalWorkspaceFrame} ${clinicalWorkspaceVerticalPadding}`}>
        {isRelay ? (
          <div className="yd-relay-v4-page yd-relay-v4-page--mobile">
            <RelaySectionBox
              title=""
              hideTitle
              noPadding
              className="yd-relay-v4-box--toolbar"
              bodyClassName="yd-relay-v4-toolbar-body"
            >
              <div className="yd-relay-tab-strip" role="tablist" aria-label="Relay Bereiche">
                <button
                  type="button"
                  role="tab"
                  aria-selected={panel === "tasks"}
                  className={tabBtn(panel === "tasks")}
                  onClick={() => setPanelNav("tasks")}
                >
                  Aufgaben
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={panel === "messages"}
                  className={tabBtn(panel === "messages")}
                  onClick={() => setPanelNav("messages")}
                >
                  Übergaben
                </button>
              </div>
              {panel === "tasks" ? (
                <NewTaskModalTrigger compactMode />
              ) : (
                <NewRelayMessageModalTrigger
                  assignableMembers={assignableMembers}
                  currentUserId={userId}
                />
              )}
            </RelaySectionBox>

            {panel === "messages" ? (
              <RelaySectionBox
                title="Praxisübergaben"
                subtitle="Interne Hinweise mit Lesebestätigung"
                noPadding
                bodyClassName="yd-relay-v4-messages-wrap"
              >
                <RelayMessagesPanel
                  conversations={conversations}
                  assignableMembers={assignableMembers}
                  currentUserId={userId}
                />
              </RelaySectionBox>
            ) : (
              <>
                <div className="yd-relay-v4-kpi-zone">
                  <RelayKpiRow stats={kpiStats} />
                </div>

                <div className="yd-relay-v4-main-grid">
                  <div className="yd-relay-v4-main-col">
                    <RelaySectionBox
                      id="relay-heute"
                      title="Heute wichtig"
                      subtitle={prioritySubtitle}
                    >
                      <RelayTodaySection tasks={priorityTasks} />
                    </RelaySectionBox>

                    <RelaySectionBox
                      id="relay-aufgaben"
                      title="Aufgaben"
                      subtitle={
                        doneCount > 0 ? `${taskSubtitle} · ${doneCount} kürzlich erledigt` : taskSubtitle
                      }
                      action={
                        <div className="yd-relay-tab-strip" role="group" aria-label="Aufgaben filtern">
                          <button
                            type="button"
                            className={scopeBtn(scope === "all")}
                            onClick={() => setScopeNav("all")}
                          >
                            Alle
                          </button>
                          <button
                            type="button"
                            className={scopeBtn(scope === "mine")}
                            onClick={() => setScopeNav("mine")}
                          >
                            Meine
                          </button>
                        </div>
                      }
                      bodyClassName="yd-relay-v4-box__body--scroll"
                    >
                      <RelayTaskList items={taskListItems} />
                    </RelaySectionBox>
                  </div>

                  <aside className="yd-relay-v4-rail">
                    <RelaySectionBox title="Teamstatus" subtitle="Aufgaben & Lesestatus">
                      <RelayTeamOverview rows={teamRows} />
                    </RelaySectionBox>

                    <RelaySectionBox title="Routinen" subtitle="Wiederkehrende Praxisaufgaben">
                      <RelayPracticeRoutines routines={routines} />
                    </RelaySectionBox>

                    <RelaySectionBox title="Assistenz" subtitle="Heute vorbereitet">
                      <RelayAssistCard summary={assistSummary} />
                    </RelaySectionBox>

                    <RelaySectionBox title="Command AI" subtitle="Vom Eingang bis zur Freigabe">
                      <RelayCommandFlow steps={commandFlow} />
                    </RelaySectionBox>
                  </aside>
                </div>
              </>
            )}
          </div>
        ) : (
          <>
            <header className="yd-relay-page-header flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h1 className="yd-relay-page-title">Meine Aufgaben</h1>
                <p className="yd-relay-page-subtitle">Ihre zugewiesenen Aufgaben in der Praxis</p>
              </div>
            </header>
            <div className="mb-4 flex flex-wrap gap-2 text-[11px] font-medium text-[#64748B]">
              <span>
                Offen: <strong className="text-[#0F172A]">{counts.open}</strong>
              </span>
              <span>
                In Bearbeitung:{" "}
                <strong className="text-[#0F172A]">{counts.pending}</strong>
              </span>
              <span>
                Erledigt: <strong className="text-[#0F172A]">{counts.done}</strong>
              </span>
            </div>
            <CardBoard
              columns={filtered}
              currentUserId={userId}
              isDoctor={isDoctor}
              avatarByUserId={avatarByUserId}
              assignableMembers={assignableMembers}
            />
          </>
        )}
      </div>
    </div>
  );
}

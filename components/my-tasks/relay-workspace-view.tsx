"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState, useEffect } from "react";

import { CardBoard } from "@/components/my-tasks/card-board";
import { RelayCommandTaskPrefill } from "@/components/command-ai/relay-command-task-prefill";
import { RelayMessagesPanel } from "@/components/my-tasks/relay-messages-panel";
import { NewRelayMessageModalTrigger } from "@/components/my-tasks/new-relay-message-modal";
import { NewTaskModalTrigger } from "@/components/my-tasks/new-task-modal";
import { RelayPracticeRoutines } from "@/components/my-tasks/relay-practice-routines";
import { RelayTeamOverview } from "@/components/my-tasks/relay-team-overview";
import { RelayTodaySection } from "@/components/my-tasks/relay-today-section";
import type { MyTask } from "@/lib/queries/my-tasks";
import type { RelayConversationRow } from "@/lib/queries/relay-messages";
import type { AssignableMember } from "@/lib/queries/team-members";
import {
  buildRelayPracticeRoutines,
  buildRelayPriorityTasks,
  buildRelayTeamOverview,
  buildRelayTodayStats,
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

  const todayStats = useMemo(
    () => buildRelayTodayStats(filtered.open, filtered.pending, conversations),
    [filtered.open, filtered.pending, conversations]
  );

  const priorityTasks = useMemo(
    () => buildRelayPriorityTasks(filtered.open, filtered.pending, assignableMembers),
    [filtered.open, filtered.pending, assignableMembers]
  );

  const teamRows = useMemo(
    () => buildRelayTeamOverview(filtered.open, filtered.pending, assignableMembers, isDoctor),
    [filtered.open, filtered.pending, assignableMembers, isDoctor]
  );

  const routines = useMemo(() => buildRelayPracticeRoutines(filtered.open), [filtered.open]);

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

  return (
    <div className="min-h-0 flex-1" style={{ background: "#F7F9FC" }}>
      <RelayCommandTaskPrefill />
      <div className={`${clinicalWorkspaceFrame} ${clinicalWorkspaceVerticalPadding}`}>
        <header className="yd-relay-page-header flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="yd-relay-page-title">{isRelay ? "Relay" : "Meine Aufgaben"}</h1>
            {isRelay ? (
              <p className="yd-relay-page-subtitle">
                Aufgaben, Übergaben und Praxisroutinen
              </p>
            ) : (
              <p className="yd-relay-page-subtitle">
                Ihre zugewiesenen Aufgaben in der Praxis
              </p>
            )}
          </div>
          {isRelay ? (
            <div className="yd-relay-header-actions">
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
                <NewTaskModalTrigger />
              ) : (
                <NewRelayMessageModalTrigger
                  assignableMembers={assignableMembers}
                  currentUserId={userId}
                />
              )}
            </div>
          ) : null}
        </header>

        {isRelay && panel === "messages" ? (
          <RelayMessagesPanel
            conversations={conversations}
            assignableMembers={assignableMembers}
            currentUserId={userId}
          />
        ) : null}

        {panel === "tasks" ? (
          <>
            {isRelay ? (
              <>
                <RelayTodaySection stats={todayStats} tasks={priorityTasks} />
                <div className="yd-relay-secondary-grid">
                  <RelayTeamOverview rows={teamRows} />
                  <RelayPracticeRoutines routines={routines} />
                </div>
                <section className="yd-relay-board-section yd-relay-board-compact">
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h2 className="yd-relay-board-section__title">Weitere Aufgaben</h2>
                      <p className="mt-0.5 text-[12px] font-medium text-[#94A3B8]">
                        Nach Priorität oben — hier die vollständige Liste
                      </p>
                    </div>
                    <div
                      className="yd-relay-tab-strip"
                      role="group"
                      aria-label="Aufgaben filtern"
                    >
                      <button
                        type="button"
                        className={tabBtn(scope === "all")}
                        onClick={() => setScopeNav("all")}
                      >
                        Alle
                      </button>
                      <button
                        type="button"
                        className={tabBtn(scope === "mine")}
                        onClick={() => setScopeNav("mine")}
                      >
                        Meine
                      </button>
                    </div>
                  </div>
                  <CardBoard
                    columns={filtered}
                    currentUserId={userId}
                    isDoctor={isDoctor}
                    avatarByUserId={avatarByUserId}
                    assignableMembers={assignableMembers}
                    compact
                    columnTitles={{
                      open: "Offen",
                      pending: "In Bearbeitung",
                      done: "Erledigt",
                    }}
                    columnSurfaceClass={{
                      open: "bg-white",
                      pending: "bg-[rgba(248,250,252,0.95)]",
                      done: "bg-[rgba(248,250,252,0.6)]",
                    }}
                  />
                </section>
              </>
            ) : (
              <>
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
          </>
        ) : null}
      </div>
    </div>
  );
}

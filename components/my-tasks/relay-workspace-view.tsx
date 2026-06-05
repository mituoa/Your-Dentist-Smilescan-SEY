"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState, useEffect } from "react";

import { RelayCommandTaskPrefill } from "@/components/command-ai/relay-command-task-prefill";
import { HcCard } from "@/components/design/hc-card";
import { RelayMessagesPanel } from "@/components/my-tasks/relay-messages-panel";
import { RelayOpsStrip } from "@/components/my-tasks/relay-ops-strip";
import { RelayOpsWorkList } from "@/components/my-tasks/relay-ops-work-list";
import { RelayQuickCreate } from "@/components/my-tasks/relay-quick-create";
import { CLINICAL_CANVAS_HEX, clinicalWorkspaceFrame } from "@/lib/clinical-ui";
import type { MyTask } from "@/lib/queries/my-tasks";
import type { MessageDraftListStatus } from "@/lib/message-drafts/list-status";
import type { RelayConversationRow } from "@/lib/queries/relay-messages";
import type { AssignableMember } from "@/lib/queries/team-members";
import {
  buildRelayOpsToday,
  buildRelayOpsWorkList,
  buildSubmissionEnrichmentMap,
} from "@/lib/relay/build-relay-ops-snapshot";
import type { RelayScope } from "@/lib/tasks/relay-helpers";
import { filterColumnTasks } from "@/lib/tasks/relay-helpers";
import { cn } from "@/lib/utils";

/** Mirrors `TaskCounts` from task-counts (client-safe). */
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
  submissionDraftStatus?: Record<string, MessageDraftListStatus>;
}

export function RelayWorkspaceView({
  basePath,
  userId,
  userEmail,
  isDoctor,
  columns,
  assignableMembers,
  conversations = [],
  submissionDraftStatus = {},
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

  const enrichments = useMemo(
    () => buildSubmissionEnrichmentMap(submissionDraftStatus),
    [submissionDraftStatus]
  );

  const ops = useMemo(
    () => ({
      strip: buildRelayOpsToday(filtered.open, filtered.pending, filtered.done, enrichments),
      work: buildRelayOpsWorkList(
        filtered.open,
        filtered.pending,
        filtered.done,
        assignableMembers,
        enrichments,
        0
      ),
    }),
    [filtered, assignableMembers, enrichments]
  );

  const setScopeNav = (next: RelayScope) => {
    const qs = new URLSearchParams();
    if (isRelay && panel === "messages") qs.set("panel", "messages");
    if (next === "mine") qs.set("scope", "mine");
    const q = qs.toString();
    const path = q ? `${basePath}?${q}` : basePath;
    router.replace(path, { scroll: false });
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

  const toggleBtn = (active: boolean) =>
    cn("yd-relay-tab-btn", active && "yd-relay-tab-btn--active");

  return (
    <div
      className="yd-relay yd-relay-shell relative flex min-h-0 flex-1 flex-col"
      style={{ background: CLINICAL_CANVAS_HEX }}
    >
      <RelayCommandTaskPrefill />
      <div className={`${clinicalWorkspaceFrame} flex min-h-0 flex-1 flex-col py-2 md:py-3`}>
        <header className="yd-relay-ops-header-bar shrink-0">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h1 className="yd-relay-page-title yd-dash-title text-[1.25rem] md:text-[1.375rem]">
              {isRelay ? "Relay" : "Meine Aufgaben"}
            </h1>
            <div className="yd-relay-header-actions">
              {isRelay ? (
                <div className="yd-relay-tab-strip" role="tablist" aria-label="Relay Bereiche">
                  <button
                    type="button"
                    role="tab"
                    aria-selected={panel === "tasks"}
                    className={toggleBtn(panel === "tasks")}
                    onClick={() => setPanelNav("tasks")}
                  >
                    Vorgänge
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={panel === "messages"}
                    className={toggleBtn(panel === "messages")}
                    onClick={() => setPanelNav("messages")}
                  >
                    Übergaben
                  </button>
                </div>
              ) : null}
              {panel === "tasks" ? (
                <div className="yd-relay-tab-strip" role="group" aria-label="Filter">
                  <button type="button" className={toggleBtn(scope === "all")} onClick={() => setScopeNav("all")}>
                    Alle
                  </button>
                  <button type="button" className={toggleBtn(scope === "mine")} onClick={() => setScopeNav("mine")}>
                    Meine
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </header>

        {isRelay && panel === "messages" ? (
          <HcCard
            tone="primary"
            ambient={false}
            className="yd-dash-surface yd-relay-messages-surface min-h-0 flex-1 overflow-hidden p-0"
          >
            <RelayMessagesPanel
              conversations={conversations}
              assignableMembers={assignableMembers}
              currentUserId={userId}
            />
          </HcCard>
        ) : null}

        {panel === "tasks" ? (
          <div className="yd-relay-ops-primary flex min-h-0 flex-1 flex-col">
            <RelayOpsStrip band={ops.strip} />

            <div className="yd-relay-quick-create-inline shrink-0">
              <RelayQuickCreate
                assignableMembers={assignableMembers}
                currentUserId={userId}
                currentUserEmail={userEmail}
              />
            </div>

            <HcCard
              tone="primary"
              ambient={false}
              className="yd-dash-surface yd-relay-work-surface min-h-0 flex-1 overflow-hidden p-0"
            >
              <RelayOpsWorkList items={ops.work} />
            </HcCard>
          </div>
        ) : null}
      </div>
    </div>
  );
}

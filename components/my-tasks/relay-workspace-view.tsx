"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState, useEffect } from "react";

import { RelayCommandTaskPrefill } from "@/components/command-ai/relay-command-task-prefill";
import { HcCard } from "@/components/design/hc-card";
import { RelayHandoffsList } from "@/components/my-tasks/relay-handoffs-list";
import { RelayMessagesPanel } from "@/components/my-tasks/relay-messages-panel";
import { RelayOpsStrip } from "@/components/my-tasks/relay-ops-strip";
import { RelayOpsWorkList } from "@/components/my-tasks/relay-ops-work-list";
import { RelayRoutinesList } from "@/components/my-tasks/relay-routines-list";
import { CLINICAL_CANVAS_HEX, clinicalWorkspaceFrame } from "@/lib/clinical-ui";
import type { MyTask } from "@/lib/queries/my-tasks";
import type { MessageDraftListStatus } from "@/lib/message-drafts/list-status";
import type { RelayConversationRow } from "@/lib/queries/relay-messages";
import type { AssignableMember } from "@/lib/queries/team-members";
import {
  buildRelayV3Snapshot,
  type RelayV3Section,
} from "@/lib/relay/build-relay-v3-snapshot";
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

const SECTIONS: { id: RelayV3Section; label: string }[] = [
  { id: "operations", label: "Praxisbetrieb" },
  { id: "routines", label: "Routinen" },
  { id: "handoffs", label: "Übergaben" },
];

function resolveSection(searchParams: URLSearchParams): RelayV3Section {
  const raw = searchParams.get("section");
  if (raw === "routines" || raw === "handoffs") return raw;
  if (searchParams.get("panel") === "messages") return "handoffs";
  return "operations";
}

export function RelayWorkspaceView({
  basePath,
  userId,
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
  const urlSection = resolveSection(searchParams);
  const [scope, setScope] = useState<RelayScope>(urlScope);
  const [section, setSection] = useState<RelayV3Section>(urlSection);

  useEffect(() => {
    setScope(urlScope);
  }, [urlScope]);

  useEffect(() => {
    setSection(urlSection);
  }, [urlSection]);

  const filtered = useMemo(
    () => ({
      open: filterColumnTasks(columns.open, userId, scope),
      pending: filterColumnTasks(columns.pending, userId, scope),
      done: filterColumnTasks(columns.done, userId, scope),
    }),
    [columns, userId, scope]
  );

  const v3 = useMemo(
    () =>
      buildRelayV3Snapshot({
        open: filtered.open,
        pending: filtered.pending,
        done: filtered.done,
        members: assignableMembers,
        draftBySubmissionId: submissionDraftStatus,
        conversations,
        isDoctor,
      }),
    [filtered, assignableMembers, submissionDraftStatus, conversations, isDoctor]
  );

  const setScopeNav = (next: RelayScope) => {
    const qs = new URLSearchParams();
    if (section !== "operations") qs.set("section", section);
    if (next === "mine") qs.set("scope", "mine");
    const q = qs.toString();
    router.replace(q ? `${basePath}?${q}` : basePath, { scroll: false });
    setScope(next);
  };

  const setSectionNav = (next: RelayV3Section) => {
    const qs = new URLSearchParams();
    if (next !== "operations") qs.set("section", next);
    if (scope === "mine") qs.set("scope", "mine");
    const q = qs.toString();
    router.replace(q ? `${basePath}?${q}` : basePath, { scroll: false });
    setSection(next);
  };

  const toggleBtn = (active: boolean) =>
    cn("yd-relay-tab-btn", active && "yd-relay-tab-btn--active");

  return (
    <div
      className="yd-relay yd-relay-shell yd-relay-v3 relative flex min-h-0 flex-1 flex-col"
      style={{ background: CLINICAL_CANVAS_HEX }}
    >
      <RelayCommandTaskPrefill />
      <div className={`${clinicalWorkspaceFrame} flex min-h-0 flex-1 flex-col py-2 md:py-3`}>
        <header className="yd-relay-ops-header-bar shrink-0">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="min-w-0">
              <h1 className="yd-relay-page-title yd-dash-title text-[1.25rem] md:text-[1.375rem]">
                {isRelay ? "Relay" : "Meine Aufgaben"}
              </h1>
              <p className="yd-relay-v3-subtitle">
                {isDoctor
                  ? "Organisatorische Praxiszentrale — Entscheidungen im Tracker, Umsetzung hier."
                  : "Operative Aufgaben und Übergaben — klinische Entscheidungen im Tracker."}
              </p>
            </div>
            <div className="yd-relay-header-actions">
              <div className="yd-relay-tab-strip" role="tablist" aria-label="Relay Bereiche">
                {SECTIONS.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    role="tab"
                    aria-selected={section === s.id}
                    className={toggleBtn(section === s.id)}
                    onClick={() => setSectionNav(s.id)}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
              <div className="yd-relay-tab-strip" role="group" aria-label="Filter">
                <button type="button" className={toggleBtn(scope === "all")} onClick={() => setScopeNav("all")}>
                  Alle
                </button>
                <button type="button" className={toggleBtn(scope === "mine")} onClick={() => setScopeNav("mine")}>
                  Meine
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="yd-relay-ops-primary flex min-h-0 flex-1 flex-col">
          <RelayOpsStrip
            section={section}
            operations={section === "operations" ? v3.operations.band : undefined}
            routines={section === "routines" ? v3.routines.band : undefined}
            handoffs={section === "handoffs" ? v3.handoffs.band : undefined}
          />

          {section === "operations" ? (
            <HcCard
              tone="primary"
              ambient={false}
              className="yd-dash-surface yd-relay-work-surface min-h-0 flex-1 overflow-hidden p-0"
            >
              <RelayOpsWorkList items={v3.operations.rows} isDoctor={isDoctor} />
            </HcCard>
          ) : null}

          {section === "routines" ? (
            <HcCard
              tone="primary"
              ambient={false}
              className="yd-dash-surface yd-relay-work-surface min-h-0 flex-1 overflow-hidden p-0"
            >
              <RelayRoutinesList items={v3.routines.rows} />
            </HcCard>
          ) : null}

          {section === "handoffs" ? (
            <div className="yd-relay-handoffs-layout flex min-h-0 flex-1 flex-col gap-2">
              <HcCard
                tone="primary"
                ambient={false}
                className="yd-dash-surface yd-relay-work-surface min-h-0 overflow-hidden p-0 md:max-h-[42%] md:shrink-0"
              >
                <RelayHandoffsList items={v3.handoffs.rows} isDoctor={isDoctor} />
              </HcCard>
              {isRelay ? (
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
            </div>
          ) : null}
        </div>
      </div>

    </div>
  );
}

"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState, useEffect } from "react";

import { RelayCommandTaskPrefill } from "@/components/command-ai/relay-command-task-prefill";
import { RelayMessagesPanel } from "@/components/my-tasks/relay-messages-panel";
import { RelayOpsFocusPanel } from "@/components/my-tasks/relay-ops-focus-panel";
import { RelayOpsTodayBandView } from "@/components/my-tasks/relay-ops-today-band";
import { RelayOpsWorkList } from "@/components/my-tasks/relay-ops-work-list";
import { RelayQuickCreate } from "@/components/my-tasks/relay-quick-create";
import { RelaySectionBox } from "@/components/my-tasks/relay-section-box";
import { RelayWorkloadPanel } from "@/components/my-tasks/relay-workload-panel";
import type { MyTask } from "@/lib/queries/my-tasks";
import type { MessageDraftListStatus } from "@/lib/message-drafts/list-status";
import type { RelayConversationRow } from "@/lib/queries/relay-messages";
import type { AssignableMember } from "@/lib/queries/team-members";
import {
  buildRelayOpsFocusList,
  buildRelayOpsToday,
  buildRelayOpsWorkList,
  buildSubmissionEnrichmentMap,
} from "@/lib/relay/build-relay-ops-snapshot";
import { buildRelayTeamOverview } from "@/lib/relay/build-relay-snapshot";
import type { RelayScope } from "@/lib/tasks/relay-helpers";
import { filterColumnTasks } from "@/lib/tasks/relay-helpers";
import { cn } from "@/lib/utils";
import { clinicalWorkspaceFrame } from "@/lib/clinical-ui";

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
  counts,
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
      today: buildRelayOpsToday(filtered.open, filtered.pending, filtered.done, enrichments),
      work: buildRelayOpsWorkList(
        filtered.open,
        filtered.pending,
        filtered.done,
        assignableMembers,
        enrichments,
        120
      ),
      waitingPatient: buildRelayOpsFocusList(
        filtered.open,
        filtered.pending,
        assignableMembers,
        enrichments,
        "patient",
        6
      ),
      waitingDoctor: buildRelayOpsFocusList(
        filtered.open,
        filtered.pending,
        assignableMembers,
        enrichments,
        "doctor",
        6
      ),
      workload: buildRelayTeamOverview(filtered.open, filtered.pending, assignableMembers, isDoctor),
    }),
    [filtered, assignableMembers, isDoctor, enrichments]
  );

  const hasActiveWork =
    filtered.open.length > 0 || filtered.pending.length > 0 || filtered.done.length > 0;

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
    <div className="min-h-0 flex-1 yd-relay-v4" style={{ background: "#F7F9FC" }}>
      <RelayCommandTaskPrefill />
      <div className={`${clinicalWorkspaceFrame} yd-relay-v4-page yd-relay-ops-page py-3 md:py-4`}>
        <header className="yd-relay-page-header yd-relay-ops-header">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <h1 className="yd-relay-page-title">{isRelay ? "Relay" : "Meine Aufgaben"}</h1>
              <p className="yd-relay-page-subtitle">
                {isRelay
                  ? "Was muss die Praxis jetzt tun?"
                  : "Ihre Aufgaben — dieselbe Betriebsübersicht wie Relay."}
              </p>
            </div>
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
                    Betrieb
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
                <div className="yd-relay-tab-strip" role="group" aria-label="Aufgaben filtern">
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
          <RelaySectionBox title="" hideTitle noPadding bodyClassName="yd-relay-v4-messages-wrap">
            <RelayMessagesPanel
              conversations={conversations}
              assignableMembers={assignableMembers}
              currentUserId={userId}
            />
          </RelaySectionBox>
        ) : null}

        {panel === "tasks" ? (
          <div className="yd-relay-ops-stack">
            <RelayOpsTodayBandView band={ops.today} />

            <div className="yd-relay-ops-focus-grid">
              <RelayOpsFocusPanel
                title="Wartet auf Patient"
                subtitle="Antwort, Foto oder Termin ausstehend"
                items={ops.waitingPatient}
                emptyTitle="Keine Patienten-Rückstände"
                emptyText="Aktuell wartet kein Vorgang auf Patient:innen in dieser Ansicht."
              />
              <RelayOpsFocusPanel
                title="Wartet auf Arzt"
                subtitle="Freigaben und Entscheidungen"
                items={ops.waitingDoctor}
                emptyTitle="Keine Arzt-Freigaben offen"
                emptyText="Alles liegt bei der Praxis — keine ausstehenden Freigaben."
              />
            </div>

            <RelaySectionBox title="" hideTitle noPadding bodyClassName="yd-relay-quick-create-wrap">
              <RelayQuickCreate
                assignableMembers={assignableMembers}
                currentUserId={userId}
                currentUserEmail={userEmail}
              />
            </RelaySectionBox>

            {!hasActiveWork ? (
              <div className="yd-relay-empty-state yd-relay-empty-state--hero">
                <p className="yd-relay-empty-state__title">Praxisbetrieb unter Kontrolle</p>
                <p className="yd-relay-empty-state__text">
                  Alle Aufgaben erledigt — heute keine offenen Vorgänge in dieser Ansicht.
                </p>
                <p className="yd-relay-empty-state__meta">
                  Offen {counts.open} · Freigaben {counts.pending} · Erledigt (90 T.) {counts.done}
                </p>
              </div>
            ) : null}

            <div className="yd-relay-ops-main">
              <RelaySectionBox
                id="relay-work"
                title="Arbeit"
                subtitle={`${ops.work.filter((w) => !w.isDone).length} aktiv · ${ops.work.filter((w) => w.isDone).length} kürzlich erledigt`}
                bodyClassName="yd-relay-v4-box__body--flush yd-relay-v4-box__body--scroll yd-relay-ops-work-scroll"
              >
                <RelayOpsWorkList items={ops.work} />
              </RelaySectionBox>

              <RelaySectionBox title="Arbeitslast" subtitle="Offene Zuweisungen im Team">
                <RelayWorkloadPanel rows={ops.workload} />
              </RelaySectionBox>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

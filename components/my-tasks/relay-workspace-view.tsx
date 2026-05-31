"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState, useEffect } from "react";

import { CardBoard } from "@/components/my-tasks/card-board";
import { RelayAssistHint } from "@/components/command-ai/relay-assist-hint";
import { RelayMessagesPanel } from "@/components/my-tasks/relay-messages-panel";
import { RelayQuickCreate } from "@/components/my-tasks/relay-quick-create";
import type { MyTask } from "@/lib/queries/my-tasks";
import type { RelayConversationRow } from "@/lib/queries/relay-messages";
import type { AssignableMember } from "@/lib/queries/team-members";
import type { RelayScope } from "@/lib/tasks/relay-helpers";
import { buildMemberAvatarMap, emailInitials, filterColumnTasks } from "@/lib/tasks/relay-helpers";
import { cn } from "@/lib/utils";
import { clinicalWorkspaceFrame, clinicalWorkspaceVerticalPadding } from "@/lib/clinical-ui";

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
    cn(
      "rounded-lg px-4 py-2.5 text-[13px] font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(43,111,232,0.28)]",
      active
        ? "bg-white text-[#0F172A] shadow-[0_1px_3px_rgba(43,111,232,0.12)] ring-1 ring-[rgba(43,111,232,0.14)]"
        : "bg-transparent text-[#64748B] hover:bg-[rgba(43,111,232,0.05)] hover:text-[#334155]"
    );

  return (
    <div className="min-h-0 flex-1" style={{ background: "#F7F9FC" }}>
      <div className={`${clinicalWorkspaceFrame} ${clinicalWorkspaceVerticalPadding}`}>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1
            className="text-[26px] font-semibold leading-tight tracking-[-0.02em] sm:text-[28px]"
            style={{ color: "#0F172A" }}
          >
            {isRelay ? "Relay" : "Meine Aufgaben"}
          </h1>
          {isRelay ? (
            <p className="mt-2 max-w-[560px] text-[14px] font-normal leading-relaxed" style={{ color: "#475569" }}>
              Internes Koordinationszentrum — Aufgaben, Nachrichten, Übergaben und ruhige
              Praxisroutinen an einem Ort.
            </p>
          ) : (
            <p
              className="mt-2 max-w-[640px] text-[14px] font-normal leading-relaxed"
              style={{ color: "#475569" }}
            >
              Ihre zugewiesenen und geteilten Aufgaben — dieselbe Datengrundlage wie unter Relay.
            </p>
          )}
        </div>

        <div className="flex flex-col gap-3 sm:items-end">
          {isRelay ? (
            <div
              className="inline-flex rounded-[10px] p-1 ring-1 ring-[rgba(43,111,232,0.1)]"
              style={{ background: "rgba(43, 111, 232, 0.06)" }}
              role="tablist"
              aria-label="Relay Bereiche"
            >
              <button
                type="button"
                role="tab"
                aria-selected={panel === "tasks"}
                className={toggleBtn(panel === "tasks")}
                onClick={() => setPanelNav("tasks")}
              >
                Aufgaben
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={panel === "messages"}
                className={toggleBtn(panel === "messages")}
                onClick={() => setPanelNav("messages")}
              >
                Nachrichten
              </button>
            </div>
          ) : null}
          {panel === "tasks" ? (
            <div
              className="inline-flex rounded-[10px] p-1 ring-1 ring-[rgba(43,111,232,0.1)]"
              style={{ background: "rgba(43, 111, 232, 0.06)" }}
              role="group"
              aria-label="Aufgaben filtern"
            >
              <button type="button" className={toggleBtn(scope === "all")} onClick={() => setScopeNav("all")}>
                Alle Aufgaben
              </button>
              <button type="button" className={toggleBtn(scope === "mine")} onClick={() => setScopeNav("mine")}>
                Meine Aufgaben
              </button>
            </div>
          ) : null}
        </div>
      </div>

      {isRelay && isDoctor && panel === "tasks" ? <RelayAssistHint /> : null}

      {isRelay && panel === "messages" ? (
        <RelayMessagesPanel
          conversations={conversations}
          assignableMembers={assignableMembers}
          currentUserId={userId}
        />
      ) : null}

      {panel === "tasks" ? (
        <>
      <div className="mb-6 flex flex-wrap gap-2 text-[11px] font-medium">
        <span className="inline-flex items-center gap-1 rounded-md border border-[rgba(43,111,232,0.14)] bg-white px-3 py-1.5 text-[#64748B] shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
          Offen: <strong className="tabular-nums text-[#0F172A]">{counts.open}</strong>
        </span>
        <span className="inline-flex items-center gap-1 rounded-md border border-[rgba(43,111,232,0.14)] bg-white px-3 py-1.5 text-[#64748B] shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
          In Bearbeitung: <strong className="tabular-nums text-[#0F172A]">{counts.pending}</strong>
        </span>
        <span className="inline-flex items-center gap-1 rounded-md border border-[rgba(43,111,232,0.14)] bg-white px-3 py-1.5 text-[#64748B] shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
          Erledigt: <strong className="tabular-nums text-[#0F172A]">{counts.done}</strong>
        </span>
        {scope === "mine" ? (
          <span className="inline-flex items-center rounded-md border border-[rgba(43,111,232,0.22)] bg-[#EEF6FF] px-3 py-1.5 text-[#1E3A8A]">
            Gefiltert: nur Einträge, an denen du beteiligt bist
          </span>
        ) : null}
      </div>

      <RelayQuickCreate
        assignableMembers={assignableMembers}
        currentUserId={userId}
        currentUserEmail={userEmail}
      />

      <CardBoard
        columns={filtered}
        currentUserId={userId}
        isDoctor={isDoctor}
        avatarByUserId={avatarByUserId}
        columnTitles={{
          open: "Offen",
          pending: "In Bearbeitung",
          done: "Erledigt",
        }}
        columnSurfaceClass={{
          open: "bg-white/[0.98]",
          pending: "bg-[rgba(43,111,232,0.045)]",
          done: "bg-[rgba(71,85,105,0.04)]",
        }}
      />
        </>
      ) : null}
      </div>
    </div>
  );
}

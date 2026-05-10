"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState, useEffect } from "react";

import { CardBoard } from "@/components/my-tasks/card-board";
import { RelayQuickCreate } from "@/components/my-tasks/relay-quick-create";
import type { MyTask } from "@/lib/queries/my-tasks";
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
}

export function RelayWorkspaceView({
  basePath,
  userId,
  userEmail,
  isDoctor,
  columns,
  counts,
  assignableMembers,
}: RelayWorkspaceViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlScope = searchParams.get("scope") === "mine" ? "mine" : "all";
  const [scope, setScope] = useState<RelayScope>(urlScope);

  useEffect(() => {
    setScope(urlScope);
  }, [urlScope]);

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
    const path = next === "mine" ? `${basePath}?scope=mine` : basePath;
    router.replace(path, { scroll: false });
    setScope(next);
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
            Relay
          </h1>
          <p className="mt-2 text-[14px] font-medium" style={{ color: "#2563EB" }}>
            Praxisorganisation &amp; Aufgaben
          </p>
        </div>

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
      </div>

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
      </div>
    </div>
  );
}

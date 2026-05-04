"use client";

import { Plus } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState, useEffect } from "react";

import { CardBoard } from "@/components/my-tasks/card-board";
import { RelayQuickCreate } from "@/components/my-tasks/relay-quick-create";
import type { MyTask } from "@/lib/queries/my-tasks";
import type { AssignableMember } from "@/lib/queries/team-members";
import type { RelayScope } from "@/lib/tasks/relay-helpers";
import { buildMemberAvatarMap, emailInitials, filterColumnTasks } from "@/lib/tasks/relay-helpers";
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
      "rounded-lg px-4 py-2 text-[13px] font-medium transition-all duration-200",
      active ? "bg-white text-[#1E293B] shadow-[0_1px_3px_rgba(15,23,42,0.08)]" : "bg-transparent text-[#64748B]"
    );

  return (
    <div className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-8 sm:py-8 lg:px-10">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-[28px] font-semibold leading-tight tracking-tight text-[#1E293B]">Relay</h1>
          <p className="mt-2 text-[13px] text-[#64748B]">Praxisorganisation &amp; Aufgaben</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div
            className="inline-flex rounded-[10px] p-1"
            style={{ background: "#F8FAFC" }}
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

          <Link
            href={`${basePath}#relay-quick-create`}
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#2F80ED] px-4 text-[14px] font-medium text-white shadow-[0_4px_12px_rgba(47,128,237,0.28)] transition-opacity hover:opacity-95 lg:h-11 lg:px-5"
          >
            <Plus className="h-4 w-4" />
            Neue Aufgabe
          </Link>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-2 text-[11px] font-medium text-[#64748B]">
        <span className="inline-flex items-center gap-1 rounded-md border border-[#E2E8F0] bg-white px-3 py-1.5">
          Offen: <strong className="tabular-nums text-[#1E293B]">{counts.open}</strong>
        </span>
        <span className="inline-flex items-center gap-1 rounded-md border border-[#E2E8F0] bg-white px-3 py-1.5">
          In Bearbeitung: <strong className="tabular-nums text-[#1E293B]">{counts.pending}</strong>
        </span>
        <span className="inline-flex items-center gap-1 rounded-md border border-[#E2E8F0] bg-white px-3 py-1.5">
          Erledigt: <strong className="tabular-nums text-[#1E293B]">{counts.done}</strong>
        </span>
        {scope === "mine" ? (
          <span className="inline-flex items-center rounded-md border border-[#2F80ED]/20 bg-[#EEF6FF] px-3 py-1.5 text-[#1E293B]">
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
          pending: "bg-[rgba(47,128,237,0.03)]",
          done: "bg-[rgba(22,163,74,0.03)]",
        }}
      />
    </div>
  );
}

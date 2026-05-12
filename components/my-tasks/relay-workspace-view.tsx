"use client";

/**
 * Relay-Workspace: Kanban für **Team-Aufgaben** (`/relay`) bzw. persönliche Relay-Ansicht (`/my-tasks`).
 * Zweck und Abgrenzung (nicht CRM/Ticket/PM): siehe **`app/(protected)/relay/page.tsx`**. Datenlader:
 * `loadRelayWorkspaceData`. Board und DnD: `CardBoard` + `workflow-rules` / Server Actions — **Punkt 2** und
 * **Punkt 3** (Workspace, Auth, Actions) in `page.tsx` sowie `relay-server-data`, `my-tasks/actions`, Queries dokumentiert.
 * **Punkt 4 (Aktionen) — final:** ruhige Interaktionen in `RelayQuickCreate` und `CardBoard`; Vertrag in
 * `relay/page.tsx`. Manuelle Smoke vor Staging = Regression, nicht Vertragslücke.
 */

import { useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";

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
  const isRelay = basePath === "/relay";
  const scope: RelayScope = searchParams.get("scope") === "mine" ? "mine" : "all";

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
      m[userId] = { initials: emailInitials(userEmail), color: "#64748B" };
    }
    return m;
  }, [assignableMembers, userEmail, userId]);

  const setScopeNav = (next: RelayScope) => {
    const path = next === "mine" ? `${basePath}?scope=mine` : basePath;
    router.replace(path, { scroll: false });
  };

  const toggleBtn = (active: boolean) =>
    cn(
      "rounded-lg px-4 py-2.5 text-[13px] font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(15,23,42,0.14)]",
      active
        ? "bg-white text-[#0F172A] shadow-sm ring-1 ring-[#E2E8F0]"
        : "bg-transparent text-[#64748B] hover:bg-[rgba(15,23,42,0.04)] hover:text-[#334155]"
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
          <p
            className="mt-2 max-w-[640px] text-[14px] font-normal leading-relaxed"
            style={{ color: "#475569" }}
          >
            {isRelay
              ? "Gemeinsame Aufgabenübersicht fürs Team: zuweisen, einordnen und den Bearbeitungsstand teilen. Kein Patientendossier, kein Ticket-System."
              : "Deine zugewiesenen und mit dir geteilten Aufgaben — dieselbe Datengrundlage wie das Team-Board unter Relay."}
          </p>
        </div>

        <div
          className="inline-flex rounded-[10px] p-1 ring-1 ring-[#E2E8F0] bg-[#F8FAFC]"
          role="group"
          aria-label="Aufgaben filtern"
        >
          <button type="button" className={toggleBtn(scope === "all")} onClick={() => setScopeNav("all")}>
            {isRelay ? "Gesamtes Team" : "Alle Aufgaben"}
          </button>
          <button type="button" className={toggleBtn(scope === "mine")} onClick={() => setScopeNav("mine")}>
            {isRelay ? "Meine Beteiligung" : "Meine Aufgaben"}
          </button>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-2 text-[11px] font-medium">
        <span className="inline-flex items-center gap-1 rounded-md border border-[#E2E8F0] bg-white px-3 py-1.5 text-[#64748B]">
          Offen: <strong className="tabular-nums text-[#0F172A]">{counts.open}</strong>
        </span>
        <span className="inline-flex items-center gap-1 rounded-md border border-[#E2E8F0] bg-white px-3 py-1.5 text-[#64748B]">
          In Bearbeitung: <strong className="tabular-nums text-[#0F172A]">{counts.pending}</strong>
        </span>
        <span className="inline-flex items-center gap-1 rounded-md border border-[#E2E8F0] bg-white px-3 py-1.5 text-[#64748B]">
          Erledigt: <strong className="tabular-nums text-[#0F172A]">{counts.done}</strong>
        </span>
        {scope === "mine" ? (
          <span className="inline-flex items-center rounded-md border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-1.5 text-[#475569]">
            Nur Aufgaben mit deiner Beteiligung
          </span>
        ) : null}
      </div>

      <RelayQuickCreate
        assignableMembers={assignableMembers}
        currentUserId={userId}
        currentUserEmail={userEmail}
        inputPlaceholder={
          isRelay ? "Kurz beschreiben, was zu erledigen ist …" : undefined
        }
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
          pending: "bg-[rgba(15,23,42,0.025)]",
          done: "bg-[rgba(71,85,105,0.04)]",
        }}
      />
      </div>
    </div>
  );
}

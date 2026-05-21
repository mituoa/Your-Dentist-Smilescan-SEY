import Link from "next/link";
import { ArrowRightLeft, Bell, Inbox, ListTodo, MessagesSquare } from "lucide-react";

import { HcCard } from "@/components/design/hc-card";
import { YD } from "@/lib/design/yd-design-tokens";

type DashboardPracticeFlowProps = {
  unseenCount: number | null;
  openTaskCount: number;
  routineCount: number;
  relayUnread: number;
  reminderCount: number;
};

const FLOW_ICONS = {
  inbox: Inbox,
  tasks: ListTodo,
  relay: MessagesSquare,
  routines: Bell,
  handoff: ArrowRightLeft,
} as const;

export function DashboardPracticeFlow({
  unseenCount,
  openTaskCount,
  routineCount,
  relayUnread,
  reminderCount,
}: DashboardPracticeFlowProps) {
  const nodes = [
    {
      key: "inbox",
      label: "Eingang",
      detail:
        unseenCount === null
          ? "—"
          : unseenCount > 0
            ? `${unseenCount} zu sichten`
            : "auf Stand",
      href: "/inbox",
      count: unseenCount,
      urgent: unseenCount !== null && unseenCount > 0,
    },
    {
      key: "tasks",
      label: "Aufgaben",
      detail: openTaskCount > 0 ? `${openTaskCount} offen` : "keine offenen",
      href: "/my-tasks",
      count: openTaskCount,
      urgent: openTaskCount > 0,
    },
    {
      key: "relay",
      label: "Relay",
      detail:
        relayUnread > 0
          ? `${relayUnread} ungelesen`
          : "Kommunikation ruhig",
      href: "/relay",
      count: relayUnread > 0 ? relayUnread : undefined,
      urgent: relayUnread > 0,
    },
    {
      key: "routines",
      label: "Routinen",
      detail:
        routineCount > 0
          ? `${routineCount} aktiv`
          : "Routinen planbar",
      href: "/my-tasks",
      count: routineCount > 0 ? routineCount : undefined,
      urgent: false,
    },
    {
      key: "handoff",
      label: "Erinnerungen",
      detail:
        reminderCount > 0
          ? `${reminderCount} anstehend`
          : "strukturiert",
      href: "/my-tasks",
      count: reminderCount > 0 ? reminderCount : undefined,
      urgent: reminderCount > 0,
    },
  ] as const;

  return (
    <div className="yd-dash-zone yd-dash-zone--flow">
      <div className="yd-dash-flow-rail mb-3 flex flex-wrap items-end justify-between gap-2 px-0.5">
        <div>
          <p className="yd-dash-meta mb-0.5 uppercase">Heute</p>
          <p className="yd-dash-section">Praxisfluss — Eingang bis Übergabe</p>
        </div>
        <p className="yd-dash-meta max-w-[16rem] normal-case tracking-normal">
          Fünf Zugänge · ein Überblick
        </p>
      </div>
      <div className="yd-dash-ops-snap yd-dash-ops-snap--structured" role="list">
        {nodes.map((node) => {
          const Icon = FLOW_ICONS[node.key];
          return (
            <div key={node.key} role="listitem" className="min-w-0">
            <HcCard
              tone="quiet"
              className="yd-dash-flow-node min-h-[108px] p-4"
            >
              <Link href={node.href} className="flex h-full flex-col gap-2 no-underline">
                <div className="flex items-start justify-between gap-2">
                  <span
                    className="flex h-9 w-9 items-center justify-center rounded-full"
                    style={{
                      background: YD.accent.iconGradient,
                      boxShadow: "0 4px 14px rgba(30, 91, 189, 0.18)",
                    }}
                  >
                    <Icon className="h-[17px] w-[17px] text-white" strokeWidth={1.65} />
                  </span>
                  {node.count !== undefined && node.count !== null ? (
                    <span
                      className="rounded-full px-2 py-0.5 text-[11px] font-medium tabular-nums"
                      style={{
                        background: node.urgent ? YD.status.active.bg : "rgba(180,198,218,0.2)",
                        color: node.urgent ? YD.status.active.text : YD.text.muted,
                      }}
                    >
                      {node.count}
                    </span>
                  ) : null}
                </div>
                <div className="mt-auto">
                  <p className="text-[13px] font-medium" style={{ color: YD.text.primary }}>
                    {node.label}
                  </p>
                  <p className="mt-0.5 text-[11px] leading-snug" style={{ color: YD.text.faint }}>
                    {node.detail}
                  </p>
                </div>
              </Link>
            </HcCard>
            </div>
          );
        })}
      </div>
    </div>
  );
}

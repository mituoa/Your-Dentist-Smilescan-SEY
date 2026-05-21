import Link from "next/link";
import { Settings, Users } from "lucide-react";

import { HcCard } from "@/components/design/hc-card";
import { YD } from "@/lib/design/yd-design-tokens";

type DashboardTeamPulseProps = {
  workspaceName: string;
  memberCount: number | null;
  teamCount: number | null;
  openTaskCount: number;
  unseenInbox: number | null;
};

export function DashboardTeamPulse({
  workspaceName,
  memberCount,
  teamCount,
  openTaskCount,
  unseenInbox,
}: DashboardTeamPulseProps) {
  const stats = [
    {
      label: "Praxis",
      value: workspaceName,
      sub: "Geschützter Bereich",
    },
    {
      label: "Team",
      value: memberCount === null ? "—" : `${memberCount} Zugänge`,
      sub: teamCount !== null ? `${teamCount} Team · ${Math.max(0, (memberCount ?? 0) - teamCount)} Arzt` : null,
    },
    {
      label: "Belastung",
      value:
        (unseenInbox ?? 0) + openTaskCount > 0
          ? `${(unseenInbox ?? 0) + openTaskCount} offene Punkte`
          : "ruhiger Stand",
      sub: "Eingang + Aufgaben",
    },
  ] as const;

  return (
    <HcCard tone="quiet" className="yd-dash-panel p-5 md:p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4" style={{ color: YD.text.muted }} strokeWidth={1.65} />
          <p className="yd-dash-section">Team &amp; Praxisstatus</p>
        </div>
        <Link
          href="/settings"
          className="inline-flex items-center gap-1 text-[12px] font-medium no-underline"
          style={{ color: YD.accent.core }}
        >
          <Settings className="h-3.5 w-3.5" strokeWidth={1.65} />
          Verwaltung
        </Link>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-xl px-3 py-2.5"
            style={{
              background: "rgba(255,255,255,0.45)",
              border: `1px solid ${YD.border.soft}`,
            }}
          >
            <p className="yd-dash-meta normal-case tracking-normal">{s.label}</p>
            <p className="mt-1 text-[13px] font-medium leading-snug" style={{ color: YD.text.primary }}>
              {s.value}
            </p>
            {s.sub ? (
              <p className="mt-0.5 text-[11px]" style={{ color: YD.text.faint }}>
                {s.sub}
              </p>
            ) : null}
          </div>
        ))}
      </div>
    </HcCard>
  );
}

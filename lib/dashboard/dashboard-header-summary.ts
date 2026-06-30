import { buildDashboardAttentionSubtitle } from "@/lib/dashboard/dashboard-status-copy";

export type DashboardHeaderSummary = {
  /** @deprecated Legacy subtitle — use editorial fields on dashboard */
  subtitle: string;
  editorial: DashboardEditorialHeader;
};

export type DashboardEditorialHeader = {
  statusTitle: string;
  statusPrimary: string;
  statusSecondary?: string;
  metricsLine: string;
};

export function buildDashboardHeaderSummary(input: {
  unseenCount: number;
  preparedAwaitingCount: number;
  tasksNeedingDecision: number;
  preparedCasesCount: number;
}): DashboardHeaderSummary {
  const { unseenCount, preparedAwaitingCount, tasksNeedingDecision, preparedCasesCount } = input;
  const hasCritical =
    preparedAwaitingCount > 0 || tasksNeedingDecision > 0 || unseenCount > 0;

  let statusPrimary = "";

  if (hasCritical) {
    if (tasksNeedingDecision > 0 && preparedAwaitingCount === 0 && unseenCount === 0) {
      statusPrimary =
        tasksNeedingDecision === 1
          ? "1 Entscheidung wartet auf Sie."
          : `${tasksNeedingDecision} Entscheidungen warten auf Sie.`;
    } else {
      statusPrimary = buildDashboardAttentionSubtitle({
        unseenCount,
        preparedAwaitingCount,
        tasksNeedingDecision,
      }).replace(/^Heute /, "");
    }
  }

  const metricsParts = [
    preparedCasesCount > 0
      ? `${preparedCasesCount} ${preparedCasesCount === 1 ? "Fall vorbereitet" : "Fälle vorbereitet"}`
      : null,
    preparedAwaitingCount > 0
      ? `${preparedAwaitingCount} ${preparedAwaitingCount === 1 ? "Freigabe offen" : "Freigaben offen"}`
      : null,
    tasksNeedingDecision > 0
      ? `${tasksNeedingDecision} ${tasksNeedingDecision === 1 ? "Teamblockade" : "Teamblockaden"}`
      : null,
  ].filter((part): part is string => Boolean(part));

  return {
    subtitle: statusPrimary,
    editorial: {
      statusTitle: "Praxisstatus heute",
      statusPrimary,
      metricsLine: metricsParts.length > 0 ? metricsParts.join(" · ") : "",
    },
  };
}

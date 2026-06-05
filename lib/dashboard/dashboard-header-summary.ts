import { buildDashboardAttentionSubtitle } from "@/lib/dashboard/dashboard-status-copy";

export type DashboardHeaderSummary = {
  subtitle: string;
};

export function buildDashboardHeaderSummary(input: {
  unseenCount: number;
  preparedAwaitingCount: number;
  tasksNeedingDecision: number;
}): DashboardHeaderSummary {
  return {
    subtitle: buildDashboardAttentionSubtitle(input),
  };
}

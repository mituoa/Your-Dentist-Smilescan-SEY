import type { RelayWorkRow } from "@/lib/relay/build-relay-practice-snapshot";

export type RelayInventoryStats = {
  total: number;
  urgent: number;
  due: number;
  oldestWait: string | null;
};

export function computeInventoryStats(rows: RelayWorkRow[]): RelayInventoryStats {
  const work = rows.filter((r) => !r.isGhost);
  const urgent = work.filter((r) => r.isCritical).length;
  const due = work.filter((r) => r.dueLabel && !r.isCritical).length;
  const waits = work
    .map((r) => r.waitingLabel ?? r.dueLabel ?? null)
    .filter((w): w is string => Boolean(w));
  return {
    total: work.length,
    urgent,
    due,
    oldestWait: waits[0] ?? null,
  };
}

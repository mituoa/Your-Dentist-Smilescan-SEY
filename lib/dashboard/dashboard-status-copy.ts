/** Dashboard-Statuszeile unter der Begrüßung — kurz, präzise, ohne Posteingang-Jargon. */

export function countAttentionItems(
  unseenCount: number | null,
  openTaskCount: number,
  newCount: number | null
): number {
  return (unseenCount ?? 0) + openTaskCount + (newCount ?? 0);
}

export function buildDashboardSubtitle(
  unseenCount: number | null,
  openTaskCount: number,
  newCount: number | null
): string {
  const total = countAttentionItems(unseenCount, openTaskCount, newCount);
  if (total === 0) return "Praxis aktiv · Alles läuft ruhig.";
  if (total === 1) return "1 Vorgang benötigt Ihre Aufmerksamkeit.";
  return `${total} Vorgänge benötigen Ihre Aufmerksamkeit.`;
}

export function buildMobilePriorityLine(
  unseenCount: number | null,
  openTaskCount: number,
  newCount: number | null
): string {
  const total = countAttentionItems(unseenCount, openTaskCount, newCount);
  if (total === 0) return "Alles läuft ruhig";
  if (total === 1) return "1 Vorgang zur Bearbeitung";
  return `${total} Vorgänge zur Bearbeitung`;
}

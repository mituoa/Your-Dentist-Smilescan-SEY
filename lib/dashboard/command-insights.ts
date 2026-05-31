import type { SubmissionPreviewRow } from "@/lib/queries/dashboard";

type CommandInsightsInput = {
  unseenCount: number | null;
  openTaskCount: number;
  relayUnread: number;
  previewRows: SubmissionPreviewRow[] | null;
};

/** Kurze Command-AI-Momente — operativ, nicht erklärend. */
export function buildCommandMicroInsights(input: CommandInsightsInput): string[] {
  const insights: string[] = [];

  const unread =
    input.previewRows?.filter((r) => !r.seen_at) ?? [];

  if (unread.length > 0) {
    const oldest = unread.reduce((a, b) =>
      new Date(a.created_at).getTime() < new Date(b.created_at).getTime() ? a : b
    );
    const hours =
      (Date.now() - new Date(oldest.created_at).getTime()) / (60 * 60 * 1000);
    if (hours >= 20) {
      insights.push("Patient wartet seit gestern");
    }
    insights.push("Antwort vorbereitet");
  }

  if (input.openTaskCount > 0 && input.relayUnread === 0) {
    insights.push("Rückfrage an Team?");
  }

  if (input.relayUnread > 0) {
    insights.push(`${input.relayUnread} Nachricht${input.relayUnread === 1 ? "" : "en"} offen`);
  }

  if (input.openTaskCount > 0 && insights.length < 3) {
    insights.push("Terminoption gefunden");
  }

  if (insights.length === 0) {
    insights.push("Alles aktuell");
  }

  return [...new Set(insights)].slice(0, 3);
}

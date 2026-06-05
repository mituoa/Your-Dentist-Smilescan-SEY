import type { JournalEntry } from "@/lib/types/journal-entry";

import { getClinicalAreaStats } from "@/lib/journal/clinical-areas";

export function journalWorkspaceStats(entries: JournalEntry[]) {
  const published = entries.filter((e) => e.status === "published");
  const drafts = entries.filter((e) => e.status === "draft");
  const areaStats = getClinicalAreaStats(entries);
  const coveredAreas = areaStats.filter((a) => a.count > 0).length;

  let lastUpdate: string | null = null;
  for (const entry of entries) {
    const ts = entry.updated_at;
    if (!lastUpdate || new Date(ts) > new Date(lastUpdate)) lastUpdate = ts;
  }

  return {
    publishedCount: published.length,
    draftCount: drafts.length,
    coveredAreas,
    totalAreas: areaStats.length,
    lastUpdate,
  };
}

export function formatPublishedCount(count: number): string {
  if (count === 0) return "Noch keine veröffentlichten Inhalte";
  if (count === 1) return "1 veröffentlichter Inhalt";
  return `${count} veröffentlichte Inhalte`;
}

export function formatDraftCount(count: number): string {
  if (count === 0) return "";
  if (count === 1) return "1 Entwurf";
  return `${count} Entwürfe`;
}

export function formatReadingTime(minutes: number | null | undefined): string {
  if (!minutes || minutes < 1) return "Kurz";
  if (minutes === 1) return "1 Minute Lesezeit";
  return `${minutes} Minuten Lesezeit`;
}

export function formatLastUpdatedLabel(timestamp: string): string {
  const relative = formatJournalRelativeTime(timestamp, "edited");
  if (relative === "Heute bearbeitet") return "heute aktualisiert";
  if (relative === "Gestern bearbeitet") return "gestern aktualisiert";
  return relative.replace(" bearbeitet", "").replace(/^Vor /, "vor ");
}

export function getLatestDraft(entries: JournalEntry[]): JournalEntry | null {
  const drafts = entries.filter((e) => e.status === "draft");
  if (drafts.length === 0) return null;
  return drafts.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())[0]!;
}

export function getPopularEntries(entries: JournalEntry[], limit = 4): JournalEntry[] {
  return entries
    .filter((e) => e.status === "published")
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, limit);
}

export function formatJournalRelativeTime(timestamp: string, mode: "published" | "edited" = "edited"): string {
  const now = new Date();
  const date = new Date(timestamp);
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return mode === "published" ? "Heute veröffentlicht" : "Heute bearbeitet";
  if (diffDays === 1) return mode === "published" ? "Gestern veröffentlicht" : "Gestern bearbeitet";
  if (diffDays < 7) {
    return mode === "published"
      ? `Vor ${diffDays} Tagen veröffentlicht`
      : `Vor ${diffDays} Tagen bearbeitet`;
  }
  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return mode === "published" ? `Vor ${weeks} Wochen veröffentlicht` : `Vor ${weeks} Wochen bearbeitet`;
  }

  return date.toLocaleDateString("de-DE", { day: "2-digit", month: "long", year: "numeric" });
}

export function formatLastWorkspaceUpdate(timestamp: string | null): string {
  if (!timestamp) return "Noch keine Inhalte";
  return formatJournalRelativeTime(timestamp, "edited");
}

export function journalEntryTitle(entry: JournalEntry): string {
  return entry.title?.trim() ? entry.title : "Ohne Titel";
}

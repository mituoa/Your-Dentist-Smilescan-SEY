import {
  getContentTypeLabel,
  inferContentType,
  type JournalContentType,
} from "@/lib/journal/content-categories";
import { getRecommendedTopicsMissing, type RecommendedTopic } from "@/lib/journal/recommended-topics";
import { journalEntryTitle } from "@/lib/journal/workspace-display";
import type { JournalEntry } from "@/lib/types/journal-entry";

export const JOURNAL_SECTIONS: {
  id: JournalContentType;
  title: string;
  lead: string;
}[] = [
  {
    id: "faq",
    title: "FAQ",
    lead: "Häufige Patientenfragen — z. B. Zahnschmerzen, Schwellung, wann anrufen.",
  },
  {
    id: "nachsorge",
    title: "Nachsorge",
    lead: "Verhalten nach Behandlungen — Extraktion, Implantation, Wurzelkanal, PZR.",
  },
  {
    id: "erklaerung",
    title: "Erklärungen",
    lead: "Behandlungen verständlich erklärt — Implantate, Parodontitis, Aligner.",
  },
  {
    id: "praxiswissen",
    title: "Praxiswissen",
    lead: "Recall, Termine, Notfälle und Kontaktwege Ihrer Praxis.",
  },
];

const QUICK_ACCESS_MATCHERS: { pattern: RegExp; label: string }[] = [
  { pattern: /zahnschmerz|schmerz/i, label: "Was tun bei Zahnschmerzen?" },
  { pattern: /implant/i, label: "Nachsorge nach Implantation" },
  { pattern: /extrakt/i, label: "Verhalten nach Extraktion" },
  { pattern: /schwell/i, label: "Schwellung nach Eingriff" },
  { pattern: /parodont|parodontitis/i, label: "Parodontitis erklärt" },
];

export type JournalQuickAccessItem = {
  id: string;
  label: string;
  entryId?: string;
};

export type JournalOpenItem =
  | {
      id: string;
      kind: "draft";
      label: string;
      entryId: string;
    }
  | {
      id: string;
      kind: "missing_faq";
      label: string;
      count: number;
      topic: RecommendedTopic;
    }
  | {
      id: string;
      kind: "missing_nachsorge";
      label: string;
      count: number;
      topic: RecommendedTopic;
    };

export function matchesJournalSearch(entry: JournalEntry, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const title = (entry.title ?? "").toLowerCase();
  const excerpt = (entry.excerpt ?? "").toLowerCase();
  return title.includes(q) || excerpt.includes(q);
}

export function buildJournalQuickAccess(entries: JournalEntry[]): JournalQuickAccessItem[] {
  const published = entries.filter((e) => e.status === "published");
  const used = new Set<string>();

  const matched: JournalQuickAccessItem[] = [];

  for (const matcher of QUICK_ACCESS_MATCHERS) {
    const hit = published.find(
      (e) => !used.has(e.id) && matcher.pattern.test(journalEntryTitle(e))
    );
    if (hit) {
      used.add(hit.id);
      matched.push({
        id: hit.id,
        label: journalEntryTitle(hit),
        entryId: hit.id,
      });
    } else {
      matched.push({
        id: `placeholder-${matcher.label}`,
        label: matcher.label,
      });
    }
  }

  return matched.slice(0, 5);
}

export function buildJournalOpenItems(entries: JournalEntry[]): JournalOpenItem[] {
  const items: JournalOpenItem[] = [];

  const drafts = entries
    .filter((e) => e.status === "draft")
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());

  for (const draft of drafts) {
    items.push({
      id: `draft-${draft.id}`,
      kind: "draft",
      label:
        drafts.length === 1
          ? "1 Entwurf wartet auf Fertigstellung"
          : `Entwurf: ${journalEntryTitle(draft)}`,
      entryId: draft.id,
    });
    if (drafts.length === 1) break;
  }

  if (drafts.length > 1) {
    items.unshift({
      id: "drafts-count",
      kind: "draft",
      label: `${drafts.length} Entwürfe warten auf Fertigstellung`,
      entryId: drafts[0]!.id,
    });
  }

  const missing = getRecommendedTopicsMissing(entries, 12);
  const missingFaqs = missing.filter((t) => t.contentType === "faq");
  const missingNachsorge = missing.filter((t) => t.contentType === "nachsorge");

  if (missingFaqs.length > 0) {
    items.push({
      id: "missing-faq",
      kind: "missing_faq",
      label:
        missingFaqs.length === 1
          ? "1 häufige Frage unbeantwortet"
          : `${missingFaqs.length} häufige Fragen unbeantwortet`,
      count: missingFaqs.length,
      topic: missingFaqs[0]!,
    });
  }

  if (missingNachsorge.length > 0) {
    items.push({
      id: "missing-nachsorge",
      kind: "missing_nachsorge",
      label:
        missingNachsorge.length === 1
          ? "1 Nachsorgetext unvollständig"
          : `${missingNachsorge.length} Nachsorgetexte unvollständig`,
      count: missingNachsorge.length,
      topic: missingNachsorge[0]!,
    });
  }

  return items;
}

export function groupPublishedByType(
  entries: JournalEntry[],
  searchQuery: string
): Record<JournalContentType, JournalEntry[]> {
  const grouped: Record<JournalContentType, JournalEntry[]> = {
    faq: [],
    nachsorge: [],
    erklaerung: [],
    praxiswissen: [],
  };

  const published = entries
    .filter((e) => e.status === "published" && matchesJournalSearch(e, searchQuery))
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());

  for (const entry of published) {
    grouped[inferContentType(entry)].push(entry);
  }

  return grouped;
}

export function journalSectionEmptyCopy(type: JournalContentType): string {
  switch (type) {
    case "faq":
      return "Noch keine häufigen Patientenfragen hinterlegt.";
    case "nachsorge":
      return "Noch keine Nachsorgetexte für Ihre Patienten.";
    case "erklaerung":
      return "Noch keine Erklärungen zu Behandlungen.";
    case "praxiswissen":
      return "Noch kein Praxiswissen hinterlegt.";
    default:
      return "Noch keine Inhalte in diesem Bereich.";
  }
}

export { getContentTypeLabel };

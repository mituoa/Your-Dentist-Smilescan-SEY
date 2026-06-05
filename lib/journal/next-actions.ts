import type { ClinicalAreaId } from "@/lib/journal/clinical-areas";
import { CLINICAL_AREAS, getClinicalAreaStats } from "@/lib/journal/clinical-areas";
import { getRecommendedTopicsMissing, type RecommendedTopic } from "@/lib/journal/recommended-topics";
import { getLatestDraft, journalEntryTitle } from "@/lib/journal/workspace-display";
import type { JournalEntry } from "@/lib/types/journal-entry";

export type NextActionKind =
  | "resume_draft"
  | "answer_faq"
  | "fill_area"
  | "expand_area"
  | "create_article";

export type NextAction =
  | {
      id: string;
      kind: "resume_draft";
      label: string;
      description: string;
      entryId: string;
    }
  | {
      id: string;
      kind: "answer_faq";
      label: string;
      description: string;
      topic: RecommendedTopic;
    }
  | {
      id: string;
      kind: "fill_area";
      label: string;
      description: string;
      clinicalArea: ClinicalAreaId;
    }
  | {
      id: string;
      kind: "expand_area";
      label: string;
      description: string;
      clinicalArea: ClinicalAreaId;
    }
  | {
      id: string;
      kind: "create_article";
      label: string;
      description: string;
    };

export function getNextActions(entries: JournalEntry[], limit = 5): NextAction[] {
  const actions: NextAction[] = [];
  const latestDraft = getLatestDraft(entries);

  if (latestDraft) {
    actions.push({
      id: `draft-${latestDraft.id}`,
      kind: "resume_draft",
      label: "Entwurf fortsetzen",
      description: journalEntryTitle(latestDraft),
      entryId: latestDraft.id,
    });
  }

  const missingFaqs = getRecommendedTopicsMissing(entries, 3);
  for (const faq of missingFaqs.slice(0, 2)) {
    actions.push({
      id: `faq-${faq.title}`,
      kind: "answer_faq",
      label: "Häufige Frage beantworten",
      description: faq.title,
      topic: faq,
    });
  }

  const areaStats = getClinicalAreaStats(entries);
  const emptyAreas = areaStats.filter((a) => a.count === 0);
  const sparseAreas = areaStats.filter((a) => a.count > 0 && a.count <= 2);

  for (const area of emptyAreas.slice(0, 2)) {
    actions.push({
      id: `fill-${area.id}`,
      kind: "fill_area",
      label: `${area.label} ergänzen`,
      description: area.gapHint,
      clinicalArea: area.id,
    });
  }

  for (const area of sparseAreas.slice(0, 1)) {
    actions.push({
      id: `expand-${area.id}`,
      kind: "expand_area",
      label: `${area.label} erweitern`,
      description: `${area.count} ${area.count === 1 ? "Inhalt" : "Inhalte"} — weiter ausbauen`,
      clinicalArea: area.id,
    });
  }

  if (entries.filter((e) => e.status === "published").length === 0 && actions.length < limit) {
    actions.push({
      id: "create-first",
      kind: "create_article",
      label: "Ersten Wissensartikel anlegen",
      description: "Beginnen Sie mit dem ersten Wissensartikel Ihrer Praxis.",
    });
  }

  return actions.slice(0, limit);
}

export function getPriorityClinicalAreas(): ClinicalAreaId[] {
  return CLINICAL_AREAS.map((a) => a.id);
}

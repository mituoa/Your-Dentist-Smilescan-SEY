/**
 * Praxisstatus — Orientierung oberhalb der Queue (kein KPI-Dashboard).
 */
import type { EnrichedSubmissionListItem } from "@/lib/inbox/tracker-inbox-logic";
import {
  isVerlaufskontrolle,
  resolveTrackerCaseType,
} from "@/lib/inbox/tracker-v11-presentational";

import type { TrackerStatusKind } from "@/lib/inbox/tracker-v12-presentational";

export type PraxisOverviewCategory =
  | "schmerzfall"
  | "neue_anfrage"
  | "verlaufskontrolle"
  | "nachsorge"
  | "antwortfreigabe"
  | "aufgabe";

export type PraxisOrientationLine = {
  id: PraxisOverviewCategory;
  count: number;
  label: string;
};

const OVERVIEW_ORDER: PraxisOverviewCategory[] = [
  "schmerzfall",
  "neue_anfrage",
  "verlaufskontrolle",
  "nachsorge",
  "antwortfreigabe",
  "aufgabe",
];

function isSchmerzfall(item: EnrichedSubmissionListItem): boolean {
  const notes = `${item.patient_notes ?? ""}`.toLowerCase();
  if (/schmerz|weh|empfindlich|pochen|druck/.test(notes)) return true;
  return item.urgency === "today" && resolveTrackerCaseType(item).kind === "neue_anfrage";
}

export function resolveOverviewCategory(
  item: EnrichedSubmissionListItem
): PraxisOverviewCategory {
  const caseType = resolveTrackerCaseType(item);

  if (caseType.kind === "ki_freigabe") return "antwortfreigabe";
  if (caseType.kind === "praxisaufgabe") return "aufgabe";
  if (isVerlaufskontrolle(item)) return "verlaufskontrolle";
  if (caseType.kind === "nachsorge") return "nachsorge";
  if (isSchmerzfall(item)) return "schmerzfall";
  return "neue_anfrage";
}

function formatOverviewLabel(
  category: PraxisOverviewCategory,
  count: number
): string {
  const n = count;
  switch (category) {
    case "schmerzfall":
      return n === 1 ? "1 neuer Schmerzfall" : `${n} neue Schmerzfälle`;
    case "neue_anfrage":
      return n === 1 ? "1 neue Anfrage" : `${n} neue Anfragen`;
    case "verlaufskontrolle":
      return n === 1 ? "1 Verlaufskontrolle" : `${n} Verlaufskontrollen`;
    case "nachsorge":
      return n === 1 ? "1 Nachsorge" : `${n} Nachsorgen`;
    case "antwortfreigabe":
      return n === 1 ? "1 Antwortfreigabe" : `${n} Antwortfreigaben`;
    case "aufgabe":
      return n === 1 ? "1 Praxisaufgabe" : `${n} Praxisaufgaben`;
    default:
      return `${n} Fälle`;
  }
}

export function buildPraxisOrientation(
  items: EnrichedSubmissionListItem[]
): PraxisOrientationLine[] {
  const counts = new Map<PraxisOverviewCategory, number>();

  for (const item of items) {
    const cat = resolveOverviewCategory(item);
    counts.set(cat, (counts.get(cat) ?? 0) + 1);
  }

  return OVERVIEW_ORDER.filter((id) => (counts.get(id) ?? 0) > 0).map((id) => {
    const count = counts.get(id) ?? 0;
    return { id, count, label: formatOverviewLabel(id, count) };
  });
}

export function buildWorkHeadline(
  statusKind: TrackerStatusKind,
  statusLabel: string,
  detailLine: string | null
): string {
  switch (statusKind) {
    case "schmerzfall":
      return "Neuer Schmerzfall";
    case "ki_freigabe":
      return "Antwort wartet auf Freigabe";
    case "kontrollverlauf": {
      const tagMatch = detailLine?.match(/Tag\s+(\d+)/i);
      if (tagMatch?.[1]) return `Verlaufskontrolle Tag ${tagMatch[1]}`;
      return detailLine?.includes("Kontrollbild")
        ? "Kontrollbild"
        : "Verlaufskontrolle";
    }
    case "praxisaufgabe":
      return "Praxisaufgabe";
    case "nachsorge":
      return statusLabel !== "Nachsorge" ? statusLabel : "Nachsorge";
    case "neue_anfrage":
    default:
      return "Neue Anfrage";
  }
}

export const TRACKER_PRIORITY_LIMIT = 3;

/** Dashboard-artige KPI-Chips — immer vier Kategorien, auch bei 0. */
export type TrackerDecisionKpiId =
  | "neue_anfragen"
  | "verlaufskontrollen"
  | "freigaben"
  | "aufgaben";

export type TrackerDecisionKpi = {
  id: TrackerDecisionKpiId;
  label: string;
  count: number;
};

const KPI_DEFS: { id: TrackerDecisionKpiId; label: string }[] = [
  { id: "neue_anfragen", label: "Neue Anfragen" },
  { id: "verlaufskontrollen", label: "Verlaufskontrollen" },
  { id: "freigaben", label: "Freigaben" },
  { id: "aufgaben", label: "Aufgaben" },
];

function categoryToKpiId(
  category: PraxisOverviewCategory
): TrackerDecisionKpiId {
  switch (category) {
    case "schmerzfall":
    case "neue_anfrage":
      return "neue_anfragen";
    case "verlaufskontrolle":
    case "nachsorge":
      return "verlaufskontrollen";
    case "antwortfreigabe":
      return "freigaben";
    case "aufgabe":
    default:
      return "aufgaben";
  }
}

export function buildDecisionKpis(
  items: EnrichedSubmissionListItem[]
): TrackerDecisionKpi[] {
  const counts: Record<TrackerDecisionKpiId, number> = {
    neue_anfragen: 0,
    verlaufskontrollen: 0,
    freigaben: 0,
    aufgaben: 0,
  };

  for (const item of items) {
    const kpiId = categoryToKpiId(resolveOverviewCategory(item));
    counts[kpiId] += 1;
  }

  return KPI_DEFS.map((def) => ({
    id: def.id,
    label: def.label,
    count: counts[def.id],
  }));
}

export function formatDecisionHero(count: number): string {
  if (count <= 0) return "Heute warten keine Entscheidungen auf Sie";
  if (count === 1) return "Heute wartet 1 Entscheidung auf Sie";
  return `Heute warten ${count} Entscheidungen auf Sie`;
}

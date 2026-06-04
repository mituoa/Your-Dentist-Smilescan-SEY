/**
 * Tracker Queue — Präsentation für Referenz-Arbeitsoberfläche (Zeilen, keine Tabelle).
 */
import { formatBirthDateDe } from "@/lib/inbox/tracker-overview-status";
import { formatPatientAgeYears, type EnrichedSubmissionListItem } from "@/lib/inbox/tracker-inbox-logic";
import {
  buildClinicalQueueCard,
  buildHeuteRelevantMetrics,
  countAttentionCases,
  isVerlaufskontrolle,
  resolveTrackerCaseType,
  sortClinicalWorkQueue,
  trackerPriority,
  type TrackerCaseTypeKind,
} from "@/lib/inbox/tracker-v11-presentational";
import type { TrackerPriorityLevel } from "@/lib/inbox/tracker-v10-presentational";

export type OrientationKpi = {
  id: string;
  count: number;
  label: string;
};

export type QueueRowModel = {
  id: string;
  patientName: string;
  ageLabel: string | null;
  birthLabel: string | null;
  activityLabel: string;
  falltypPrimary: string;
  falltypCategory: string | null;
  falltypKind: TrackerCaseTypeKind;
  priorityLabel: string;
  priorityLevel: TrackerPriorityLevel;
  actionLabel: string;
};

export function buildOrientationKpis(
  items: EnrichedSubmissionListItem[]
): OrientationKpi[] {
  const labels: Record<string, string> = {
    neue_anfrage: "Neue Anfragen",
    nachsorge: "Nachsorgen",
    ki_freigabe: "Freigaben",
    aufgaben: "Offene Aufgaben",
  };

  return buildHeuteRelevantMetrics(items)
    .filter((m) => m.count > 0)
    .map((m) => ({
      id: m.id,
      count: m.count,
      label: labels[m.id] ?? m.label,
    }));
}

export function buildQueueRowModel(item: EnrichedSubmissionListItem): QueueRowModel {
  const card = buildClinicalQueueCard(item);
  const caseType = resolveTrackerCaseType(item);
  const priority = trackerPriority(item);

  let falltypPrimary = card.headline;
  let falltypCategory: string | null = null;

  switch (caseType.kind) {
    case "nachsorge":
      falltypPrimary = caseType.label;
      falltypCategory = isVerlaufskontrolle(item) ? "Kontrollverlauf" : "Nachsorge";
      break;
    case "ki_freigabe":
      falltypPrimary = "Antwort vorbereitet";
      falltypCategory = "Freigabe";
      break;
    case "neue_anfrage": {
      falltypPrimary = "Neue Anfrage";
      const notes = `${item.patient_notes ?? ""}`.toLowerCase();
      if (
        /schmerz|weh|empfindlich|pochen|druck/.test(notes) ||
        item.urgency === "today"
      ) {
        falltypCategory = "Schmerzfall";
      }
      break;
    }
    case "praxisaufgabe":
      falltypPrimary = "Praxisaufgabe";
      falltypCategory = "Aufgabe";
      break;
    default:
      break;
  }

  return {
    id: item.id,
    patientName: card.patientName,
    ageLabel: formatPatientAgeYears(item.patient_birth_date),
    birthLabel: formatBirthDateDe(item.patient_birth_date),
    activityLabel: card.activityLabel,
    falltypPrimary,
    falltypCategory,
    falltypKind: caseType.kind,
    priorityLabel: priority.label,
    priorityLevel: priority.level,
    actionLabel: card.actionLabel,
  };
}

export { countAttentionCases, sortClinicalWorkQueue };

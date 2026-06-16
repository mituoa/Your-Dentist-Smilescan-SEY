import type { RelayWorkRow } from "@/lib/relay/build-relay-practice-snapshot";

export type RelayWorkVisualType = "freigabe" | "aufgabe" | "routine" | "nachricht" | "uebergabe";

/** V7 — visueller Vorgangstyp für Listensymbol (ohne Farbe). */
export function resolveRelayWorkVisualType(row: RelayWorkRow): RelayWorkVisualType {
  const label = row.workTypeLabel?.toUpperCase() ?? "";
  if (label.includes("JOURNAL")) return "freigabe";
  if (label.includes("PATIENT")) return "aufgabe";
  if (label.includes("ROUTINE")) return "routine";
  if (label.includes("ÜBERGABE")) return "uebergabe";
  if (row.kind === "message") return "uebergabe";
  if (row.kind === "journal" || row.typeLabel === "Freigabe") return "freigabe";
  if (row.typeLabel === "Routine") return "routine";
  if (row.typeLabel === "Übergabe") return "uebergabe";
  if (row.statusLabel.toLowerCase().includes("freigabe")) return "freigabe";
  return "aufgabe";
}

export const RELAY_WORK_TYPE_LABELS: Record<RelayWorkVisualType, string> = {
  freigabe: "Freigabe",
  aufgabe: "Aufgabe",
  routine: "Routine",
  nachricht: "Nachricht",
  uebergabe: "Übergabe",
};

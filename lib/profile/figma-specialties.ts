import { getSpecializationLabel } from "@/lib/masterdata/specializations";

/** Figma-aligned picker: stable ids (master or custom:label), first six “primary”. */
export interface FigmaSpecialtyOption {
  id: string;
  label: string;
}

export const FIGMA_SPECIALTY_OPTIONS: FigmaSpecialtyOption[] = [
  { id: "custom:Ästhetische Zahnmedizin", label: "Ästhetische Zahnmedizin" },
  { id: "implantology", label: "Implantologie" },
  { id: "periodontology", label: "Parodontologie" },
  { id: "endodontics", label: "Endodontie" },
  { id: "orthodontics", label: "Kieferorthopädie" },
  { id: "oral-surgery", label: "Oralchirurgie" },
  { id: "prosthodontics", label: "Prothetik" },
  { id: "pediatric-dentistry", label: "Kinderzahnheilkunde" },
  { id: "custom:Alterszahnheilkunde", label: "Alterszahnheilkunde" },
  { id: "custom:Funktionsdiagnostik", label: "Funktionsdiagnostik" },
  { id: "custom:Laserbehandlung", label: "Laserbehandlung" },
  { id: "custom:Prophylaxe", label: "Prophylaxe" },
  { id: "custom:Sportmundschutz", label: "Sportmundschutz" },
  { id: "custom:Schmerztherapie", label: "Schmerztherapie" },
  { id: "custom:Zahnerhaltung", label: "Zahnerhaltung" },
];

export const FIGMA_PRIMARY_SPECIALTY_IDS = FIGMA_SPECIALTY_OPTIONS.slice(0, 6).map((s) => s.id);

export const MAX_FIGMA_SPECIALTY_SELECTIONS = 5;

export function figmaSpecialtyLabel(id: string): string {
  const hit = FIGMA_SPECIALTY_OPTIONS.find((o) => o.id === id);
  if (hit) return hit.label;
  if (id.startsWith("custom:")) return id.slice("custom:".length);
  return getSpecializationLabel(id);
}

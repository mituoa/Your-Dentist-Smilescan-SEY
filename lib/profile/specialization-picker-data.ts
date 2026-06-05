import {
  SPECIALIZATION_MASTER,
  getSpecializationLabel,
} from "@/lib/masterdata/specializations";

/**
 * Schwerpunkte — Original Phase 8 (Chef-Repo, Commit 3821b7f).
 * Quelle: lib/masterdata/specializations.ts — 18 Fachgebiete, keine Figma-Kurzliste.
 */

export type SpecializationPickerItem = {
  id: string;
  label: string;
};

export type SpecializationPickerGroup = {
  id: string;
  label: string;
  /** Immer sichtbar (Hauptschwerpunkte) */
  primary?: boolean;
  items: SpecializationPickerItem[];
};

/** Sechs häufige Fachgebiete — zuerst sichtbar (Phase-8-Reihenfolge, praxisnah). */
export const PRIMARY_SPECIALIZATION_IDS = [
  "general-dentistry",
  "implantology",
  "periodontology",
  "endodontics",
  "orthodontics",
  "oral-surgery",
] as const;

export const MAX_SPECIALIZATION_SELECTIONS = 5;

function item(id: string): SpecializationPickerItem {
  return { id, label: getSpecializationLabel(id) };
}

/** Alle 18 Fachgebiete aus SPECIALIZATION_MASTER — exakt wie in der Repo hinterlegt. */
export const SPECIALIZATION_PICKER_GROUPS: SpecializationPickerGroup[] = [
  {
    id: "primary",
    label: "Häufige Schwerpunkte",
    primary: true,
    items: PRIMARY_SPECIALIZATION_IDS.map((id) => item(id)),
  },
  {
    id: "conservative",
    label: "Konservierend & Prothetik",
    items: [item("restorative"), item("prosthodontics")],
  },
  {
    id: "surgery",
    label: "Chirurgie",
    items: [item("maxillofacial-surgery")],
  },
  {
    id: "pediatric",
    label: "Kinder & besondere Patientengruppen",
    items: [item("pediatric-dentistry"), item("special-care")],
  },
  {
    id: "oral-medicine",
    label: "Oralmedizin & Diagnostik",
    items: [
      item("oral-medicine"),
      item("orofacial-pain"),
      item("dental-radiology"),
      item("oral-pathology"),
      item("oral-microbiology"),
    ],
  },
  {
    id: "sedation",
    label: "Anästhesie & Sedierung",
    items: [item("anesthesia")],
  },
  {
    id: "public",
    label: "Öffentliches Gesundheitswesen",
    items: [item("public-health")],
  },
];

/** Sicherstellen: jedes Master-Fachgebiet ist wählbar (Vollständigkeit). */
const groupedIds = new Set(
  SPECIALIZATION_PICKER_GROUPS.flatMap((g) => g.items.map((i) => i.id))
);
const missingFromGroups = SPECIALIZATION_MASTER.filter((s) => !groupedIds.has(s.id));
if (missingFromGroups.length > 0) {
  SPECIALIZATION_PICKER_GROUPS.push({
    id: "weitere",
    label: "Weitere Fachgebiete",
    items: missingFromGroups.map((s) => ({ id: s.id, label: s.label })),
  });
}

export const SPECIALIZATION_EXTENDED_GROUPS = SPECIALIZATION_PICKER_GROUPS.filter(
  (g) => !g.primary && g.items.length > 0
);

const labelById = new Map<string, string>();
for (const s of SPECIALIZATION_MASTER) {
  labelById.set(s.id, s.label);
}
for (const group of SPECIALIZATION_PICKER_GROUPS) {
  for (const entry of group.items) {
    labelById.set(entry.id, entry.label);
  }
}

export function specializationPickerLabel(id: string): string {
  if (labelById.has(id)) return labelById.get(id)!;
  if (id.startsWith("custom:")) return id.slice("custom:".length);
  return getSpecializationLabel(id);
}

export function isKnownSpecializationPickerId(id: string): boolean {
  return labelById.has(id) || id.startsWith("custom:");
}

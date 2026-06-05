import {
  SPECIALIZATION_MASTER,
  getSpecializationLabel,
} from "@/lib/masterdata/specializations";

/**
 * Fachbereiche — vollständige Zahnmedizin-Struktur für den Profil-Editor.
 * Fachbereich = wofür die Praxis steht. Leistungen separat unter services.ts.
 */

export type SpecializationPickerItem = {
  id: string;
  label: string;
};

export type SpecializationPickerGroup = {
  id: string;
  label: string;
  items: SpecializationPickerItem[];
};

export const MAX_SPECIALIZATION_SELECTIONS = 5;

function item(id: string): SpecializationPickerItem {
  return { id, label: getSpecializationLabel(id) };
}

/** Zwölf praxisnahe Fachbereiche — jeder kann später Leistungen enthalten. */
export const FACHBEREICH_GROUPS: SpecializationPickerGroup[] = [
  {
    id: "general",
    label: "Allgemeine Zahnmedizin",
    items: [item("general-dentistry"), item("oral-medicine")],
  },
  {
    id: "conservation",
    label: "Zahnerhalt",
    items: [item("restorative"), item("endodontics")],
  },
  {
    id: "perio",
    label: "Parodontologie",
    items: [item("periodontology")],
  },
  {
    id: "implant",
    label: "Implantologie",
    items: [item("implantology")],
  },
  {
    id: "aesthetic",
    label: "Ästhetische Zahnmedizin",
    items: [item("aesthetic-dentistry")],
  },
  {
    id: "prosthetics",
    label: "Prothetik",
    items: [item("prosthodontics")],
  },
  {
    id: "ortho",
    label: "Kieferorthopädie",
    items: [item("orthodontics")],
  },
  {
    id: "surgery",
    label: "Oralchirurgie",
    items: [item("oral-surgery"), item("maxillofacial-surgery")],
  },
  {
    id: "pediatric",
    label: "Kinderzahnheilkunde",
    items: [item("pediatric-dentistry")],
  },
  {
    id: "cmd",
    label: "Funktionsdiagnostik / CMD",
    items: [item("orofacial-pain"), item("dental-radiology")],
  },
  {
    id: "sedation",
    label: "Sedierung / Anästhesie",
    items: [item("anesthesia")],
  },
  {
    id: "special-groups",
    label: "Besondere Patientengruppen",
    items: [item("special-care")],
  },
];

const groupedIds = new Set(FACHBEREICH_GROUPS.flatMap((g) => g.items.map((i) => i.id)));
const ungroupedMaster = SPECIALIZATION_MASTER.filter((s) => !groupedIds.has(s.id));

/** Seltene Zusatz-Fachgebiete — eingeklappt, nicht im Hauptfokus. */
export const FACHBEREICH_EXTENDED_GROUPS: SpecializationPickerGroup[] =
  ungroupedMaster.length > 0
    ? [
        {
          id: "extended",
          label: "Weitere Fachgebiete",
          items: ungroupedMaster.map((s) => ({ id: s.id, label: s.label })),
        },
      ]
    : [];

/** @deprecated Alias — weiterhin für Vorschau-Labels */
export const SPECIALIZATION_PICKER_GROUPS = FACHBEREICH_GROUPS;
export const SPECIALIZATION_EXTENDED_GROUPS = FACHBEREICH_EXTENDED_GROUPS;
export const PRIMARY_SPECIALIZATION_IDS = FACHBEREICH_GROUPS.flatMap((g) =>
  g.items.map((i) => i.id)
) as unknown as readonly string[];

const labelById = new Map<string, string>();
for (const s of SPECIALIZATION_MASTER) {
  labelById.set(s.id, s.label);
}
for (const group of [...FACHBEREICH_GROUPS, ...FACHBEREICH_EXTENDED_GROUPS]) {
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

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

/** Achtzehn Oberbereiche — verschachtelt, praxisnah, filterbar mit Leistungen. */
export const FACHBEREICH_GROUPS: SpecializationPickerGroup[] = [
  {
    id: "general",
    label: "Allgemeine Zahnmedizin",
    items: [item("general-dentistry"), item("oral-medicine")],
  },
  {
    id: "conservation",
    label: "Zahnerhalt",
    items: [item("restorative"), item("minimally-invasive")],
  },
  {
    id: "endo",
    label: "Endodontie",
    items: [item("endodontics")],
  },
  {
    id: "perio",
    label: "Parodontologie",
    items: [item("periodontology"), item("periodontology-surgery")],
  },
  {
    id: "implant",
    label: "Implantologie",
    items: [
      item("implantology"),
      item("guided-implantology"),
      item("immediate-implants"),
    ],
  },
  {
    id: "prosthetics",
    label: "Prothetik",
    items: [
      item("prosthodontics"),
      item("cad-cam-prosthetics"),
      item("removable-prosthetics"),
    ],
  },
  {
    id: "aesthetic",
    label: "Ästhetische Zahnmedizin",
    items: [item("aesthetic-dentistry"), item("digital-smile-design")],
  },
  {
    id: "ortho",
    label: "Kieferorthopädie",
    items: [
      item("orthodontics"),
      item("lingual-orthodontics"),
      item("interceptive-ortho"),
    ],
  },
  {
    id: "surgery",
    label: "Oralchirurgie",
    items: [
      item("oral-surgery"),
      item("maxillofacial-surgery"),
      item("wisdom-teeth-surgery"),
    ],
  },
  {
    id: "pediatric",
    label: "Kinderzahnheilkunde",
    items: [item("pediatric-dentistry")],
  },
  {
    id: "cmd",
    label: "CMD / Funktionsdiagnostik",
    items: [item("functional-diagnostics"), item("dental-radiology")],
  },
  {
    id: "sedation",
    label: "Sedierung / Anästhesie",
    items: [item("anesthesia")],
  },
  {
    id: "geriatric",
    label: "Alterszahnmedizin",
    items: [item("geriatric-dentistry")],
  },
  {
    id: "prevention",
    label: "Prävention",
    items: [item("preventive-dentistry")],
  },
  {
    id: "splint",
    label: "Schienentherapie",
    items: [item("splint-therapy"), item("bruxism-therapy")],
  },
  {
    id: "pain",
    label: "Schmerztherapie",
    items: [item("orofacial-pain"), item("pain-therapy")],
  },
  {
    id: "special-groups",
    label: "Besondere Patientengruppen",
    items: [
      item("special-care"),
      item("anxiety-patients"),
      item("sleep-medicine-dental"),
      item("sports-dentistry"),
    ],
  },
  {
    id: "digital",
    label: "Digitale Zahnmedizin",
    items: [item("digital-dentistry"), item("laser-dentistry")],
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

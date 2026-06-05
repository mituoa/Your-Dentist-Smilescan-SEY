import type { JournalEntry } from "@/lib/types/journal-entry";

export type ClinicalAreaId =
  | "implantologie"
  | "parodontologie"
  | "prothetik"
  | "vorsorge"
  | "kinderzahnheilkunde"
  | "cmd"
  | "aesthetik"
  | "oralchirurgie";

export interface ClinicalArea {
  id: ClinicalAreaId;
  label: string;
  gapHint: string;
}

export const CLINICAL_AREAS: ClinicalArea[] = [
  {
    id: "implantologie",
    label: "Implantologie",
    gapHint: "Implantologie ist noch nicht abgedeckt.",
  },
  {
    id: "parodontologie",
    label: "Parodontologie",
    gapHint: "Parodontologie ist noch nicht abgedeckt.",
  },
  {
    id: "prothetik",
    label: "Prothetik",
    gapHint: "Prothetik ist noch nicht abgedeckt.",
  },
  {
    id: "vorsorge",
    label: "Vorsorge",
    gapHint: "Vorsorge ist noch nicht abgedeckt.",
  },
  {
    id: "kinderzahnheilkunde",
    label: "Kinderzahnheilkunde",
    gapHint: "Kinderzahnheilkunde ist noch nicht abgedeckt.",
  },
  {
    id: "cmd",
    label: "CMD",
    gapHint: "CMD ist noch nicht abgedeckt.",
  },
  {
    id: "aesthetik",
    label: "Ästhetische Zahnmedizin",
    gapHint: "Ästhetische Zahnmedizin ist noch nicht abgedeckt.",
  },
  {
    id: "oralchirurgie",
    label: "Oralchirurgie",
    gapHint: "Oralchirurgie ist noch nicht abgedeckt.",
  },
];

const CLINICAL_AREA_SET = new Set<string>(CLINICAL_AREAS.map((a) => a.id));

export function isClinicalAreaId(value: string | null | undefined): value is ClinicalAreaId {
  return Boolean(value && CLINICAL_AREA_SET.has(value));
}

export function getClinicalAreaLabel(id: ClinicalAreaId | string | null | undefined): string | null {
  if (!id) return null;
  return CLINICAL_AREAS.find((a) => a.id === id)?.label ?? null;
}

export function getClinicalAreaGapHint(id: ClinicalAreaId): string {
  return CLINICAL_AREAS.find((a) => a.id === id)?.gapHint ?? "Dieser Bereich ist noch nicht abgedeckt.";
}

const TITLE_KEYWORDS: { keywords: string[]; area: ClinicalAreaId }[] = [
  { keywords: ["implant", "brücke", "krone"], area: "implantologie" },
  { keywords: ["parodont", "zahnfleisch", "blutet"], area: "parodontologie" },
  { keywords: ["prothese", "prothetik", "zahnreihe"], area: "prothetik" },
  { keywords: ["vorsorge", "kontrolle", "reinigung", "prophylaxe"], area: "vorsorge" },
  { keywords: ["kind", "kinder"], area: "kinderzahnheilkunde" },
  { keywords: ["cmd", "kiefergelenk", "knirschen"], area: "cmd" },
  { keywords: ["ästhet", "bleaching", "veneer"], area: "aesthetik" },
  { keywords: ["weisheits", "extraktion", "chirurg", "eingriff"], area: "oralchirurgie" },
  { keywords: ["zahnschmerz", "schmerz", "notfall"], area: "vorsorge" },
];

const LEGACY_TOPIC_TO_AREA: Record<string, ClinicalAreaId> = {
  treatment: "implantologie",
  diagnostics: "parodontologie",
  prevention: "vorsorge",
  microbiome: "parodontologie",
  culture: "kinderzahnheilkunde",
  science: "vorsorge",
};

export function inferClinicalArea(entry: JournalEntry): ClinicalAreaId | null {
  if (isClinicalAreaId(entry.clinical_area)) return entry.clinical_area;

  const title = (entry.title ?? "").toLowerCase();
  for (const rule of TITLE_KEYWORDS) {
    if (rule.keywords.some((kw) => title.includes(kw))) return rule.area;
  }

  if (entry.topic && LEGACY_TOPIC_TO_AREA[entry.topic]) {
    return LEGACY_TOPIC_TO_AREA[entry.topic];
  }

  return null;
}

export type ClinicalAreaStats = {
  id: ClinicalAreaId;
  label: string;
  count: number;
  lastUpdated: string | null;
  gapHint: string;
};

export function getClinicalAreaStats(entries: JournalEntry[]): ClinicalAreaStats[] {
  const published = entries.filter((e) => e.status === "published");
  const counts = new Map<ClinicalAreaId, { count: number; lastUpdated: string | null }>();

  for (const area of CLINICAL_AREAS) {
    counts.set(area.id, { count: 0, lastUpdated: null });
  }

  for (const entry of published) {
    const areaId = inferClinicalArea(entry);
    if (!areaId) continue;
    const current = counts.get(areaId)!;
    current.count += 1;
    if (!current.lastUpdated || new Date(entry.updated_at) > new Date(current.lastUpdated)) {
      current.lastUpdated = entry.updated_at;
    }
  }

  return CLINICAL_AREAS.map((area) => {
    const stat = counts.get(area.id)!;
    return {
      id: area.id,
      label: area.label,
      count: stat.count,
      lastUpdated: stat.lastUpdated,
      gapHint: area.gapHint,
    };
  });
}

export function groupPublishedByClinicalArea(
  entries: JournalEntry[],
  focusArea: ClinicalAreaId | null = null
): { area: ClinicalArea; entries: JournalEntry[] }[] {
  const published = entries.filter((e) => e.status === "published");

  const groups = new Map<ClinicalAreaId, JournalEntry[]>();
  const unassigned: JournalEntry[] = [];

  for (const entry of published) {
    const areaId = inferClinicalArea(entry);
    if (!areaId) {
      unassigned.push(entry);
      continue;
    }
    const list = groups.get(areaId) ?? [];
    list.push(entry);
    groups.set(areaId, list);
  }

  const result = CLINICAL_AREAS.filter((area) => {
    if (focusArea) return area.id === focusArea;
    return (groups.get(area.id)?.length ?? 0) > 0;
  }).map((area) => ({
    area,
    entries: (groups.get(area.id) ?? []).sort(
      (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    ),
  }));

  if (!focusArea && unassigned.length > 0) {
    result.push({
      area: {
        id: "vorsorge" as ClinicalAreaId,
        label: "Weitere Inhalte",
        gapHint: "",
      },
      entries: unassigned.sort(
        (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      ),
    });
  }

  return result;
}

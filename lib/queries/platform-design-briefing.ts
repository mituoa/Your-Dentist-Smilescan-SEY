import { PLATFORM_DESIGN_BRIEFING_SEED } from "@/lib/design/platform-design-briefing/seed-data";
import {
  PLATFORM_DESIGN_BRIEFING_SLUG,
  type PlatformDesignBriefing,
  type PlatformDesignBriefingArea,
  type PlatformDesignBriefingAreaSlug,
  type PlatformDesignBriefingBundle,
  type PlatformDesignBriefingSection,
} from "@/lib/design/platform-design-briefing/types";
import { createClient } from "@/lib/supabase/server";

function fallbackBundle(): PlatformDesignBriefingBundle {
  const now = new Date().toISOString();
  const briefingId = "00000000-0000-4000-8000-000000000001";

  const briefing: PlatformDesignBriefing = {
    id: briefingId,
    slug: PLATFORM_DESIGN_BRIEFING_SLUG,
    title: PLATFORM_DESIGN_BRIEFING_SEED.title,
    version: PLATFORM_DESIGN_BRIEFING_SEED.version,
    status: PLATFORM_DESIGN_BRIEFING_SEED.status,
    scope_label: PLATFORM_DESIGN_BRIEFING_SEED.scopeLabel,
    target_audience: PLATFORM_DESIGN_BRIEFING_SEED.targetAudience,
    preamble_markdown: PLATFORM_DESIGN_BRIEFING_SEED.preambleMarkdown,
    created_at: now,
    updated_at: now,
  };

  const sections: PlatformDesignBriefingSection[] = PLATFORM_DESIGN_BRIEFING_SEED.sections.map(
    (section, index) => ({
      id: `00000000-0000-4000-8000-${String(index + 1).padStart(12, "0")}`,
      briefing_id: briefingId,
      section_number: section.sectionNumber,
      slug: section.slug,
      title: section.title,
      content_markdown: section.contentMarkdown,
      sort_order: section.sectionNumber,
      created_at: now,
      updated_at: now,
    })
  );

  const areas: PlatformDesignBriefingArea[] = PLATFORM_DESIGN_BRIEFING_SEED.areas.map(
    (area, index) => ({
      id: `00000000-0000-4000-9000-${String(index + 1).padStart(12, "0")}`,
      slug: area.slug,
      title: area.title,
      description: area.description,
      sort_order: area.sortOrder,
      implementation_status: "pending",
      implementation_notes: null,
      created_at: now,
      updated_at: now,
    })
  );

  const areaSectionNumbers = Object.fromEntries(
    PLATFORM_DESIGN_BRIEFING_SEED.areas.map((area) => [area.slug, area.sectionNumbers])
  ) as Record<PlatformDesignBriefingAreaSlug, number[]>;

  return { briefing, sections, areas, areaSectionNumbers };
}

export async function getPlatformDesignBriefingBundle(
  slug: string = PLATFORM_DESIGN_BRIEFING_SLUG
): Promise<PlatformDesignBriefingBundle> {
  const supabase = await createClient();

  const { data: briefing, error: briefingError } = await supabase
    .from("platform_design_briefings")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (briefingError || !briefing) {
    return fallbackBundle();
  }

  const { data: sections } = await supabase
    .from("platform_design_briefing_sections")
    .select("*")
    .eq("briefing_id", briefing.id)
    .order("sort_order", { ascending: true });

  const { data: areas } = await supabase
    .from("platform_design_briefing_areas")
    .select("*")
    .eq("briefing_id", briefing.id)
    .order("sort_order", { ascending: true });

  if (!sections?.length) {
    return fallbackBundle();
  }

  const areaIds = (areas ?? []).map((area) => area.id);
  const { data: links } =
    areaIds.length > 0
      ? await supabase
          .from("platform_design_briefing_area_sections")
          .select("area_id, section_id")
          .in("area_id", areaIds)
      : { data: [] as { area_id: string; section_id: string }[] };

  const sectionNumberById = new Map(sections.map((s) => [s.id, s.section_number]));
  const areaSectionNumbers = {} as Record<PlatformDesignBriefingAreaSlug, number[]>;

  for (const area of areas ?? []) {
    areaSectionNumbers[area.slug as PlatformDesignBriefingAreaSlug] = [];
  }

  for (const link of links ?? []) {
    const area = areas?.find((a) => a.id === link.area_id);
    const sectionNumber = sectionNumberById.get(link.section_id);
    if (!area || sectionNumber == null) continue;
    const slugKey = area.slug as PlatformDesignBriefingAreaSlug;
    if (!areaSectionNumbers[slugKey]) areaSectionNumbers[slugKey] = [];
    areaSectionNumbers[slugKey].push(sectionNumber);
  }

  for (const key of Object.keys(areaSectionNumbers) as PlatformDesignBriefingAreaSlug[]) {
    areaSectionNumbers[key].sort((a, b) => a - b);
  }

  return {
    briefing: briefing as PlatformDesignBriefing,
    sections: sections as PlatformDesignBriefingSection[],
    areas: (areas ?? []) as PlatformDesignBriefingArea[],
    areaSectionNumbers,
  };
}

export async function getPlatformDesignBriefingSection(
  sectionNumber: number,
  slug: string = PLATFORM_DESIGN_BRIEFING_SLUG
): Promise<PlatformDesignBriefingSection | null> {
  const bundle = await getPlatformDesignBriefingBundle(slug);
  return bundle.sections.find((s) => s.section_number === sectionNumber) ?? null;
}

export async function getPlatformDesignBriefingForArea(
  areaSlug: PlatformDesignBriefingAreaSlug,
  slug: string = PLATFORM_DESIGN_BRIEFING_SLUG
): Promise<{
  area: PlatformDesignBriefingArea;
  sections: PlatformDesignBriefingSection[];
}> {
  const bundle = await getPlatformDesignBriefingBundle(slug);
  const area = bundle.areas.find((a) => a.slug === areaSlug);
  if (!area) {
    throw new Error(`Design-Briefing-Bereich nicht gefunden: ${areaSlug}`);
  }
  const numbers = new Set(bundle.areaSectionNumbers[areaSlug] ?? []);
  const sections = bundle.sections.filter((s) => numbers.has(s.section_number));
  return { area, sections };
}

/** Volltext für Agenten / Prompt-Kontext (alle Abschnitte). */
export async function formatPlatformDesignBriefingMarkdown(
  slug: string = PLATFORM_DESIGN_BRIEFING_SLUG
): Promise<string> {
  const { briefing, sections } = await getPlatformDesignBriefingBundle(slug);
  const parts = [
    briefing.preamble_markdown ?? "",
    ...sections.map((s) => `## ${s.section_number}. ${s.title}\n\n${s.content_markdown}`),
  ];
  return parts.filter(Boolean).join("\n\n---\n\n");
}

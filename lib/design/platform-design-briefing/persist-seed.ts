import { PLATFORM_DESIGN_BRIEFING_SEED } from "@/lib/design/platform-design-briefing/seed-data";
import { createAdminClient } from "@/lib/supabase/admin";

/** Idempotentes Upsert des internen Design-Briefings (Service Role). */
export async function persistPlatformDesignBriefingSeed(): Promise<{
  briefingId: string;
  sectionCount: number;
  areaCount: number;
  linkCount: number;
}> {
  const admin = createAdminClient();
  const seed = PLATFORM_DESIGN_BRIEFING_SEED;

  const { data: briefingRow, error: briefingError } = await admin
    .from("platform_design_briefings")
    .upsert(
      {
        slug: seed.slug,
        title: seed.title,
        version: seed.version,
        status: seed.status,
        scope_label: seed.scopeLabel,
        target_audience: seed.targetAudience,
        preamble_markdown: seed.preambleMarkdown,
      },
      { onConflict: "slug" }
    )
    .select("id")
    .single();

  if (briefingError || !briefingRow) {
    throw briefingError ?? new Error("Design-Briefing konnte nicht gespeichert werden.");
  }

  const briefingId = briefingRow.id;

  const sectionRows = seed.sections.map((section) => ({
    briefing_id: briefingId,
    section_number: section.sectionNumber,
    slug: section.slug,
    title: section.title,
    content_markdown: section.contentMarkdown,
    sort_order: section.sectionNumber,
  }));

  const { data: upsertedSections, error: sectionsError } = await admin
    .from("platform_design_briefing_sections")
    .upsert(sectionRows, { onConflict: "briefing_id,section_number" })
    .select("id, section_number");

  if (sectionsError || !upsertedSections) {
    throw sectionsError ?? new Error("Design-Briefing-Abschnitte konnten nicht gespeichert werden.");
  }

  const sectionIdByNumber = new Map(
    upsertedSections.map((row) => [row.section_number, row.id])
  );

  const areaRows = seed.areas.map((area) => ({
    briefing_id: briefingId,
    slug: area.slug,
    title: area.title,
    description: area.description,
    sort_order: area.sortOrder,
  }));

  const { data: upsertedAreas, error: areasError } = await admin
    .from("platform_design_briefing_areas")
    .upsert(areaRows, { onConflict: "briefing_id,slug" })
    .select("id, slug");

  if (areasError || !upsertedAreas) {
    throw areasError ?? new Error("Design-Briefing-Bereiche konnten nicht gespeichert werden.");
  }

  const areaIdBySlug = new Map(upsertedAreas.map((row) => [row.slug, row.id]));
  const areaIds = [...areaIdBySlug.values()];

  if (areaIds.length > 0) {
    const { error: deleteLinksError } = await admin
      .from("platform_design_briefing_area_sections")
      .delete()
      .in("area_id", areaIds);
    if (deleteLinksError) throw deleteLinksError;
  }

  const linkRows: { area_id: string; section_id: string }[] = [];
  for (const area of seed.areas) {
    const areaId = areaIdBySlug.get(area.slug);
    if (!areaId) continue;
    for (const sectionNumber of area.sectionNumbers) {
      const sectionId = sectionIdByNumber.get(sectionNumber);
      if (sectionId) linkRows.push({ area_id: areaId, section_id: sectionId });
    }
  }

  if (linkRows.length > 0) {
    const { error: linkError } = await admin
      .from("platform_design_briefing_area_sections")
      .insert(linkRows);
    if (linkError) throw linkError;
  }

  return {
    briefingId,
    sectionCount: seed.sections.length,
    areaCount: seed.areas.length,
    linkCount: linkRows.length,
  };
}

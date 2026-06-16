"use server";

import { revalidatePath } from "next/cache";

import { persistPlatformDesignBriefingSeed } from "@/lib/design/platform-design-briefing/persist-seed";
import { PLATFORM_DESIGN_BRIEFING_SLUG } from "@/lib/design/platform-design-briefing/types";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

async function requireAuthenticatedDoctor() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false as const, error: "Nicht angemeldet." };
  }

  const { data: member } = await supabase
    .from("workspace_members")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();

  if (member?.role !== "doctor") {
    return { ok: false as const, error: "Nur Praxisinhaber:innen können das Design-Briefing bearbeiten." };
  }

  return { ok: true as const, userId: user.id };
}

export async function seedPlatformDesignBriefingAction() {
  const auth = await requireAuthenticatedDoctor();
  if (!auth.ok) return auth;

  try {
    const result = await persistPlatformDesignBriefingSeed();
    revalidatePath("/settings/design-briefing");
    return { ok: true as const, ...result };
  } catch (error) {
    console.error("[seedPlatformDesignBriefingAction]", error);
    return {
      ok: false as const,
      error: "Design-Briefing konnte nicht in der Datenbank gespeichert werden.",
    };
  }
}

export async function updatePlatformDesignBriefingSectionAction(input: {
  sectionId: string;
  title: string;
  contentMarkdown: string;
}) {
  const auth = await requireAuthenticatedDoctor();
  if (!auth.ok) return auth;

  const title = input.title.trim();
  const contentMarkdown = input.contentMarkdown.trim();
  if (!title || !contentMarkdown) {
    return { ok: false as const, error: "Titel und Inhalt sind erforderlich." };
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("platform_design_briefing_sections")
    .update({ title, content_markdown: contentMarkdown })
    .eq("id", input.sectionId);

  if (error) {
    console.error("[updatePlatformDesignBriefingSectionAction]", error);
    return { ok: false as const, error: "Abschnitt konnte nicht gespeichert werden." };
  }

  revalidatePath("/settings/design-briefing");
  return { ok: true as const };
}

export async function updatePlatformDesignBriefingAreaStatusAction(input: {
  areaId: string;
  implementationStatus: "pending" | "in_progress" | "review" | "done";
  implementationNotes?: string | null;
}) {
  const auth = await requireAuthenticatedDoctor();
  if (!auth.ok) return auth;

  const admin = createAdminClient();
  const { error } = await admin
    .from("platform_design_briefing_areas")
    .update({
      implementation_status: input.implementationStatus,
      implementation_notes: input.implementationNotes?.trim() || null,
    })
    .eq("id", input.areaId);

  if (error) {
    console.error("[updatePlatformDesignBriefingAreaStatusAction]", error);
    return { ok: false as const, error: "Bereichsstatus konnte nicht gespeichert werden." };
  }

  revalidatePath("/settings/design-briefing");
  return { ok: true as const };
}

export async function updatePlatformDesignBriefingPreambleAction(input: {
  preambleMarkdown: string;
}) {
  const auth = await requireAuthenticatedDoctor();
  if (!auth.ok) return auth;

  const admin = createAdminClient();
  const { error } = await admin
    .from("platform_design_briefings")
    .update({ preamble_markdown: input.preambleMarkdown.trim() })
    .eq("slug", PLATFORM_DESIGN_BRIEFING_SLUG);

  if (error) {
    console.error("[updatePlatformDesignBriefingPreambleAction]", error);
    return { ok: false as const, error: "Einleitung konnte nicht gespeichert werden." };
  }

  revalidatePath("/settings/design-briefing");
  return { ok: true as const };
}

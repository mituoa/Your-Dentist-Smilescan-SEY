import "server-only";

import type { User } from "@supabase/supabase-js";

import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Creates a minimal workspace + doctor membership when AUTH_RELAX_MODE is on
 * and the user has none (requires SUPABASE_SERVICE_ROLE_KEY).
 */
export async function ensureRelaxBootstrapWorkspace(user: User): Promise<void> {
  try {
    const admin = createAdminClient();
    const slug = `relax-${user.id.replace(/-/g, "")}`;

    const { data: existing } = await admin
      .from("workspace_members")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (existing) return;

    const { data: ws, error: wErr } = await admin
      .from("workspaces")
      .insert({
        name: "Relax-Modus (Demo)",
        slug,
        approved_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (wErr || !ws?.id) {
      console.error("[ensureRelaxBootstrapWorkspace] workspace insert:", wErr);
      return;
    }

    const { error: mErr } = await admin.from("workspace_members").insert({
      workspace_id: ws.id,
      user_id: user.id,
      role: "doctor",
    });

    if (mErr) {
      console.error("[ensureRelaxBootstrapWorkspace] member insert:", mErr);
    }
  } catch (e) {
    console.error("[ensureRelaxBootstrapWorkspace]", e);
  }
}

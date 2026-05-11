import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

/** Kurze Wartezeit nach Auth-Trigger: Workspace/Membership sichtbar machen (ohne endloses Polling). */
const MEMBERSHIP_MAX_ATTEMPTS = 10;
const MEMBERSHIP_RETRY_MS = 120;

export async function sleep(ms: number): Promise<void> {
  await new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });
}

/**
 * Sammelt Storage-Keys aus dem Registrierungsformular.
 * Nur Keys unter `registrations/licenses/` (kein Path-Traversal).
 */
export function collectRegisterLicenseStoragePaths(
  main: string | null | undefined,
  front: string | null | undefined,
  back: string | null | undefined
): string[] {
  const raw = [main, front, back].map((p) => p?.trim()).filter(Boolean) as string[];
  const safe = raw.filter(
    (p) => p.startsWith("registrations/licenses/") && !p.includes("..") && p.length <= 512
  );
  return [...new Set(safe)];
}

/**
 * Best effort: temporäre Berufsnachweise aus fehlgeschlagenem/abgebrochenem Signup entfernen.
 * Vollständiger TTL-/Batch-Cleanup: separater Job (s. Kommentar in register-license-upload).
 */
export async function removePendingLicenseUploads(
  admin: SupabaseClient,
  paths: string[]
): Promise<void> {
  if (paths.length === 0) return;
  try {
    const { error } = await admin.storage.from("submission-photos").remove(paths);
    if (error) {
      console.error("[removePendingLicenseUploads]", error);
    }
  } catch (e) {
    console.error("[removePendingLicenseUploads] exception", e);
  }
}

/**
 * Liest workspace_id für den neuen User mit begrenztem Retry (Trigger/Replikation).
 * Nutzt limit(1), damit kein PGRST116 bei mehreren Zeilen (Edge-Fall) den Flow bricht.
 */
export async function waitForWorkspaceMembership(
  admin: SupabaseClient,
  userId: string
): Promise<{ workspace_id: string } | null> {
  for (let attempt = 0; attempt < MEMBERSHIP_MAX_ATTEMPTS; attempt++) {
    const { data, error } = await admin
      .from("workspace_members")
      .select("workspace_id")
      .eq("user_id", userId)
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("[waitForWorkspaceMembership] query error", error);
    }
    const wid = data?.workspace_id;
    if (typeof wid === "string" && wid.length > 0) {
      return { workspace_id: wid };
    }
    if (attempt < MEMBERSHIP_MAX_ATTEMPTS - 1) {
      await sleep(MEMBERSHIP_RETRY_MS);
    }
  }
  return null;
}

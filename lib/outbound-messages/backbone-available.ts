import "server-only";

import { cache } from "react";

import { createAdminClient } from "@/lib/supabase/admin";
import { isLikelyMissingDbRelationError } from "@/lib/supabase/postgrest-errors";

export const TRACKER_BACKBONE_MIGRATION_HINT =
  "Migration 038 (Tracker-Kommunikation) ist auf dieser Datenbank noch nicht angewendet. Patienten-E-Mails können erst danach versendet werden.";

/** Prüft, ob `outbound_messages` und Backbone-Spalten in der DB existieren. */
export const isTrackerBackboneAvailable = cache(async (): Promise<boolean> => {
  const admin = createAdminClient();
  const { error: tableError } = await admin.from("outbound_messages").select("id").limit(1);
  if (!tableError) return true;
  if (isLikelyMissingDbRelationError(tableError)) return false;

  const { error: columnError } = await admin
    .from("submissions")
    .select("practice_status")
    .limit(1);
  if (!columnError) return true;
  if (isLikelyMissingDbRelationError(columnError)) return false;

  return false;
});

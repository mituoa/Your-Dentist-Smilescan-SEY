import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

/** Strict prefix for register-flow pending Berufsnachweise (Bucket `submission-photos`). */
export const REGISTER_PENDING_LICENSE_FOLDER = "registrations/licenses/pending";

function fullObjectPath(name: string): string {
  return `${REGISTER_PENDING_LICENSE_FOLDER}/${name}`;
}

function isSafePendingObjectName(name: string): boolean {
  if (!name || name.includes("/") || name.includes("..")) return false;
  if (name.length > 400) return false;
  return /^[a-zA-Z0-9._-]+$/.test(name);
}

async function loadReferencedPendingPaths(admin: SupabaseClient): Promise<Set<string>> {
  const referenced = new Set<string>();
  const { data: rows, error } = await admin
    .from("workspace_contracts")
    .select("dentist_license_storage_path, dentist_license_storage_path_front, dentist_license_storage_path_back");

  if (error) {
    console.error("[register-license-pending-cleanup] contracts select", error.message);
    return referenced;
  }

  for (const r of rows ?? []) {
    for (const k of [
      r.dentist_license_storage_path,
      r.dentist_license_storage_path_front,
      r.dentist_license_storage_path_back,
    ]) {
      if (typeof k === "string" && k.startsWith(`${REGISTER_PENDING_LICENSE_FOLDER}/`)) {
        referenced.add(k.trim());
      }
    }
  }
  return referenced;
}

export type PendingLicenseCleanupResult = {
  scanned: number;
  deleted: number;
  skippedReferenced: number;
  skippedTooNew: number;
  skippedInvalidName: number;
  skippedNoTimestamp: number;
};

/**
 * Löscht abgelaufene Objekte unter `registrations/licenses/pending/` (TTL),
 * die in keiner `workspace_contracts`-Zeile referenziert sind.
 * Nur serverseitig mit Service-Role + Geheimnis aufrufen.
 */
export async function cleanupExpiredPendingRegisterLicenseObjects(opts: {
  admin: SupabaseClient;
  maxAgeMs: number;
  maxDeletesPerRun: number;
}): Promise<PendingLicenseCleanupResult> {
  const { admin, maxAgeMs, maxDeletesPerRun } = opts;
  const referenced = await loadReferencedPendingPaths(admin);
  const now = Date.now();

  let scanned = 0;
  let deleted = 0;
  let skippedReferenced = 0;
  let skippedTooNew = 0;
  let skippedInvalidName = 0;
  let skippedNoTimestamp = 0;

  const pageSize = 500;
  let offset = 0;

  while (deleted < maxDeletesPerRun) {
    const { data: batch, error: listErr } = await admin.storage
      .from("submission-photos")
      .list(REGISTER_PENDING_LICENSE_FOLDER, {
        limit: pageSize,
        offset,
      });

    if (listErr) {
      console.error("[register-license-pending-cleanup] storage list", listErr.message);
      break;
    }
    if (!batch || batch.length === 0) break;

    const toRemove: string[] = [];

    for (const item of batch) {
      if (deleted + toRemove.length >= maxDeletesPerRun) break;

      scanned++;
      const name = item.name;
      if (!isSafePendingObjectName(name)) {
        skippedInvalidName++;
        continue;
      }
      const path = fullObjectPath(name);
      if (referenced.has(path)) {
        skippedReferenced++;
        continue;
      }

      const tsRaw = (item as { created_at?: string; updated_at?: string }).created_at
        ?? (item as { updated_at?: string }).updated_at;
      if (!tsRaw) {
        skippedNoTimestamp++;
        continue;
      }
      const t = new Date(tsRaw).getTime();
      if (Number.isNaN(t) || now - t < maxAgeMs) {
        skippedTooNew++;
        continue;
      }

      toRemove.push(path);
    }

    if (toRemove.length > 0) {
      const { error: rmErr } = await admin.storage.from("submission-photos").remove(toRemove);
      if (rmErr) {
        console.error("[register-license-pending-cleanup] storage remove", rmErr.message);
      } else {
        deleted += toRemove.length;
      }
    }

    if (batch.length < pageSize) break;
    offset += pageSize;
  }

  return {
    scanned,
    deleted,
    skippedReferenced,
    skippedTooNew,
    skippedInvalidName,
    skippedNoTimestamp,
  };
}

export function getRegisterLicensePendingTtlMs(): number {
  const raw = process.env.REGISTER_LICENSE_PENDING_TTL_HOURS?.trim();
  const hours = raw ? Number.parseFloat(raw) : 72;
  const safe = Number.isFinite(hours) && hours >= 6 && hours <= 720 ? hours : 72;
  return Math.floor(safe * 3600 * 1000);
}

export function getRegisterLicenseCleanupSecret(): string | null {
  const a = process.env.REGISTER_LICENSE_PENDING_CLEANUP_SECRET?.trim();
  const b = process.env.CRON_SECRET?.trim();
  return a || b || null;
}

export function getRegisterLicenseCleanupMaxDeletes(): number {
  const raw = process.env.REGISTER_LICENSE_CLEANUP_MAX_DELETES?.trim();
  const n = raw ? Number.parseInt(raw, 10) : 500;
  if (!Number.isFinite(n)) return 500;
  return Math.min(Math.max(n, 1), 2000);
}

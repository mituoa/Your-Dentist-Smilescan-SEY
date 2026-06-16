/**
 * Seed des internen Design-Briefings in Supabase.
 * Voraussetzung: Migration 044 + SUPABASE_SERVICE_ROLE_KEY in .env.local
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { persistPlatformDesignBriefingSeed } from "@/lib/design/platform-design-briefing/persist-seed";

function loadEnvLocal() {
  try {
    const raw = readFileSync(resolve(process.cwd(), ".env.local"), "utf8");
    for (const line of raw.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      let value = trimmed.slice(eq + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = value;
    }
  } catch {
    // optional
  }
}

loadEnvLocal();

async function main() {
  const result = await persistPlatformDesignBriefingSeed();
  console.log(
    `Design-Briefing gespeichert (${result.briefingId}): ${result.sectionCount} Abschnitte, ${result.areaCount} Bereiche, ${result.linkCount} Zuordnungen.`
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

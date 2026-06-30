import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

function loadEnvLocal() {
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
}

loadEnvLocal();

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const workspaceId = "a41f618c-30ba-4280-ba07-9a81d065d481";
const objectPath = `${workspaceId}/${Date.now()}-smoke.json`;
const payload = {
  workspace_id: workspaceId,
  solution_id: "aligner",
  solution_title: "Aligner",
  practice_name: "Carree Dental",
  contact_name: "Smoke Test",
  email: "smoke@example.com",
  message: "Storage fallback smoke test",
  status: "received",
  storage_fallback: true,
};

const { error } = await admin.storage
  .from("platform-practice-solution-requests")
  .upload(objectPath, JSON.stringify(payload, null, 2), {
    contentType: "application/json",
    upsert: false,
  });

console.log(error ? { ok: false, message: error.message } : { ok: true, objectPath });

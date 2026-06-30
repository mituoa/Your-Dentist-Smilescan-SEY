import { readFileSync } from "node:fs";
import { resolve } from "node:path";

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

const projectRef = process.env.NEXT_PUBLIC_SUPABASE_URL?.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
const accessToken = process.env.SUPABASE_ACCESS_TOKEN;
const dbPassword = process.env.SUPABASE_DB_PASSWORD || process.env.DATABASE_PASSWORD;

if (!projectRef) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL");
  process.exit(1);
}

const sql = readFileSync(
  resolve(process.cwd(), "supabase/migrations/046_platform_practice_solution_requests.sql"),
  "utf8"
);

if (accessToken) {
  const res = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query: sql }),
  });
  const body = await res.text();
  if (!res.ok) {
    console.error("Management API failed:", res.status, body);
    process.exit(1);
  }
  console.log("Migration applied via Management API");
  process.exit(0);
}

if (dbPassword) {
  const { default: postgres } = await import("postgres");
  const sqlClient = postgres({
    host: `db.${projectRef}.supabase.co`,
    port: 5432,
    database: "postgres",
    username: "postgres",
    password: dbPassword,
    ssl: "require",
    max: 1,
  });
  await sqlClient.unsafe(sql);
  await sqlClient.end();
  console.log("Migration applied via direct Postgres");
  process.exit(0);
}

console.error(
  "Need SUPABASE_ACCESS_TOKEN or SUPABASE_DB_PASSWORD in environment to apply migration."
);
process.exit(1);

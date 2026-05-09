import { createClient } from "@supabase/supabase-js";

import { assertValidHttpUrlForSupabase, normalizePublicEnvUrl } from "@/lib/env-url";

export function createAdminClient() {
  const url = normalizePublicEnvUrl(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const serviceKey = normalizePublicEnvUrl(process.env.SUPABASE_SERVICE_ROLE_KEY);
  if (!url || !serviceKey) {
    const msg =
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY (admin client; set in Netlify → Environment variables).";
    console.error("[supabase/admin]", msg);
    throw new Error(msg);
  }
  assertValidHttpUrlForSupabase(url);

  return createClient(
    url,
    serviceKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}

import { createBrowserClient } from "@supabase/ssr";

import { normalizePublicEnvUrl } from "@/lib/env-url";

export function createClient() {
  return createBrowserClient(
    normalizePublicEnvUrl(process.env.NEXT_PUBLIC_SUPABASE_URL),
    normalizePublicEnvUrl(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  );
}

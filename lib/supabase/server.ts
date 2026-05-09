import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import { assertValidHttpUrlForSupabase, normalizePublicEnvUrl } from "@/lib/env-url";

function getSupabasePublicEnv(): { url: string; anonKey: string } {
  const url = normalizePublicEnvUrl(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const anonKey = normalizePublicEnvUrl(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  if (!url || !anonKey) {
    const msg =
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY (set them in Netlify → Environment variables).";
    console.error("[supabase/server]", msg);
    throw new Error(msg);
  }
  assertValidHttpUrlForSupabase(url);
  return { url, anonKey };
}

export async function createClient() {
  const cookieStore = await cookies();
  const { url, anonKey } = getSupabasePublicEnv();

  return createServerClient(
    url,
    anonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server Components können keine Cookies setzen, das ist ok
          }
        },
      },
    }
  );
}

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { sanitizeReturnTo } from "@/lib/auth/sanitize-return-to";
import { getAppBaseUrl } from "@/lib/env";
import { assertValidHttpUrlForSupabase, normalizePublicEnvUrl } from "@/lib/env-url";

function getSupabasePublicEnv(): { url: string; anonKey: string } | null {
  const url = normalizePublicEnvUrl(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const anonKey = normalizePublicEnvUrl(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  if (!url || !anonKey) {
    console.error("[api/auth/sign-out] Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
    return null;
  }
  try {
    assertValidHttpUrlForSupabase(url);
  } catch (e) {
    console.error("[api/auth/sign-out] Invalid Supabase URL", e);
    return null;
  }
  return { url, anonKey };
}

/**
 * Zuverlässiger Logout per klassischem POST + 303:
 * Session-Cookies werden auf derselben `NextResponse` gesetzt, die zur Login-Seite weiterleitet
 * (vermeidet „This page couldn’t load“ / brüchige Server-Action-Redirect-Ketten auf Netlify/Safari).
 */
export async function POST(request: Request) {
  const base = getAppBaseUrl().replace(/\/$/, "");

  let returnTo: string | null = null;
  try {
    const fd = await request.formData();
    const raw = fd.get("return_to");
    returnTo = sanitizeReturnTo(typeof raw === "string" ? raw : null);
  } catch {
    /* empty or invalid body */
  }

  const targetPath =
    returnTo && returnTo.startsWith("/accept-invite") ? returnTo : "/login?signed_out=1";

  const redirectResponse = NextResponse.redirect(new URL(targetPath, base), { status: 303 });

  const env = getSupabasePublicEnv();
  if (!env) {
    return redirectResponse;
  }

  const cookieStore = await cookies();
  const supabase = createServerClient(env.url, env.anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          redirectResponse.cookies.set(name, value, options);
        });
      },
    },
  });

  try {
    await supabase.auth.signOut({ scope: "global" });
  } catch {
    console.error("[api/auth/sign-out] event=sign_out_failed");
  }

  return redirectResponse;
}

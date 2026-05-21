import { NextResponse } from "next/server";

import { sanitizeAuthNextPath } from "@/lib/auth/sanitize-auth-next";
import { pathWithWorkspaceEnter } from "@/lib/design/yd-workspace-awakening";
import { RETURNING_PRACTICE_COOKIE } from "@/lib/public-entry/returning-visitor";
import { createRouteHandlerClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = sanitizeAuthNextPath(searchParams.get("next"), "/dashboard");

  const oauthError = searchParams.get("error");
  if (oauthError) {
    const desc = searchParams.get("error_description") ?? oauthError;
    console.warn("[auth/callback] oauth_error", oauthError, desc);
    if (/access_denied|user_cancelled|consent_required/i.test(oauthError)) {
      return NextResponse.redirect(`${origin}/login`);
    }
    return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
  }

  try {
    if (code) {
      const supabase = await createRouteHandlerClient();
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) {
        const res = NextResponse.redirect(`${origin}${pathWithWorkspaceEnter(next)}`);
        res.cookies.set(RETURNING_PRACTICE_COOKIE, "1", {
          maxAge: 60 * 60 * 24 * 365,
          httpOnly: true,
          sameSite: "lax",
          path: "/",
          secure: process.env.NODE_ENV === "production",
        });
        return res;
      }
      console.error("[auth/callback] exchangeCodeForSession", error.message);
    }
  } catch (e) {
    console.error("[auth/callback]", e instanceof Error ? e.message : "unexpected");
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}

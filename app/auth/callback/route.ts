import { createRouteHandlerClient } from "@/lib/supabase/server";
import { sanitizeAuthNextPath } from "@/lib/auth/sanitize-auth-next";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = sanitizeAuthNextPath(searchParams.get("next"), "/dashboard");

  try {
    if (code) {
      const supabase = await createRouteHandlerClient();
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) {
        return NextResponse.redirect(`${origin}${next}`);
      }
      console.error("[auth/callback] exchangeCodeForSession", error.message);
    }
  } catch (e) {
    console.error("[auth/callback]", e instanceof Error ? e.message : "unexpected");
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}

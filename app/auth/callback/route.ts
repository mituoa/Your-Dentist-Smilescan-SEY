import { createClient } from "@/lib/supabase/server";
import { sanitizeAuthNextPath } from "@/lib/auth/sanitize-auth-next";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = sanitizeAuthNextPath(searchParams.get("next"), "/dashboard");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
    console.error("[auth/callback] exchangeCodeForSession", error.message);
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}

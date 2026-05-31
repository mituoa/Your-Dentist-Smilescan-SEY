import { resolveMiddlewareAuthenticatedHomeUrl } from "@/lib/auth-app-home";
import { isBlockingAuthError } from "@/lib/auth-blocking-errors";
import { isAuthRelaxMode } from "@/lib/auth-relax-mode";
import { normalizePublicEnvUrl } from "@/lib/env-url";
import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

function isUsableSupabaseHttpUrl(raw: string): boolean {
  const url = normalizePublicEnvUrl(raw);
  if (!url || !url.startsWith("https://")) return false;
  try {
    const u = new URL(url);
    return Boolean(u.host) && (u.protocol === "https:" || u.protocol === "http:");
  } catch {
    return false;
  }
}

// Routen, die einen Login erfordern
const PROTECTED_PATHS = [
  "/dashboard",
  "/inbox",
  "/profile",
  "/journal",
  "/journals",
  "/settings",
  "/admin",
  "/my-tasks",
  "/relay",
  "/create-case",
];

// Routen, die NICHT für eingeloggte User sichtbar sind (redirect zu App-Home)
const AUTH_PATHS = ["/login", "/register"];

export async function proxy(request: NextRequest) {
  const supabaseUrl = normalizePublicEnvUrl(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const supabaseKey = normalizePublicEnvUrl(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  if (!supabaseUrl || !supabaseKey || !isUsableSupabaseHttpUrl(supabaseUrl)) {
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

  try {
    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const pathname = request.nextUrl.pathname;

    // Wenn nicht eingeloggt und auf geschützter Route → /login
    if (!user && PROTECTED_PATHS.some((p) => pathname.startsWith(p))) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }

    // Wenn eingeloggt und auf Auth-Route → rollenkorrektes App-Home (außer blockierende Fehler: sonst Redirect-Schleife)
    if (user && AUTH_PATHS.some((p) => pathname.startsWith(p))) {
      const authError = request.nextUrl.searchParams.get("error");
      if (authError && isBlockingAuthError(authError) && !isAuthRelaxMode()) {
        return supabaseResponse;
      }
      // Nach Registrierung: Wartezustand auf /register, nicht sofort ins Dashboard.
      if (
        pathname.startsWith("/register") &&
        request.nextUrl.searchParams.get("success") === "1"
      ) {
        return supabaseResponse;
      }
      // Login page sends invite holders to /accept-invite; do not bounce to dashboard first.
      if (
        pathname.startsWith("/login") &&
        request.nextUrl.searchParams.get("invite")?.trim()
      ) {
        return supabaseResponse;
      }
      const nextPath = await resolveMiddlewareAuthenticatedHomeUrl(supabase, user);
      return NextResponse.redirect(new URL(nextPath, request.nextUrl.origin));
    }
  } catch {
    console.error("[proxy] event=auth_check_failed");
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

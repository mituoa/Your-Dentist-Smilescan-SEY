import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

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

// Routen, die NICHT für eingeloggte User sichtbar sind (redirect zu dashboard)
const AUTH_PATHS = ["/login", "/register"];

/** Must stay aligned with `app/(auth)/login/page.tsx` — show message instead of bouncing to /dashboard */
const BLOCKING_AUTH_ERRORS = new Set([
  "workspace_missing",
  "account_pending_approval",
  "email_not_confirmed",
]);

export async function proxy(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey || !supabaseUrl.startsWith("https://")) {
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

    // Wenn eingeloggt und auf Auth-Route → /dashboard (außer blockierende Fehler: sonst Redirect-Schleife)
    if (user && AUTH_PATHS.some((p) => pathname.startsWith(p))) {
      const authError = request.nextUrl.searchParams.get("error");
      if (authError && BLOCKING_AUTH_ERRORS.has(authError)) {
        return supabaseResponse;
      }
      // Login page sends invite holders to /accept-invite; do not bounce to dashboard first.
      if (
        pathname.startsWith("/login") &&
        request.nextUrl.searchParams.get("invite")?.trim()
      ) {
        return supabaseResponse;
      }
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }
  } catch (error) {
    console.error("[proxy] Auth check failed:", error);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

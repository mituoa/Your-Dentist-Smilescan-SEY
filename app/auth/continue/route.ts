import { NextResponse } from "next/server";

import { sanitizeResolvedEntryRedirectPath } from "@/lib/auth/sanitize-auth-next";
import { resolveAuthenticatedEntryPathForRouteHandler } from "@/lib/post-auth-entry";

/** Kein Caching — Entry hängt an Session/DB; immer frisch auflösen. */
export const dynamic = "force-dynamic";

/** Redirect ohne zwischengespeicherte Zwischenantwort (CDN/Browser, geteilte Mobile-Proxies). */
function redirectNoStore(destination: URL) {
  const res = NextResponse.redirect(destination);
  res.headers.set("Cache-Control", "no-store, private");
  res.headers.set("Pragma", "no-cache");
  res.headers.set("Vary", "Cookie");
  return res;
}

/**
 * MVP-/Pilot-OAuth-Hop: unsichtbare Infrastruktur — kein UI, keine Marketing-Logik.
 *
 * Ablauf: Session über Route-Handler-Client auswerten → Entry-Pfad wie Passwort-Login
 * (`resolveAuthenticatedEntryPathForRouteHandler`) → `sanitizeResolvedEntryRedirectPath`
 * (Allowlist, Open-Redirect-Schutz) → Redirect mit `no-store` / `Vary: Cookie`.
 *
 * Bewusst nicht: Onboarding-Wizard, SSO/MFA/Passkeys, Audit-UI, freie Redirect-Parameter.
 *
 * ---
 * Punkt 12 — Einordnung (Route nicht aufblasen):
 *
 * **Nice (später, meist außerhalb dieser Datei):** E2E für Resolver+Sanitizer-Kette; Smoke in Prod;
 * strukturierte Auth-Events / Metriken auf Plattform-Ebene; interne Runbook-Zeile zum OAuth-Callback.
 *
 * **Future (app-/infra-weit):** SSO/SAML, Passkeys, MFA, Audit-/SIEM-Pipeline, feinere Rollen,
 * explizite „Primary Workspace“-Policy falls Multi-Membership produktrelevant wird.
 *
 * **Non-MVP (hier nicht einbauen):** Zwischenseite/Spinner, erklärende Security-UI, Marketing-Query-Params,
 * freie Redirect-Ziele, Provider-spezifische Sonderpfade, Session-Refresh-Architektur umdefinieren.
 *
 * ---
 * Punkt 13 — Priorität (Auth-Vertrauen, korrekter Post-Login-Einstieg):
 *
 * **Produktrolle:** kritischer, aber schmaler Pfad — OAuth-Nutzer landen hier direkt nach Callback.
 * **Regression = P0:** falscher Einstieg (Team/Doctor/Invite), Open Redirect, Session/Cookies nach Hop kaputt,
 * Sanitizer/Resolver auseinanderdriften, Header weg → Auth-Vertrauen / Medical-Enterprise-Glaubwürdigkeit leiden.
 * **Tägliche Priorität:** eher **P1 „stabil halten“** — kein Feature-Bedarf; nur bei Änderungen an
 * Supabase-SSR, Callback, `post-auth-entry`, Sanitizer oder Cookie-Politik **mitziehen**.
 *
 * **Vor Pilot/Demo (manuell):** OAuth → Continue → `/dashboard` (Doctor), `/my-tasks` (Team),
 * `/accept-invite` (Pending Invite), `/login?error=workspace_missing` (ohne Workspace/Invite), plus Reload auf Continue.
 *
 * **Nicht mehr priorisiert:** Weiterpolieren ohne Anlass; neue Produktlogik in dieser Datei.
 *
 * **QA / Monitoring / Doku:** Fehlerquoten optional systemweit; Runbook-Referenz zu Callback + Allowlist;
 * keine Pflicht für weitere Codezeilen an dieser Route.
 */
export async function GET(request: Request) {
  const origin = new URL(request.url).origin;

  try {
    const path = await resolveAuthenticatedEntryPathForRouteHandler();
    const safe = sanitizeResolvedEntryRedirectPath(path);
    return redirectNoStore(new URL(safe, origin));
  } catch (e) {
    console.error("[auth/continue] event=handler_failure", e instanceof Error ? e.name : "unknown");
    return redirectNoStore(new URL("/login", origin));
  }
}

import type { SupabaseClient, User } from "@supabase/supabase-js";

import { ensureRelaxBootstrapWorkspace } from "@/lib/auth-relax-bootstrap";
import { isAuthRelaxMode } from "@/lib/auth-relax-mode";
import { getWorkspaceMembershipForUserId } from "@/lib/auth-helpers";
import { workspaceRoleToHomePath } from "@/lib/auth-app-home";
import { createClient, createRouteHandlerClient } from "@/lib/supabase/server";
import { findPendingInviteTokenByEmail } from "@/lib/team-invitations/find-pending-invite-token-by-email";

/**
 * Post-authentication entry resolution (MVP / pilot contract).
 *
 * Intentional destinations — not a generic “always dashboard”:
 * - Workspace member → role home: `doctor` → `/dashboard`, `team` → `/my-tasks`
 *   (oldest membership wins if multiple rows; see `getWorkspaceMembershipForUserId` ordering).
 * - No workspace + pending invite → `/accept-invite?token=…` (64-hex token from server).
 * - No workspace + no invite → `/login?error=workspace_missing` (blocking; calm copy on login UI).
 * - No session / auth failure → `/login` (no query).
 *
 * Out of scope here (app-wide / later product): onboarding wizards, SSO/MFA/passkeys, audit UI,
 * extra roles, marketing redirects. Route handlers that redirect should run results through
 * `sanitizeResolvedEntryRedirectPath` (see `GET /auth/continue`).
 */

/**
 * Where to send an authenticated user after login/password reset:
 * explicit invite flows stay separate; here we resolve workspace vs pending invite vs default home.
 * Matches `requireApprovedWorkspace`: relax bootstrap runs before invite/workspace_missing.
 */
async function resolveAuthenticatedEntryWithSupabase(
  supabase: SupabaseClient,
  user: User | null
): Promise<string> {
  if (!user?.email?.trim()) {
    return "/login";
  }

  let workspace = await getWorkspaceMembershipForUserId(user.id, supabase);
  if (!workspace && isAuthRelaxMode()) {
    await ensureRelaxBootstrapWorkspace(user);
    workspace = await getWorkspaceMembershipForUserId(user.id, supabase);
  }

  if (workspace) {
    return workspaceRoleToHomePath(workspace.role);
  }

  const token = await findPendingInviteTokenByEmail(user.email);
  if (token) {
    return `/accept-invite?token=${encodeURIComponent(token)}`;
  }

  return "/login?error=workspace_missing";
}

export async function resolveAuthenticatedEntryPath(): Promise<string> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error) {
      console.error("[resolveAuthenticatedEntryPath] event=get_user_failed");
      return "/login";
    }
    return await resolveAuthenticatedEntryWithSupabase(supabase, user);
  } catch {
    console.error("[resolveAuthenticatedEntryPath] event=unexpected_failure");
    return "/login";
  }
}

/**
 * Gleiche Entry-Policy wie {@link resolveAuthenticatedEntryPath}, aber mit
 * {@link createRouteHandlerClient}: nach OAuth dieselbe Cookie-Schreib-Policy wie `/auth/callback`
 * (Refresh/Session-Updates können Cookies zuverlässig persistieren).
 *
 * Nur aus Route Handlern aufrufen (z. B. `GET /auth/continue`). Der Handler wendet danach
 * {@link sanitizeResolvedEntryRedirectPath} an (Defense-in-depth vs. Resolver-Regressionen).
 */
export async function resolveAuthenticatedEntryPathForRouteHandler(): Promise<string> {
  try {
    const supabase = await createRouteHandlerClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error) {
      console.error("[resolveAuthenticatedEntryPathForRouteHandler] event=get_user_failed");
      return "/login";
    }
    return await resolveAuthenticatedEntryWithSupabase(supabase, user);
  } catch {
    console.error("[resolveAuthenticatedEntryPathForRouteHandler] event=unexpected_failure");
    return "/login";
  }
}

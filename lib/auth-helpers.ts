import { cache } from "react";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import {
  getAdminEmailsAllowlist,
  getAdminGithubUsernames,
} from "@/lib/env";
import { ensureRelaxBootstrapWorkspace } from "@/lib/auth-relax-bootstrap";
import { isAuthRelaxMode } from "@/lib/auth-relax-mode";
import {
  requireEmailConfirmationBeforeApp,
  requireWorkspaceApprovalBeforeApp,
} from "@/lib/launch-guards";
import { redirect } from "next/navigation";

/** Ops-Freigabe: E-Mail (`ADMIN_EMAILS`) oder GitHub-Login (`ADMIN_GITHUB_USERNAMES`). */
export function isAdminAllowlistUser(user: User | null | undefined): boolean {
  if (!user) return false;

  const emails = getAdminEmailsAllowlist();
  const email = (user.email || "").trim().toLowerCase();
  if (email && emails.length > 0 && emails.includes(email)) return true;

  const ghAllow = getAdminGithubUsernames();
  if (ghAllow.length === 0) return false;

  const meta = user.user_metadata as Record<string, unknown> | undefined;
  const fromMeta = [
    meta?.user_name,
    meta?.preferred_username,
    meta?.nickname,
    meta?.user_login,
  ]
    .filter((v): v is string => typeof v === "string" && v.trim() !== "")
    .map((s) => s.trim().toLowerCase());

  const fromIdentities: string[] = [];
  if (Array.isArray(user.identities)) {
    for (const id of user.identities) {
      if (id?.provider !== "github" || !id.identity_data) continue;
      const d = id.identity_data as Record<string, unknown>;
      for (const key of ["user_name", "nickname", "preferred_username"]) {
        const v = d[key];
        if (typeof v === "string" && v.trim())
          fromIdentities.push(v.trim().toLowerCase());
      }
    }
  }

  const candidates = [...new Set([...fromMeta, ...fromIdentities])];
  return candidates.some((c) => ghAllow.includes(c));
}

export const getCurrentUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  if (!user.email_confirmed_at && !isAuthRelaxMode() && requireEmailConfirmationBeforeApp()) {
    const p = new URLSearchParams();
    p.set("error", "email_not_confirmed");
    if (user.email) p.set("email", user.email);
    redirect(`/login?${p.toString()}`);
  }
  return user;
}

/**
 * Workspace-Zeile für eine bekannte User-ID (eine PostgREST-Runde, kein zweites getUser).
 * Für Root-Redirect und `getCurrentWorkspace` gemeinsam genutzt.
 * Optional `client`: gleiche Supabase-Instanz wie `getUser()` (z. B. Route-Handler-Client nach OAuth).
 *
 * **Pilot / MVP (Multi-Workspace):** Es gibt **kein** Workspace-Switching. Gibt es mehrere
 * `workspace_members`-Zeilen für dieselbe User-ID, gilt die **älteste** Mitgliedschaft
 * (`order("created_at", { ascending: true }).limit(1)`) als aktiver Kontext — dieselbe Regel wie
 * `resolveAuthenticatedEntryPath` / `resolveMiddlewareAuthenticatedHomeUrl`. `/dashboard`, Posteingang,
 * Aufgaben und Einstellungen lesen alle denselben `workspace_id` daraus; es gibt keinen stillen
 * Wechsel zwischen Routen.
 *
 * **Supabase RLS:** `current_workspace_id()` in Postgres folgt derselben Reihenfolge (Migration
 * `030_align_current_workspace_id_with_app.sql`).
 */
export const getWorkspaceMembershipForUserId = cache(
  async (userId: string, client?: SupabaseClient) => {
  const supabase = client ?? (await createClient());
  const { data, error } = await supabase
    .from("workspace_members")
    .select("workspace_id, role, workspaces(id, name, slug, approved_at)")
    .eq("user_id", userId)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) {
    const code =
      typeof error.code === "string" && error.code.trim() !== ""
        ? error.code
        : "unknown";
    const message = typeof error.message === "string" ? error.message : "";
    console.error(`[getWorkspaceMembershipForUserId] code=${code}`, message || undefined);
    return null;
  }

  return data;
  }
);

/**
 * Aktueller Workspace-Kontext für geschützte App-Routen (inkl. `/dashboard`).
 * Siehe {@link getWorkspaceMembershipForUserId} zur Pilot-Regel bei mehreren Mitgliedschaften.
 *
 * Not wrapped in `react/cache`: `requireApprovedWorkspace` may call
 * `ensureRelaxBootstrapWorkspace` and then must see a fresh row — caching
 * would return stale `null` and break the protected app shell.
 */
export async function getCurrentWorkspace() {
  const user = await getCurrentUser();
  if (!user) return null;
  return getWorkspaceMembershipForUserId(user.id);
}

export async function requireApprovedWorkspace() {
  const user = await getCurrentUser();
  if (!user) return null;

  let workspace = await getCurrentWorkspace();

  if (!workspace && isAuthRelaxMode()) {
    await ensureRelaxBootstrapWorkspace(user);
    workspace = await getCurrentWorkspace();
  }

  if (!workspace) return null;
  // @ts-expect-error - workspaces is joined
  const approvedAt = workspace?.workspaces?.approved_at as string | null | undefined;
  if (requireWorkspaceApprovalBeforeApp() && !approvedAt) {
    if (!(isAuthRelaxMode() || isAdminAllowlistUser(user))) {
      redirect("/login?error=account_pending_approval");
    }
  }
  return workspace;
}

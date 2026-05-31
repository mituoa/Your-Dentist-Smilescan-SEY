import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";

import { workspaceRoleToHomePath } from "@/lib/auth-app-home";
import {
  getWorkspaceMembershipForUserId,
  isAdminAllowlistUser,
} from "@/lib/auth-helpers";
import { ensureRelaxBootstrapWorkspace } from "@/lib/auth-relax-bootstrap";
import { isAuthRelaxMode } from "@/lib/auth-relax-mode";
import { requireEmailConfirmationBeforeApp, requireWorkspaceApprovalBeforeApp } from "@/lib/launch-guards";
import { findPendingInviteTokenByEmail } from "@/lib/team-invitations/find-pending-invite-token-by-email";

/**
 * Eingeloggte Nutzer mit gültigem Workspace — Link fürs Dashboard, kein Auto-Redirect von "/".
 * Blockierende Zustände (E-Mail, Invite, Freigabe) redirecten weiterhin zu Login/Invite.
 */
export async function resolveHomeDashboardHref(user: User): Promise<string | null> {
  if (!user.email_confirmed_at && !isAuthRelaxMode() && requireEmailConfirmationBeforeApp()) {
    const p = new URLSearchParams();
    p.set("error", "email_not_confirmed");
    if (user.email) p.set("email", user.email);
    redirect(`/login?${p.toString()}`);
  }

  let workspace = await getWorkspaceMembershipForUserId(user.id);

  if (!workspace && isAuthRelaxMode()) {
    await ensureRelaxBootstrapWorkspace(user);
    workspace = await getWorkspaceMembershipForUserId(user.id);
  }

  if (!workspace) {
    const email = user.email?.trim();
    if (email) {
      try {
        const token = await findPendingInviteTokenByEmail(email);
        if (token) {
          redirect(`/accept-invite?token=${encodeURIComponent(token)}`);
        }
      } catch (e) {
        console.error("[resolveHomeDashboardHref] invite lookup failed:", e);
      }
    }
    redirect("/login?error=workspace_missing");
  }

  // @ts-expect-error — joined workspaces row
  const approvedAt = workspace.workspaces?.approved_at as string | null | undefined;
  if (
    requireWorkspaceApprovalBeforeApp() &&
    !approvedAt &&
    !(isAuthRelaxMode() || isAdminAllowlistUser(user))
  ) {
    redirect("/login?error=account_pending_approval");
  }

  return workspaceRoleToHomePath(workspace.role as string | null | undefined);
}

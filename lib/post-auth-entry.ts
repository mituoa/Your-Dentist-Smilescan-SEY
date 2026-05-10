import { getCurrentUser, getCurrentWorkspace } from "@/lib/auth-helpers";
import { workspaceRoleToHomePath } from "@/lib/auth-app-home";
import { findPendingInviteTokenByEmail } from "@/lib/team-invitations/find-pending-invite-token-by-email";

/**
 * Where to send an authenticated user after login/password reset:
 * explicit invite flows stay separate; here we resolve workspace vs pending invite vs default home.
 */
export async function resolveAuthenticatedEntryPath(): Promise<string> {
  try {
    const user = await getCurrentUser();
    if (!user?.email?.trim()) {
      return "/login";
    }

    const workspace = await getCurrentWorkspace();
    if (workspace) {
      return workspaceRoleToHomePath(workspace.role);
    }

    const token = await findPendingInviteTokenByEmail(user.email);
    if (token) {
      return `/accept-invite?token=${encodeURIComponent(token)}`;
    }

    return "/login?error=workspace_missing";
  } catch (e) {
    console.error("[resolveAuthenticatedEntryPath]", e);
    return "/login";
  }
}

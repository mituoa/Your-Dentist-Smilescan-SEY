import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { removePendingLicenseUploads } from "@/lib/register-signup-helpers";

export type RollbackIncompleteRegistrationInput = {
  admin: SupabaseClient;
  authUserId: string;
  /** Einladungs-Flow: kein Löschen von Team-Workspace/Billing/Contracts per workspace_id. */
  inviteFlow: boolean;
  /** Solo: bekannte Workspace-ID aus Membership; sonst wird vor deleteUser einmal nachgelesen. */
  workspaceIdHint?: string | null;
  licensePaths: string[];
};

/**
 * Nach fehlgeschlagenem Register-Setup (nach `auth.signUp`, bevor der Flow vollständig persistiert ist):
 * Storage-Pending bereinigen, DB-Teilzustände für **Solo-Workspaces** zurücknehmen, Auth-User löschen.
 *
 * Invite: nur Pending-Uploads + `deleteUser` — Team-`workspace_billing` / Workspace bleiben unangetastet.
 */
export async function rollbackIncompleteRegistrationAfterFailure(
  input: RollbackIncompleteRegistrationInput
): Promise<void> {
  const { admin, authUserId, inviteFlow, licensePaths } = input;
  if (licensePaths.length > 0) {
    await removePendingLicenseUploads(admin, licensePaths);
  }

  if (!authUserId) return;

  let workspaceId =
    typeof input.workspaceIdHint === "string" && input.workspaceIdHint.length > 0
      ? input.workspaceIdHint
      : null;

  if (!inviteFlow && !workspaceId) {
    const { data: wm, error: wmErr } = await admin
      .from("workspace_members")
      .select("workspace_id")
      .eq("user_id", authUserId)
      .limit(1)
      .maybeSingle();
    if (wmErr) {
      console.error("[rollbackIncompleteRegistration] membership lookup", wmErr.message);
    }
    workspaceId = wm?.workspace_id ?? null;
  }

  if (!inviteFlow && workspaceId) {
    const { error: bErr } = await admin.from("workspace_billing").delete().eq("workspace_id", workspaceId);
    if (bErr) {
      console.error("[rollbackIncompleteRegistration] workspace_billing delete", bErr.message);
    }
    const { error: cErr } = await admin.from("workspace_contracts").delete().eq("workspace_id", workspaceId);
    if (cErr) {
      console.error("[rollbackIncompleteRegistration] workspace_contracts delete", cErr.message);
    }
  }

  const { error: delUserErr } = await admin.auth.admin.deleteUser(authUserId);
  if (delUserErr) {
    console.error("[rollbackIncompleteRegistration] auth.admin.deleteUser", delUserErr.message);
  }

  if (!inviteFlow && workspaceId) {
    const { error: wErr } = await admin.from("workspaces").delete().eq("id", workspaceId);
    if (wErr) {
      console.error("[rollbackIncompleteRegistration] workspaces delete", wErr.message);
    }
  }
}

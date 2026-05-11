import { createAdminClient } from "@/lib/supabase/admin";

/** Einladung laden (nur lesen) für `/accept-invite` — kein Join, kein Statuswechsel. */

export type LoadedInvitation = {
  id: string;
  email: string;
  workspaceId: string;
  workspaceName: string;
  status: string;
  expiresAt: string;
  token: string;
  role: "doctor" | "team";
};

type InvitationRow = {
  id: string;
  email: string;
  workspace_id: string;
  status: string;
  expires_at: string;
  token: string;
  role: string;
  workspaces: { name: string } | { name: string }[] | null;
};

function workspaceNameFromRow(row: InvitationRow): string {
  const w = row.workspaces;
  if (!w) return "Unbekannt";
  if (Array.isArray(w)) return w[0]?.name ?? "Unbekannt";
  return w.name ?? "Unbekannt";
}

/** Lädt Einladung inkl. Praxisname (Admin). Ungültiges Token-Format → kein DB-Roundtrip. */
export async function getInvitationByToken(
  token: string
): Promise<LoadedInvitation | null> {
  const t = (token ?? "").trim();
  if (!t || !/^[a-f0-9]{64}$/i.test(t)) return null;

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("team_invitations")
    .select("id, email, workspace_id, status, expires_at, token, role, workspaces(name)")
    .eq("token", t)
    .maybeSingle();

  if (error) {
    console.error("[getInvitationByToken] event=invite_query_failed");
    return null;
  }

  if (!data) return null;

  const row = data as InvitationRow;
  const role = row.role === "doctor" ? "doctor" : "team";

  return {
    id: row.id,
    email: String(row.email ?? "").trim(),
    workspaceId: row.workspace_id,
    workspaceName: workspaceNameFromRow(row),
    status: row.status,
    expiresAt: row.expires_at,
    token: row.token,
    role,
  };
}

/**
 * Prüft ob bereits ein Auth-User mit dieser E-Mail existiert (Admin listUsers, paginiert).
 * Hinweis: O(n) über Seiten — bei sehr großen User-Basen ggf. durch DB-/RPC-Lookup ersetzen.
 */
export async function findAuthUserIdByEmail(email: string): Promise<string | null> {
  const admin = createAdminClient();
  const normalized = email.trim().toLowerCase();
  if (!normalized) return null;
  let page = 1;
  const perPage = 200;
  const maxPages = 25;

  for (let i = 0; i < maxPages; i++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
    if (error) {
      console.error("[findAuthUserIdByEmail] event=list_users_failed");
      return null;
    }
    const users = data.users;
    const hit = users.find((u) => u.email?.toLowerCase() === normalized);
    if (hit) return hit.id;
    if (users.length < perPage) return null;
    page += 1;
  }

  return null;
}
